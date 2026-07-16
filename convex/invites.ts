import { ConvexError, v } from "convex/values";

import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { generateInviteCode } from "./lib/inviteCode";

const CODE_LENGTH = 8;

// Beta gating is OFF unless BETA_INVITE_REQUIRED is set in the Convex env. When
// off, the WelcomeScreen accepts anything and account creation doesn't require a
// code — so dev/pre-beta is frictionless. Flip it on (any non-empty value) when
// the closed beta opens.
export function isBetaInviteRequired(): boolean {
  return !!process.env.BETA_INVITE_REQUIRED;
}

// Normalize user-typed codes: strip spaces/dashes, uppercase.
export function normalizeCode(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

async function findByCode(
  ctx: MutationCtx,
  codeUpper: string,
): Promise<Doc<"inviteCodes"> | null> {
  return await ctx.db
    .query("inviteCodes")
    .withIndex("by_code", (q) => q.eq("codeUpper", codeUpper))
    .unique();
}

// Validate + redeem a code for a freshly-created user, inside an existing
// mutation transaction (called from users.create). No-op when gating is off.
// Throws ConvexError on a missing/already-used code so the surrounding mutation
// rolls back and the account isn't created.
export async function redeemForUser(
  ctx: MutationCtx,
  rawCode: string | undefined,
  userId: Id<"users">,
): Promise<void> {
  if (!isBetaInviteRequired()) return;
  const codeUpper = normalizeCode(rawCode ?? "");
  if (!codeUpper) throw new ConvexError({ code: "invite_required" });
  const row = await findByCode(ctx, codeUpper);
  if (!row) throw new ConvexError({ code: "invite_invalid" });
  if (row.redeemedByUserId) throw new ConvexError({ code: "invite_already_used" });
  await ctx.db.patch(row._id, { redeemedByUserId: userId, redeemedAt: Date.now() });
}

// Public, unauthenticated — the WelcomeScreen calls this before sign-up. Returns
// whether a code is usable. When gating is off, everything is valid.
export const check = query({
  args: { code: v.string() },
  returns: v.object({
    valid: v.boolean(),
    reason: v.optional(
      v.union(v.literal("invalid"), v.literal("already_used"), v.literal("empty")),
    ),
  }),
  handler: async (ctx, args) => {
    if (!isBetaInviteRequired()) return { valid: true };
    const codeUpper = normalizeCode(args.code);
    if (!codeUpper) return { valid: false, reason: "empty" as const };
    const row = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("codeUpper", codeUpper))
      .unique();
    if (!row) return { valid: false, reason: "invalid" as const };
    if (row.redeemedByUserId) return { valid: false, reason: "already_used" as const };
    return { valid: true };
  },
});

// --- Minting (admin / launch ops) ----------------------------------------

async function mintUnique(
  ctx: MutationCtx,
  fields: Pick<Doc<"inviteCodes">, "source" | "email" | "emailLower">,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateInviteCode(CODE_LENGTH);
    const codeUpper = code.toUpperCase();
    const clash = await findByCode(ctx, codeUpper);
    if (clash) continue;
    await ctx.db.insert("inviteCodes", {
      code,
      codeUpper,
      source: fields.source,
      email: fields.email,
      emailLower: fields.emailLower,
      createdAt: Date.now(),
    });
    return code;
  }
  throw new ConvexError({ code: "code_generation_failed" });
}

// Mint a code for a single waitlist email (idempotent — returns the existing
// code if one was already minted for that email).
export const mintForEmail = internalMutation({
  args: { email: v.string() },
  returns: v.object({ code: v.string(), isNew: v.boolean() }),
  handler: async (ctx, args) => {
    const emailLower = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("inviteCodes")
      .withIndex("by_email", (q) => q.eq("emailLower", emailLower))
      .first();
    if (existing) return { code: existing.code, isNew: false };
    const code = await mintUnique(ctx, {
      source: "waitlist",
      email: args.email.trim(),
      emailLower,
    });
    return { code, isNew: true };
  },
});

// Mint N anonymous manual codes (for testers not on the waitlist). Returns the
// codes to hand out. Run from the Convex dashboard.
export const createManualCodes = internalMutation({
  args: { count: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const n = Math.min(Math.max(1, Math.floor(args.count)), 200);
    const out: string[] = [];
    for (let i = 0; i < n; i += 1) {
      out.push(await mintUnique(ctx, { source: "manual", email: undefined, emailLower: undefined }));
    }
    return out;
  },
});

export const markSent = internalMutation({
  args: { code: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await findByCode(ctx, args.code.toUpperCase());
    if (row) await ctx.db.patch(row._id, { sentAt: Date.now() });
    return null;
  },
});

// Waitlist rows that don't yet have an invite code, oldest first.
export const pendingWaitlist = internalQuery({
  args: { limit: v.number() },
  returns: v.array(v.object({ email: v.string(), audience: v.string() })),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("waitlist")
      .withIndex("by_created")
      .order("asc")
      .take(Math.min(Math.max(1, args.limit), 1000));
    const out: Array<{ email: string; audience: string }> = [];
    for (const r of rows) {
      const has = await ctx.db
        .query("inviteCodes")
        .withIndex("by_email", (q) => q.eq("emailLower", r.emailLower))
        .first();
      if (!has) out.push({ email: r.email, audience: r.audience });
    }
    return out;
  },
});

// Launch op: mint + email invite codes to waitlist signups without one yet.
// Run from the Convex dashboard (e.g. mintAndSendInvites({ limit: 50 })).
export const mintAndSendInvites = internalAction({
  args: { limit: v.optional(v.number()) },
  returns: v.object({ sent: v.number() }),
  handler: async (ctx, args) => {
    const pending = await ctx.runQuery(internal.invites.pendingWaitlist, {
      limit: args.limit ?? 100,
    });
    let sent = 0;
    for (const row of pending) {
      const { code, isNew } = await ctx.runMutation(internal.invites.mintForEmail, {
        email: row.email,
      });
      if (!isNew) continue;
      await ctx.runAction(internal.invites.sendInviteEmail, { email: row.email, code });
      await ctx.runMutation(internal.invites.markSent, { code });
      sent += 1;
    }
    return { sent };
  },
});

// Sends a single beta-invite email via Resend (same setup as the welcome email).
export const sendInviteEmail = internalAction({
  args: { email: v.string(), code: v.string() },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[invite-email] RESEND_API_KEY not set — skipping send for", args.email);
      return null;
    }
    const from = process.env.WAITLIST_FROM_EMAIL ?? "Moks at Flipbook <hello@useflipbook.com>";
    const subject = "Your Flipbook beta invite is here";
    const iosLink = "https://testflight.apple.com/join/DYP5aNv5";
    const androidLink = "https://play.google.com/apps/internaltest/4701478982405329917";
    const siteUrl = process.env.CONVEX_SITE_URL ?? "";
    const logoUrl = `${siteUrl}/assets/logo-full-light.png`;
    const appStoreBadgeUrl = `${siteUrl}/assets/badges/app-store.png`;
    const googlePlayBadgeUrl = `${siteUrl}/assets/badges/google-play.png`;

    const text = `Hellooooo, Moks here. The Flipbook beta is open, and you're in.
Your invite code:

  ${args.code}

Getting started takes two minutes:

1. Install the app
   iPhone (App Store / TestFlight): ${iosLink}
   Android (Google Play): ${androidLink}
2. Open the app, tap "Let me in", and enter your code on the welcome screen.
3. Build your first reading community, and bring a friend along. Books are better shared.

You're one of the first people inside, so anything that feels off, confusing, or delightful, I want to hear it. Just hit reply. I read every message.

Happy reading,
Victory Moks
Designer & Co-founder, Flipbook`;

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#3b3a6d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#3b3a6d;padding:45px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fdfdfd;border-radius:32px;">
        <tr><td style="padding:40px 32px;font-family:Raleway,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3a6d;">
          <img src="${logoUrl}" alt="Flipbook" width="140" height="34" style="display:block;width:140px;height:auto;margin-bottom:28px;border:0;" />

          <p style="margin:0 0 4px;font-size:16px;line-height:1.3;">Hellooooo, Moks here. The Flipbook beta is open, and you're in.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.3;">Your invite code:</p>
          <p style="margin:0 0 20px;font-size:20px;line-height:1.1;font-weight:600;letter-spacing:1px;">${args.code}</p>

          <p style="margin:0 0 12px;font-size:16px;line-height:1.3;">Getting started takes two minutes:</p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
            <tr>
              <td style="font-size:16px;line-height:1.3;vertical-align:top;padding-right:6px;">1.</td>
              <td style="font-size:16px;line-height:1.3;">Install the app</td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${iosLink}"><img src="${appStoreBadgeUrl}" alt="Download on the App Store" width="120" height="40" style="display:block;border:0;" /></a>
              </td>
              <td>
                <a href="${androidLink}"><img src="${googlePlayBadgeUrl}" alt="Get it on Google Play" width="135" height="40" style="display:block;border:0;" /></a>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
            <tr>
              <td style="font-size:16px;line-height:1.3;vertical-align:top;padding-right:6px;">2.</td>
              <td style="font-size:16px;line-height:1.3;">Open the app, tap "Let me in", and enter your code on the welcome screen.</td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
            <tr>
              <td style="font-size:16px;line-height:1.3;vertical-align:top;padding-right:6px;">3.</td>
              <td style="font-size:16px;line-height:1.3;">Build your first reading community, and bring a friend along. Books are better shared.</td>
            </tr>
          </table>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.3;">You're one of the first people inside, so anything that feels off, confusing, or delightful, I want to hear it. Just hit reply. I read every message.</p>

          <p style="margin:0;font-size:16px;line-height:1.3;">Happy reading,<br/>Victory Moks<br/><span style="color:#6b6a93;">Designer &amp; Co-founder, Flipbook</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [args.email],
        reply_to: "hello@useflipbook.com",
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[invite-email] Resend failed (${res.status}) for ${args.email}: ${detail}`);
    }
    return null;
  },
});
