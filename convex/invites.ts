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

// Public, unauthenticated — lets WelcomeScreen decide whether to even show
// the invite-code field. Mirrors isBetaInviteRequired() for the client.
export const gatingEnabled = query({
  args: {},
  returns: v.boolean(),
  handler: async () => isBetaInviteRequired(),
});

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

// Follow-up broadcast op: mint (idempotently) + send the invite email to an
// explicit list of addresses, regardless of whether they're on the waitlist.
// Unlike mintAndSendInvites this ALWAYS sends (it's a deliberate re-send /
// follow-up), it just avoids minting a second code for anyone who already
// has one. Run from the Convex dashboard or CLI:
//   mintAndSendInvitesForEmails({ emails: ["a@example.com", ...] })
export const mintAndSendInvitesForEmails = internalAction({
  args: { emails: v.array(v.string()) },
  returns: v.object({ sent: v.number(), failed: v.array(v.string()) }),
  handler: async (ctx, args) => {
    let sent = 0;
    const failed: string[] = [];
    for (const rawEmail of args.emails) {
      const email = rawEmail.trim();
      if (!email) continue;
      try {
        const { code } = await ctx.runMutation(internal.invites.mintForEmail, { email });
        await ctx.runAction(internal.invites.sendInviteEmail, { email, code });
        await ctx.runMutation(internal.invites.markSent, { code });
        sent += 1;
      } catch (err) {
        console.error(`[invite-email] Failed for ${email}:`, err);
        failed.push(email);
      }
    }
    return { sent, failed };
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
    const subject = "Flipbook is open — no code needed, just tap and go";
    const iosLink = "https://testflight.apple.com/join/DYP5aNv5";
    const androidGroupLink = "https://groups.google.com/g/flipbook-test/";
    const androidLink = "https://play.google.com/store/apps/details?id=com.flipbook.club";
    const androidWebTestLink = "https://play.google.com/apps/testing/com.flipbook.club";
    const siteUrl = process.env.CONVEX_SITE_URL ?? "";
    const logoUrl = `${siteUrl}/assets/logo-full-light.png`;

    const text = `Hey there,

Moks here again.

A little while ago, I sent you an invite to the Flipbook beta. Since then, we've made getting started much simpler, so I wanted to send you a quick update.

The good news: you no longer need an invite code. Just install the app, tap "Let me in," and you're in.

ON IPHONE

1. Install TestFlight from the App Store if you don't already have it.
2. Open this TestFlight link: ${iosLink}
3. Tap Accept, then Install.
4. Open Flipbook and tap "Let me in."

ON ANDROID

1. Join our tester group (this only takes about 10 seconds): ${androidGroupLink}
2. Tap "Join group."
3. Then open the Play Store here: ${androidLink}
4. If you don't see an Install button right away, use this opt-in link instead: ${androidWebTestLink}
5. Install Flipbook, open it, and tap "Let me in."

Once you're inside, create your first Reading Room and invite the people you already love reading with, your book club, friends, classmates, colleagues, or family. Anyone can join using the same links above, so feel free to forward this email or simply share the links. After all, books are better when they're shared.

As one of our earliest beta testers, you're helping shape Flipbook from the ground up. If you notice something confusing, run into a bug, or have an idea that could make the experience better, I'd love to hear it. Just reply to this email. Every message comes straight to me, and I read every single one.

Thank you for believing in Flipbook before launch. It means more than you know, and I can't wait to see the Reading Rooms and communities that grow from here.

See you inside.

Warmly,
Victory Moks
Designer & Co-founder, Flipbook`;

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#3b3a6d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#3b3a6d;padding:45px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fdfdfd;border-radius:32px;">
        <tr><td style="padding:40px 32px;font-family:Raleway,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3a6d;">
          <img src="${logoUrl}" alt="Flipbook" width="140" height="34" style="display:block;width:140px;height:auto;margin-bottom:28px;border:0;" />

          <p style="margin:0 0 16px;font-size:16px;line-height:1.4;">Hey there,</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.4;">Moks here again.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.4;">A little while ago, I sent you an invite to the Flipbook beta. Since then, we've made getting started much simpler, so I wanted to send you a quick update.</p>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.4;"><strong>The good news:</strong> you no longer need an invite code. Just install the app, tap <strong>"Let me in,"</strong> and you're in.</p>

          <p style="margin:0 0 6px;font-size:16px;line-height:1.3;font-weight:600;">📱 On iPhone</p>
          <ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.5;">
            <li>Install <strong>TestFlight</strong> from the App Store if you don't already have it.</li>
            <li>Open this <a href="${iosLink}" style="color:#3b3a6d;">TestFlight link</a>.</li>
            <li>Tap <strong>Accept</strong>, then <strong>Install</strong>.</li>
            <li>Open Flipbook and tap <strong>"Let me in."</strong></li>
          </ol>

          <p style="margin:0 0 6px;font-size:16px;line-height:1.3;font-weight:600;">🤖 On Android</p>
          <ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.5;">
            <li>Join our <a href="${androidGroupLink}" style="color:#3b3a6d;">tester group</a> (this only takes about 10 seconds).</li>
            <li>Tap <strong>"Join group."</strong></li>
            <li>Then open the <a href="${androidLink}" style="color:#3b3a6d;">Play Store here</a>.</li>
            <li>If you don't see an Install button right away, use this <a href="${androidWebTestLink}" style="color:#3b3a6d;">opt-in link</a> instead.</li>
            <li>Install Flipbook, open it, and tap <strong>"Let me in."</strong></li>
          </ol>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.4;">Once you're inside, create your first Reading Room and invite the people you already love reading with, your book club, friends, classmates, colleagues, or family. Anyone can join using the same links above, so feel free to forward this email or simply share the links. After all, books are better when they're shared.</p>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.4;">As one of our earliest beta testers, you're helping shape Flipbook from the ground up. If you notice something confusing, run into a bug, or have an idea that could make the experience better, I'd love to hear it. Just reply to this email. Every message comes straight to me, and I read every single one.</p>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.4;">Thank you for believing in Flipbook before launch. It means more than you know, and I can't wait to see the Reading Rooms and communities that grow from here.</p>

          <p style="margin:0 0 20px;font-size:16px;line-height:1.4;">See you inside.</p>

          <p style="margin:0;font-size:16px;line-height:1.3;">Warmly,<br/><strong>Victory Moks</strong><br/><span style="color:#6b6a93;">Designer &amp; Co-founder, Flipbook</span></p>
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
