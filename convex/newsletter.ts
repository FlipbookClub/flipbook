import { v } from "convex/values";

import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Monthly newsletter to existing Flipbook users. Same Resend setup as the
// welcome email (convex/email.ts) and the invite broadcast (convex/invites.ts):
//   RESEND_API_KEY      — required; without it we log and no-op.
//   WAITLIST_FROM_EMAIL — optional; defaults to hello@useflipbook.com. The
//                         domain must be verified in Resend or the send 400s.
//   CLERK_SECRET_KEY    — required only by listRecipientEmails below. The
//                         Convex `users` table stores clerkId, NOT email, so
//                         Clerk is the only source of truth for "everyone who
//                         actually has an account."
//
// This is MARKETING mail, not transactional, which is the one way it differs
// from every other send in this codebase. It therefore carries an unsubscribe
// affordance (visible footer + List-Unsubscribe header). See the note above
// UNSUBSCRIBE_MAILTO.

const DEFAULT_FROM = "Moks at Flipbook <hello@useflipbook.com>";
// hello@useflipbook.com is live via Cloudflare Email Routing.
const REPLY_TO = "hello@useflipbook.com";

// Interim unsubscribe. P5-T5 (per-user `emailPrefs` + honored unsubscribe) is
// not built yet, so there is no preference row to flip and no one-click
// endpoint to point at. A mailto keeps this lawful and honest in the meantime:
// it must be actioned by hand until P5-T5 lands, at which point this becomes a
// real URL and the handling stops being manual.
const UNSUBSCRIBE_MAILTO = "hello@useflipbook.com?subject=Unsubscribe";

const LOGO_URL = "https://www.useflipbook.com/logo/wordmark-light.png";

// Resend rate-limits at roughly 2 requests/second. The first 178-recipient run
// looped with no pacing and lost 24 addresses to HTTP 429, so the broadcast
// now sleeps between sends. 600ms leaves headroom under the limit and costs
// under two minutes across the whole list.
const DEFAULT_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Brand tokens (design-tokens.json), matched against the Figma newsletter
// frame (node 1062-13651) by sampling the rendered design directly.
const PAGE_BG = "#e8f5ff";
const CARD_BG = "#ffffff";
const TEXT = "#3b3a6d"; // brand.deepIndigo.900 / text.primary
const MUTED = "#989898"; // text.muted

const SUBJECT = "A new month, a new chapter";

const PARAGRAPHS: string[] = [
  "Hello Flipfolk,",
  "September is here!",
  "I hope the new month is meeting you well. Before we get too far into it, I wanted to pop in and say thank you.",
  "Thank you for being here, for opening Flipbook, reading with your people, sending us feedback, and helping us build this thing one page at a time. We're still early, but seeing people actually use Flipbook to read together makes all the late nights, bugs, fixes, and endless tweaks worth it.",
  "This month, I hope you find a book that pulls you in completely.",
  "One that makes you laugh, keeps you up a little too late, teaches you something new, or has you rushing to tell someone, “You need to read this.”",
  "And when you find it, don't keep it to yourself. Bring your people along.",
  "Here's to more books, more conversations, and more pages turned together.",
  "Happy reading, Flipfolk.",
  "Stay jiggy,",
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildText(): string {
  return `${PARAGRAPHS.join("\n\n")}

Victory Moks
Co-founder, Flipbook

---
You're getting this because you have a Flipbook account. To stop receiving
these monthly notes, reply with "unsubscribe" or email ${REPLY_TO} and I'll
take you off the list.`;
}

export function buildHtml(): string {
  // Inline styles only — email clients strip <style> and external CSS.
  // Div-based rather than table-based, matching the shipped welcome email;
  // border-radius degrades to a square card in Outlook desktop, which is fine.
  const body = PARAGRAPHS.map(
    (p) =>
      `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${TEXT};">${escapeHtml(p)}</p>`,
  ).join("\n    ");

  return `<!doctype html><html><body style="margin:0;padding:0;background:${PAGE_BG};">
  <div style="padding:32px 16px;background:${PAGE_BG};">
  <div style="max-width:600px;margin:0 auto;background:${CARD_BG};border-radius:24px;padding:44px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT};">
    <img src="${LOGO_URL}" alt="Flipbook" width="176" height="42" style="display:block;width:176px;height:auto;margin-bottom:36px;border:0;" />
    ${body}
    <p style="margin:0;font-size:16px;line-height:1.5;color:${TEXT};">Victory Moks<br/>Co-founder, Flipbook</p>
    <p style="margin:32px 0 0;font-size:12px;line-height:1.5;color:${MUTED};">You're getting this because you have a Flipbook account. <a href="mailto:${UNSUBSCRIBE_MAILTO}" style="color:${MUTED};">Unsubscribe</a>.</p>
  </div>
  </div></body></html>`;
}

// Sends the newsletter to one address. Kept separate from the broadcast so a
// test send to yourself is a one-liner from the dashboard or CLI:
//   npx convex run newsletter:sendMonthlyNewsletter '{"email":"you@example.com"}'
export const sendMonthlyNewsletter = internalAction({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[newsletter] RESEND_API_KEY not set — skipping send for",
        args.email,
      );
      return false;
    }

    const from = process.env.WAITLIST_FROM_EMAIL ?? DEFAULT_FROM;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.email],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        text: buildText(),
        html: buildHtml(),
        headers: {
          "List-Unsubscribe": `<mailto:${UNSUBSCRIBE_MAILTO}>`,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        `[newsletter] Resend send failed (${res.status}) for ${args.email}: ${detail}`,
      );
      return false;
    }
    return true;
  },
});

// Pulls every account's primary email address from Clerk.
//
// Why Clerk and not the database: `users` in convex/schema.ts stores clerkId,
// displayName, firstName, lastName — no email field at all. Convex genuinely
// does not know anyone's address. The `waitlist` table has emails but is a
// different population (marketing-site signups, including people who never
// installed, and missing anyone who signed up through Apple/Google without
// ever touching the waitlist form).
//
// Every clerkId that has an actual Flipbook account row. Used to filter the
// Clerk list down to people who finished signing up in the app: Clerk also
// holds abandoned signups (authenticated, never completed onboarding, so no
// `users` row), and "thank you for opening Flipbook, reading with your people"
// reads badly to someone who never got that far.
export const listAccountClerkIds = internalQuery({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => u.clerkId);
  },
});

// Needs CLERK_SECRET_KEY set on the Convex deployment (`npx convex env set`).
//
// onlyAppAccounts (default true) intersects Clerk against the `users` table on
// clerkId, so the result is "people who actually have a Flipbook account",
// not "everyone who ever hit the Clerk signup screen". Pass false to reach
// every Clerk identity instead.
export const listRecipientEmails = internalAction({
  args: { onlyAppAccounts: v.optional(v.boolean()) },
  returns: v.object({
    emails: v.array(v.string()),
    total: v.number(),
    clerkTotal: v.number(),
    skippedNoAppAccount: v.number(),
  }),
  handler: async (ctx, args): Promise<{
    emails: string[];
    total: number;
    clerkTotal: number;
    skippedNoAppAccount: number;
  }> => {
    const onlyAppAccounts = args.onlyAppAccounts ?? true;
    const secret = process.env.CLERK_SECRET_KEY;
    if (!secret) {
      throw new Error(
        "[newsletter] CLERK_SECRET_KEY not set on this Convex deployment.",
      );
    }

    const emails: string[] = [];
    const clerkIdByEmail: Array<{ id: string; email: string }> = [];
    const limit = 100;
    let offset = 0;

    // Clerk caps `limit` at 500; 100 keeps each response small.
    for (;;) {
      const res = await fetch(
        `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-created_at`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`[newsletter] Clerk list failed (${res.status}): ${detail}`);
      }

      const page = (await res.json()) as Array<{
        id: string;
        primary_email_address_id: string | null;
        email_addresses: Array<{ id: string; email_address: string }>;
      }>;

      for (const user of page) {
        const primary =
          user.email_addresses.find(
            (e) => e.id === user.primary_email_address_id,
          ) ?? user.email_addresses[0];
        if (primary?.email_address) {
          clerkIdByEmail.push({ id: user.id, email: primary.email_address });
        }
      }

      if (page.length < limit) break;
      offset += limit;
    }

    const clerkTotal = clerkIdByEmail.length;

    let kept = clerkIdByEmail;
    if (onlyAppAccounts) {
      const accountIds = new Set(
        await ctx.runQuery(internal.newsletter.listAccountClerkIds, {}),
      );
      kept = clerkIdByEmail.filter((u) => accountIds.has(u.id));
    }
    for (const u of kept) emails.push(u.email);

    // Dedupe case-insensitively; the same human can hold two Clerk accounts.
    const seen = new Set<string>();
    const deduped = emails.filter((e) => {
      const key = e.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      emails: deduped,
      total: deduped.length,
      clerkTotal,
      skippedNoAppAccount: clerkTotal - kept.length,
    };
  },
});

// Which recipients does Resend have no delivery record for? Convex only keeps
// a rolling log window, so when a broadcast reports failures the per-address
// error lines can age out before they're read. Resend is the durable record.
//
// Returns the recipients Resend has never accepted a message for, which is the
// exact set to retry. `probeOnly` returns the raw first page instead, for
// checking the response shape when the API changes under us.
export const auditRecentSends = internalAction({
  args: {
    onlyAppAccounts: v.optional(v.boolean()),
    probeOnly: v.optional(v.boolean()),
  },
  returns: v.object({
    probe: v.optional(v.string()),
    recipients: v.number(),
    seenByResend: v.number(),
    missing: v.array(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    probe?: string;
    recipients: number;
    seenByResend: number;
    missing: string[];
  }> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("[newsletter] RESEND_API_KEY not set.");

    type Row = { id: string; to?: string[] | string; subject?: string };
    const seen = new Set<string>();
    let after: string | undefined;
    let pages = 0;

    // Cursor pagination on the email id, stopping at has_more: false. Capped so
    // a pagination bug can't spin forever.
    for (; pages < 40; pages++) {
      const url =
        `https://api.resend.com/emails?limit=100` +
        (after ? `&after=${encodeURIComponent(after)}` : "");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const raw = await res.text();

      if (args.probeOnly || !res.ok) {
        return {
          probe: `status=${res.status} body=${raw.slice(0, 1200)}`,
          recipients: 0,
          seenByResend: 0,
          missing: [],
        };
      }

      const parsed = JSON.parse(raw) as {
        data?: Row[];
        has_more?: boolean;
      };
      const rows = parsed.data ?? [];

      for (const row of rows) {
        // Scope to this campaign so welcome and invite mail doesn't count.
        if (row.subject !== SUBJECT) continue;
        const to = row.to;
        const list = Array.isArray(to) ? to : to ? [to] : [];
        for (const addr of list) seen.add(addr.trim().toLowerCase());
      }

      if (!parsed.has_more || rows.length === 0) break;
      after = rows[rows.length - 1]?.id;
      if (!after) break;
    }

    const { emails } = await ctx.runAction(
      internal.newsletter.listRecipientEmails,
      { onlyAppAccounts: args.onlyAppAccounts ?? true },
    );
    const missing = emails.filter((e) => !seen.has(e.trim().toLowerCase()));

    return {
      recipients: emails.length,
      seenByResend: seen.size,
      missing,
    };
  },
});

// The actual broadcast. Sequential with per-address error capture, matching
// invites.mintAndSendInvitesForEmails — the pattern that already broadcast to
// the whole waitlist without tripping Resend's rate limit.
//
// ALWAYS dry-run first. With dryRun: true nothing is sent; you get back the
// recipient count and the first 20 addresses so the list can be eyeballed:
//   npx convex run newsletter:broadcastMonthlyNewsletter '{"dryRun":true}'
//
// `emails` overrides the Clerk lookup entirely, which is how you send to a
// small test group before the real run.
export const broadcastMonthlyNewsletter = internalAction({
  args: {
    dryRun: v.boolean(),
    emails: v.optional(v.array(v.string())),
    onlyAppAccounts: v.optional(v.boolean()),
    delayMs: v.optional(v.number()),
  },
  returns: v.object({
    dryRun: v.boolean(),
    recipients: v.number(),
    clerkTotal: v.number(),
    skippedNoAppAccount: v.number(),
    sample: v.array(v.string()),
    sent: v.number(),
    failed: v.array(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    dryRun: boolean;
    recipients: number;
    clerkTotal: number;
    skippedNoAppAccount: number;
    sample: string[];
    sent: number;
    failed: string[];
  }> => {
    let clerkTotal = 0;
    let skippedNoAppAccount = 0;
    let recipients: string[];

    if (args.emails) {
      recipients = args.emails;
    } else {
      const resolved = await ctx.runAction(
        internal.newsletter.listRecipientEmails,
        { onlyAppAccounts: args.onlyAppAccounts ?? true },
      );
      recipients = resolved.emails;
      clerkTotal = resolved.clerkTotal;
      skippedNoAppAccount = resolved.skippedNoAppAccount;
    }

    const sample = recipients.slice(0, 20);

    if (args.dryRun) {
      console.log(
        `[newsletter] DRY RUN. ${recipients.length} recipients, nothing sent. ` +
          `Clerk identities: ${clerkTotal}, skipped for having no app account: ${skippedNoAppAccount}.`,
      );
      return {
        dryRun: true,
        recipients: recipients.length,
        clerkTotal,
        skippedNoAppAccount,
        sample,
        sent: 0,
        failed: [],
      };
    }

    const delayMs = args.delayMs ?? DEFAULT_DELAY_MS;
    let sent = 0;
    const failed: string[] = [];
    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i].trim();
      if (!email) continue;
      if (i > 0 && delayMs > 0) await sleep(delayMs);
      try {
        const ok: boolean = await ctx.runAction(
          internal.newsletter.sendMonthlyNewsletter,
          { email },
        );
        if (ok) sent += 1;
        else failed.push(email);
      } catch (err) {
        console.error(`[newsletter] Failed for ${email}:`, err);
        failed.push(email);
      }
    }

    console.log(`[newsletter] Sent ${sent}/${recipients.length}.`);
    return {
      dryRun: false,
      recipients: recipients.length,
      clerkTotal,
      skippedNoAppAccount,
      sample,
      sent,
      failed,
    };
  },
});
