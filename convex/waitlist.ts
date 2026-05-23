import { ConvexError, v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

// RFC-5322-ish; intentionally permissive — we'd rather accept a valid edge
// case than drop a real signup. Real validation happens on the confirmation
// email bouncing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAIL = 254;
const MAX_QUALIFIER = 500;
const MAX_LINK = 500;
const MAX_SOURCE = 200;
const MAX_REFERRER = 500;
const MAX_USER_AGENT = 500;

function clamp(s: string | undefined, max: number): string | undefined {
  if (!s) return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Insert (or update) a waitlist signup. Called from the public HTTP endpoint
 * in convex/http.ts — never expose this directly to clients, because the HTTP
 * layer handles CORS, IP hashing, and rate-limiting before we get here.
 *
 * Dedup is on emailLower: if the email already exists we patch the existing
 * row instead of creating a second. This is by design — the GTM playbook
 * expects re-submissions when readers upgrade to the creator waitlist.
 */
export const recordSignup = internalMutation({
  args: {
    email: v.string(),
    audience: v.union(v.literal("reader"), v.literal("creator")),
    qualifier: v.optional(v.string()),
    creatorLink: v.optional(v.string()),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
  },
  returns: v.object({
    waitlistId: v.id("waitlist"),
    isNew: v.boolean(),
    audience: v.union(v.literal("reader"), v.literal("creator")),
  }),
  handler: async (ctx, args) => {
    const rawEmail = args.email.trim();
    if (!rawEmail || rawEmail.length > MAX_EMAIL || !EMAIL_RE.test(rawEmail)) {
      throw new ConvexError({ code: "invalid_email" });
    }
    const emailLower = rawEmail.toLowerCase();

    const qualifier = clamp(args.qualifier, MAX_QUALIFIER);
    const creatorLink = clamp(args.creatorLink, MAX_LINK);
    const source = clamp(args.source, MAX_SOURCE);
    const referrer = clamp(args.referrer, MAX_REFERRER);
    const userAgent = clamp(args.userAgent, MAX_USER_AGENT);

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("emailLower", emailLower))
      .unique();

    if (existing) {
      // Patch in-place. Only widen audience (reader → creator), never narrow.
      const audience =
        existing.audience === "creator" || args.audience === "creator"
          ? ("creator" as const)
          : ("reader" as const);
      await ctx.db.patch(existing._id, {
        email: rawEmail,
        audience,
        qualifier: qualifier ?? existing.qualifier,
        creatorLink: creatorLink ?? existing.creatorLink,
        source: source ?? existing.source,
        referrer: referrer ?? existing.referrer,
        userAgent: userAgent ?? existing.userAgent,
      });
      return { waitlistId: existing._id, isNew: false, audience };
    }

    const waitlistId = await ctx.db.insert("waitlist", {
      email: rawEmail,
      emailLower,
      audience: args.audience,
      qualifier,
      creatorLink,
      source,
      referrer,
      userAgent,
      ipHash: args.ipHash,
      createdAt: Date.now(),
    });
    return { waitlistId, isNew: true, audience: args.audience };
  },
});

/**
 * Public count for the landing page — "Join 847 readers already on the list."
 * Safe to expose; returns a single integer and nothing identifiable.
 */
export const publicCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // Counts are fine to do via collect for a pre-launch table that's
    // bounded by audience size. Revisit if we ever cross ~10k signups.
    const rows = await ctx.db.query("waitlist").collect();
    return rows.length;
  },
});
