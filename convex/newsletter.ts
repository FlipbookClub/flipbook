import { v } from "convex/values";

import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
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

const SUBJECT = "I owe you an explanation (and a favour)";

// Inbox preview line. Rendered as a hidden preheader at the top of the HTML
// body, which is where Gmail, Apple Mail and Outlook read it from.
const PREVIEW_TEXT = "A confession, two small favours, and a hint of v2.";

// Identifies the campaign in `newsletterSends`. Bump this (and the copy below)
// for the next send; leaving it unchanged means the broadcast correctly
// treats everyone as already-mailed and does nothing.
const CAMPAIGN = "2026-11-explanation";

// `lead` renders bold ahead of `text` (the numbered favours).
type Block = { lead?: string; text: string };

const BLOCKS: Block[] = [
  { text: "Hi Flipfolk," },
  {
    text: "It’s Moks here, writing from Lagos. Yes, that Moks who disappeared for two months like someone who borrowed money. 😅",
  },
  {
    text: "Confession time: I thought building a startup would be a walk in the park. Turns out building the app is the easy part. Keeping in touch? Marketing? Social media? I’m failing all three, and I’m sorry.",
  },
  {
    text: "But I promise we’ve been cooking. Same mission as day one: helping readers and book clubs connect properly and build stronger reading communities. The pot has been on the fire the whole time. I just forgot to tell you what’s inside.",
  },
  { text: "Now, small favours (I’m not asking for jollof money):" },
  {
    lead: "1. Come read again, and bring a friend.",
    text: "I know life has been lifeing. But open a book, nudge one person, drop a reaction in the margin. Reading alone is fine. Reading together is better.",
  },
  {
    lead: "2. Tell one person about Flipbook.",
    text: "A post on X, LinkedIn or Instagram, or a gentle “you should try this” to your book club. I’m a very bad marketer, so your word means more than my posts ever will.",
  },
  {
    text: "And the gist: Flipbook v2 is coming. I won’t spoil it, but trust me, you’ll like this one. 👀",
  },
  {
    text: "Till then, stay jiggy (it means stay well, stay lively, stay you). And if you have feedback, just reply. It comes straight to me, and I read every one.",
  },
  { text: "Yours intellectually," },
];

const FOOTER_REASON =
  "You're getting this because you signed up for Flipbook.";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildText(): string {
  const body = BLOCKS.map((b) => (b.lead ? `${b.lead} ${b.text}` : b.text));
  return `${body.join("\n\n")}

Victory Moks
Co-founder, Flipbook

---
${FOOTER_REASON} To stop receiving these notes, reply with "unsubscribe"
or email ${REPLY_TO} and I'll take you off the list.`;
}

export function buildHtml(): string {
  // Inline styles only — email clients strip <style> and external CSS.
  // Div-based rather than table-based, matching the shipped welcome email;
  // border-radius degrades to a square card in Outlook desktop, which is fine.
  const body = BLOCKS.map((b) => {
    const lead = b.lead
      ? `<strong style="font-weight:600;">${escapeHtml(b.lead)}</strong> `
      : "";
    return `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${TEXT};">${lead}${escapeHtml(b.text)}</p>`;
  }).join("\n    ");

  // Hidden preheader: shown as the inbox preview, invisible in the open email.
  // The trailing zero-width joiners stop clients padding the preview with the
  // first lines of the body.
  const preheader = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(PREVIEW_TEXT)}${"&#8204;&nbsp;".repeat(60)}</div>`;

  return `<!doctype html><html><head><meta charset="utf-8" /></head><body style="margin:0;padding:0;background:${PAGE_BG};">
  ${preheader}
  <div style="padding:32px 16px;background:${PAGE_BG};">
  <div style="max-width:600px;margin:0 auto;background:${CARD_BG};border-radius:24px;padding:44px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${TEXT};">
    <img src="${LOGO_URL}" alt="Flipbook" width="176" height="42" style="display:block;width:176px;height:auto;margin-bottom:36px;border:0;" />
    ${body}
    <p style="margin:0;font-size:16px;line-height:1.5;color:${TEXT};">Victory Moks<br/>Co-founder, Flipbook</p>
    <p style="margin:32px 0 0;font-size:12px;line-height:1.5;color:${MUTED};">${escapeHtml(FOOTER_REASON)} <a href="mailto:${UNSUBSCRIBE_MAILTO}" style="color:${MUTED};">Unsubscribe</a>.</p>
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
// Every Clerk identity with a primary email, as {id, email}.
//
// The `users` table stores clerkId and no email, so Clerk is the only source
// for an address. Shared by the newsletter and by the weekly re-engagement
// job (convex/reengagement.ts) rather than paged twice.
export async function fetchClerkAccounts(): Promise<
  Array<{ id: string; email: string }>
> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    throw new Error("[clerk] CLERK_SECRET_KEY not set on this deployment.");
  }

  const out: Array<{ id: string; email: string }> = [];
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
      throw new Error(`[clerk] list failed (${res.status}): ${detail}`);
    }

    const page = (await res.json()) as Array<{
      id: string;
      primary_email_address_id: string | null;
      email_addresses: Array<{ id: string; email_address: string }>;
    }>;

    for (const user of page) {
      const primary =
        user.email_addresses.find((e) => e.id === user.primary_email_address_id) ??
        user.email_addresses[0];
      if (primary?.email_address) {
        out.push({ id: user.id, email: primary.email_address });
      }
    }

    if (page.length < limit) break;
    offset += limit;
  }
  return out;
}

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

// Every waitlist address (marketing-site signups, reader and creator). A
// different population from Clerk: it includes people who grabbed the install
// links but never made an account. Opt-in via `includeWaitlist` below.
export const listWaitlistEmails = internalQuery({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const rows = await ctx.db.query("waitlist").collect();
    return rows.map((r) => r.email);
  },
});

// Needs CLERK_SECRET_KEY set on the Convex deployment (`npx convex env set`).
//
// onlyAppAccounts (default true) intersects Clerk against the `users` table on
// clerkId, so the result is "people who actually have a Flipbook account",
// not "everyone who ever hit the Clerk signup screen". Pass false to reach
// every Clerk identity instead.
//
// includeWaitlist (default false) adds every `waitlist` address on top, for
// sends meant to reach everyone who has ever signed up, not just accounts.
export const listRecipientEmails = internalAction({
  args: {
    onlyAppAccounts: v.optional(v.boolean()),
    includeWaitlist: v.optional(v.boolean()),
  },
  returns: v.object({
    emails: v.array(v.string()),
    total: v.number(),
    clerkTotal: v.number(),
    skippedNoAppAccount: v.number(),
    waitlistTotal: v.number(),
  }),
  handler: async (ctx, args): Promise<{
    emails: string[];
    total: number;
    clerkTotal: number;
    skippedNoAppAccount: number;
    waitlistTotal: number;
  }> => {
    const onlyAppAccounts = args.onlyAppAccounts ?? true;
    const emails: string[] = [];
    const clerkIdByEmail = await fetchClerkAccounts();
    const clerkTotal = clerkIdByEmail.length;

    let kept = clerkIdByEmail;
    if (onlyAppAccounts) {
      const accountIds = new Set(
        await ctx.runQuery(internal.newsletter.listAccountClerkIds, {}),
      );
      kept = clerkIdByEmail.filter((u) => accountIds.has(u.id));
    }
    for (const u of kept) emails.push(u.email);

    let waitlistTotal = 0;
    if (args.includeWaitlist) {
      const waitlist = await ctx.runQuery(
        internal.newsletter.listWaitlistEmails,
        {},
      );
      waitlistTotal = waitlist.length;
      emails.push(...waitlist);
    }

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
      waitlistTotal,
    };
  },
});

// Everyone already recorded as reached for a campaign.
export const listSentEmails = internalQuery({
  args: { campaign: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("newsletterSends")
      .withIndex("by_campaign_and_email", (q) => q.eq("campaign", args.campaign))
      .collect();
    return rows.map((r) => r.emailLower);
  },
});

// Records one delivery. Idempotent: a second call for the same campaign and
// address is a no-op rather than a duplicate row.
export const recordSend = internalMutation({
  args: { campaign: v.string(), email: v.string(), sentAt: v.number() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const emailLower = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("newsletterSends")
      .withIndex("by_campaign_and_email", (q) =>
        q.eq("campaign", args.campaign).eq("emailLower", emailLower),
      )
      .unique();
    if (existing) return false;
    await ctx.db.insert("newsletterSends", {
      campaign: args.campaign,
      emailLower,
      sentAt: args.sentAt,
    });
    return true;
  },
});

// Every address Resend has accepted a message for under this campaign's
// subject. Shared by the audit and the backfill below.
async function fetchResendSeen(
  apiKey: string,
): Promise<{ seen: Set<string>; probe?: string }> {
  type Row = { id: string; to?: string[] | string; subject?: string };
  const seen = new Set<string>();
  let after: string | undefined;

  // Cursor pagination on the email id, stopping at has_more: false. Capped so
  // a pagination bug can't spin forever.
  for (let pages = 0; pages < 40; pages++) {
    const url =
      `https://api.resend.com/emails?limit=100` +
      (after ? `&after=${encodeURIComponent(after)}` : "");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const raw = await res.text();
    if (!res.ok) {
      return { seen, probe: `status=${res.status} body=${raw.slice(0, 1200)}` };
    }

    const parsed = JSON.parse(raw) as { data?: Row[]; has_more?: boolean };
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
  return { seen };
}

// Seeds `newsletterSends` from Resend's record. Needed once, for the September
// campaign that shipped before the ledger existed: without it the ledger reads
// empty and a re-run would mail all 178 people a second time.
export const backfillFromResend = internalAction({
  args: { campaign: v.optional(v.string()) },
  returns: v.object({ recorded: v.number(), alreadyPresent: v.number() }),
  handler: async (ctx, args): Promise<{
    recorded: number;
    alreadyPresent: number;
  }> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("[newsletter] RESEND_API_KEY not set.");
    const campaign = args.campaign ?? CAMPAIGN;

    const { seen, probe } = await fetchResendSeen(apiKey);
    if (probe) throw new Error(`[newsletter] Resend list failed: ${probe}`);

    let recorded = 0;
    let alreadyPresent = 0;
    for (const email of seen) {
      const inserted: boolean = await ctx.runMutation(
        internal.newsletter.recordSend,
        { campaign, email, sentAt: Date.now() },
      );
      if (inserted) recorded += 1;
      else alreadyPresent += 1;
    }
    console.log(
      `[newsletter] Backfilled ${campaign}: ${recorded} recorded, ${alreadyPresent} already present.`,
    );
    return { recorded, alreadyPresent };
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

    const { seen, probe } = await fetchResendSeen(apiKey);
    if (args.probeOnly || probe) {
      return {
        probe: probe ?? `status=200 seen=${seen.size} for subject "${SUBJECT}"`,
        recipients: 0,
        seenByResend: seen.size,
        missing: [],
      };
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

// The actual broadcast. Sequential, paced, with per-address error capture.
//
// Re-running is safe. Every success is written to `newsletterSends`, and each
// run skips anyone already recorded for the campaign, so the plain command is
// also the retry command: after a partial failure it sends to exactly the
// addresses that did not get through. Sending twice takes a deliberate
// force: true.
//
// Still dry-run first. Nothing is sent, and you get the counts plus the first
// 20 addresses to eyeball:
//   npx convex run newsletter:broadcastMonthlyNewsletter '{"dryRun":true}'
//
// For next month: bump CAMPAIGN and the copy. A new campaign slug has an empty
// ledger, so everyone is in scope again.
//
// `emails` overrides the Clerk lookup entirely, which is how you send to a
// small test group before the real run.
export const broadcastMonthlyNewsletter = internalAction({
  args: {
    dryRun: v.boolean(),
    emails: v.optional(v.array(v.string())),
    onlyAppAccounts: v.optional(v.boolean()),
    includeWaitlist: v.optional(v.boolean()),
    delayMs: v.optional(v.number()),
    campaign: v.optional(v.string()),
    // Escape hatch for a deliberate re-send. Off by default, because the
    // whole point of the ledger is that the obvious command is the safe one.
    force: v.optional(v.boolean()),
  },
  returns: v.object({
    dryRun: v.boolean(),
    recipients: v.number(),
    clerkTotal: v.number(),
    skippedNoAppAccount: v.number(),
    waitlistTotal: v.number(),
    skippedAlreadySent: v.number(),
    sample: v.array(v.string()),
    sent: v.number(),
    failed: v.array(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    dryRun: boolean;
    recipients: number;
    clerkTotal: number;
    skippedNoAppAccount: number;
    waitlistTotal: number;
    skippedAlreadySent: number;
    sample: string[];
    sent: number;
    failed: string[];
  }> => {
    const campaign = args.campaign ?? CAMPAIGN;
    let clerkTotal = 0;
    let skippedNoAppAccount = 0;
    let waitlistTotal = 0;
    let recipients: string[];

    if (args.emails) {
      recipients = args.emails;
    } else {
      const resolved = await ctx.runAction(
        internal.newsletter.listRecipientEmails,
        {
          onlyAppAccounts: args.onlyAppAccounts ?? true,
          includeWaitlist: args.includeWaitlist ?? false,
        },
      );
      recipients = resolved.emails;
      clerkTotal = resolved.clerkTotal;
      skippedNoAppAccount = resolved.skippedNoAppAccount;
      waitlistTotal = resolved.waitlistTotal;
    }

    // Drop anyone the ledger already has for this campaign. This is what makes
    // a re-run safe: after a partial failure the same command retries exactly
    // the addresses that did not get through.
    let skippedAlreadySent = 0;
    if (!args.force) {
      const already = new Set(
        await ctx.runQuery(internal.newsletter.listSentEmails, { campaign }),
      );
      const before = recipients.length;
      recipients = recipients.filter(
        (e) => !already.has(e.trim().toLowerCase()),
      );
      skippedAlreadySent = before - recipients.length;
    }

    const sample = recipients.slice(0, 20);

    if (args.dryRun) {
      console.log(
        `[newsletter] DRY RUN. ${recipients.length} to send, nothing sent. ` +
          `Clerk identities: ${clerkTotal}, no app account: ${skippedNoAppAccount}, ` +
          `waitlist rows: ${waitlistTotal}, ` +
          `already sent this campaign: ${skippedAlreadySent}.`,
      );
      return {
        dryRun: true,
        recipients: recipients.length,
        clerkTotal,
        skippedNoAppAccount,
        waitlistTotal,
        skippedAlreadySent,
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
        if (ok) {
          sent += 1;
          // Record immediately rather than batching at the end, so a crash or
          // timeout mid-run still leaves an accurate ledger to resume from.
          await ctx.runMutation(internal.newsletter.recordSend, {
            campaign,
            email,
            sentAt: Date.now(),
          });
        } else {
          failed.push(email);
        }
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
      waitlistTotal,
      skippedAlreadySent,
      sample,
      sent,
      failed,
    };
  },
});
