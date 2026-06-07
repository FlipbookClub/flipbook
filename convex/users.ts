import { ConvexError, v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { isBetaInviteRequired, normalizeCode, redeemForUser } from "./invites";

const MAX_DISPLAY_NAME = 50;
const MAX_BIO = 200;

const proStatusValidator = v.union(
  v.literal("free"),
  v.literal("active"),
  v.literal("expired"),
);

const notificationPrefsValidator = v.object({
  chapterDrops: v.boolean(),
  reactionReplies: v.boolean(),
});

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.string(),
  displayName: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  avatarUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
  genres: v.array(v.string()),
  pushToken: v.optional(v.string()),
  proSubscriptionStatus: proStatusValidator,
  proExpiresAt: v.optional(v.number()),
  notificationPrefs: v.optional(notificationPrefsValidator),
  createdAt: v.number(),
  lastActiveAt: v.number(),
});

export async function getCurrentUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "unauthorized" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) {
    throw new ConvexError({ code: "user_not_found" });
  }
  return user;
}

export const me = query({
  args: {},
  returns: v.union(v.null(), userValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Live availability check for the onboarding display-name step. Returns
// `available: true` when the name is well-formed and not taken (by another
// user). The current user's own row, if any, never counts as a conflict so
// editing your own name to its current value stays valid.
export const isDisplayNameAvailable = query({
  args: { displayName: v.string() },
  returns: v.object({
    available: v.boolean(),
    reason: v.optional(v.union(v.literal("too_short"), v.literal("too_long"), v.literal("taken"))),
  }),
  handler: async (ctx, args) => {
    const trimmed = args.displayName.trim();
    if (trimmed.length === 0) return { available: false, reason: "too_short" as const };
    if (trimmed.length > MAX_DISPLAY_NAME) return { available: false, reason: "too_long" as const };

    const taken = await ctx.db
      .query("users")
      .withIndex("by_display_name", (q) => q.eq("displayName", trimmed))
      .unique();
    if (!taken) return { available: true };

    const identity = await ctx.auth.getUserIdentity();
    if (identity && taken.clerkId === identity.subject) {
      return { available: true };
    }
    return { available: false, reason: "taken" as const };
  },
});

export const create = mutation({
  args: {
    displayName: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
    genres: v.array(v.string()),
    // Beta access code from the WelcomeScreen. Required + redeemed only when
    // BETA_INVITE_REQUIRED is set (see convex/invites.ts); ignored otherwise.
    inviteCode: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "unauthorized" });
    }
    // Validate the invite up front so a bad code fails before we do any work
    // (final redemption happens after insert, in the same transaction).
    if (isBetaInviteRequired()) {
      const codeUpper = normalizeCode(args.inviteCode ?? "");
      if (!codeUpper) throw new ConvexError({ code: "invite_required" });
    }

    const displayName = args.displayName.trim();
    if (!displayName || displayName.length > MAX_DISPLAY_NAME) {
      throw new ConvexError({ code: "invalid_display_name" });
    }
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (existing) {
      throw new ConvexError({ code: "already_exists" });
    }

    const nameTaken = await ctx.db
      .query("users")
      .withIndex("by_display_name", (q) => q.eq("displayName", displayName))
      .unique();
    if (nameTaken) {
      throw new ConvexError({ code: "display_name_taken" });
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      displayName,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      avatarUrl: args.avatarUrl,
      genres: args.genres,
      proSubscriptionStatus: "free",
      createdAt: now,
      lastActiveAt: now,
    });
    // Redeem the beta code in the same transaction — if it's missing/used this
    // throws and the whole mutation (incl. the insert above) rolls back.
    await redeemForUser(ctx, args.inviteCode, userId);
    return userId;
  },
});

// FR-025: client calls this after RevenueCat reports an entitlement change
// (initial boot, post-purchase, post-restore). Persisting on the user record
// lets server-side gates (e.g. memberships.joinByCode FR-027 limit) check
// without round-tripping RevenueCat.
export const syncProStatus = mutation({
  args: {
    status: v.union(v.literal("free"), v.literal("active"), v.literal("expired")),
    expiresAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      proSubscriptionStatus: args.status,
      proExpiresAt: args.expiresAt,
      lastActiveAt: Date.now(),
    });
    return null;
  },
});

// FR-087: per-type notification opt-outs honored by the push fanouts.
export const updateNotificationPrefs = mutation({
  args: { prefs: notificationPrefsValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await ctx.db.patch(user._id, {
      notificationPrefs: args.prefs,
      lastActiveAt: Date.now(),
    });
    return null;
  },
});

// FR-028: client calls this on app boot once it has a fresh Expo push token.
// Stored on the user record so notification fanouts can look it up.
export const updatePushToken = mutation({
  args: { pushToken: v.union(v.string(), v.null()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const next = args.pushToken ?? undefined;
    if (user.pushToken === next) return null;
    await ctx.db.patch(user._id, {
      pushToken: next,
      lastActiveAt: Date.now(),
    });
    return null;
  },
});

// FR-088: account deletion. Removes the user's Convex footprint so the
// Clerk delete on the client side is the last step. Refuses if the user
// moderates any clubs — the founder forces explicit handling (transfer
// or delete) before they can wipe themselves.
export const deleteSelf = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);

    const moderatedClubs = await ctx.db
      .query("clubs")
      .withIndex("by_moderator", (q) => q.eq("moderatorId", me._id))
      .collect();
    if (moderatedClubs.length > 0) {
      throw new ConvexError({
        code: "moderator_blocks_delete",
        clubCount: moderatedClubs.length,
      });
    }

    // Decrement memberCount on every club the user is in, then delete
    // their memberships.
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();
    for (const m of memberships) {
      const club = await ctx.db.get(m.clubId);
      if (club) {
        await ctx.db.patch(m.clubId, {
          memberCount: Math.max(0, club.memberCount - 1),
        });
      }
      await ctx.db.delete(m._id);
    }

    // Hard-delete the user's reactions. PRD suggested anonymization for
    // continuity, but that needs schema changes and beta-stage users
    // mostly care about scrubbing themselves rather than preserving
    // context for others.
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();
    for (const r of reactions) await ctx.db.delete(r._id);

    const progressRows = await ctx.db
      .query("progress")
      .withIndex("by_user_and_club", (q) => q.eq("userId", me._id))
      .collect();
    for (const p of progressRows) await ctx.db.delete(p._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_sent", (q) => q.eq("userId", me._id))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    await ctx.db.delete(me._id);
    return null;
  },
});

export const update = mutation({
  args: {
    displayName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const patch: Partial<Doc<"users">> = {};

    if (args.displayName !== undefined) {
      const displayName = args.displayName.trim();
      if (!displayName || displayName.length > MAX_DISPLAY_NAME) {
        throw new ConvexError({ code: "invalid_display_name" });
      }
      if (displayName !== user.displayName) {
        const nameTaken = await ctx.db
          .query("users")
          .withIndex("by_display_name", (q) => q.eq("displayName", displayName))
          .unique();
        if (nameTaken && nameTaken._id !== user._id) {
          throw new ConvexError({ code: "display_name_taken" });
        }
      }
      patch.displayName = displayName;
    }
    if (args.firstName !== undefined) patch.firstName = args.firstName.trim();
    if (args.lastName !== undefined) patch.lastName = args.lastName.trim();
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    if (args.bio !== undefined) {
      if (args.bio.length > MAX_BIO) {
        throw new ConvexError({ code: "bio_too_long", max: MAX_BIO });
      }
      patch.bio = args.bio;
    }
    if (args.genres !== undefined) patch.genres = args.genres;

    if (Object.keys(patch).length > 0) {
      patch.lastActiveAt = Date.now();
      await ctx.db.patch(user._id, patch);
    }
    return null;
  },
});
