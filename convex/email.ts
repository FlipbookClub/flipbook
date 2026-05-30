import { v } from "convex/values";

import { internalAction } from "./_generated/server";

// Welcome email for new waitlist signups. Scheduled (not awaited) from the
// /waitlist HTTP handler so the form response never blocks on email latency,
// and only for genuinely new rows so re-submits don't re-send.
//
// Sends via Resend's REST API — `fetch` is available in the default Convex
// runtime, so no "use node" is needed. Two env vars drive it:
//   RESEND_API_KEY      — required; without it we log and no-op (so the
//                         function deploys cleanly before the key is set).
//   WAITLIST_FROM_EMAIL — optional; defaults to hello@useflipbook.com. The
//                         domain must be verified in Resend or the send 400s.
//
// Copy is from docs/waitlist-landing-page-copy-v4.md ("Welcome email (T+0)").

const DEFAULT_FROM = "Moks at Flipbook <hello@useflipbook.com>";
// Replies route to a real inbox: useflipbook.com has no MX/mailbox yet, so
// hello@ can send but can't receive. Temporary until the Zoho hello@ mailbox
// is live — then switch this back to hello@useflipbook.com.
const REPLY_TO = "useflipbook@gmail.com";
const SUBJECT = "You're on the list — one quick question";

function buildText(audience: "reader" | "creator"): string {
  const creatorLine =
    audience === "creator"
      ? "\n\nYou flagged that you're writing something serial — you're on the creator list too. I'll reach out about the private creator beta separately.\n"
      : "";
  return `Hey there 👋, Moks here. Real human, sending this from Lagos.

You're on the Flipbook waitlist, and I'm glad you are. I'll send your invite the day the beta opens.${creatorLine}

Before launch, I'd love to know: what's the last book you finished, and what do you wish your current book-club setup did better? Just hit reply, even one sentence helps.

Victory Moks
Designer & Co-founder, Flipbook`;
}

function buildHtml(audience: "reader" | "creator"): string {
  const creatorBlock =
    audience === "creator"
      ? `<p style="margin:0 0 20px;color:#3b3a6d;font-size:16px;line-height:1.6;">You flagged that you're writing something serial — you're on the creator list too. I'll reach out about the private creator beta separately.</p>`
      : "";
  // Inline styles only — email clients strip <style>/external CSS. Light,
  // restrained, personal: this should read like a note, not a campaign.
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f3e3;">
  <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3a6d;">
    <img src="https://www.useflipbook.com/logo/wordmark-light.png" alt="Flipbook" width="150" height="36" style="display:block;width:150px;height:auto;margin-bottom:28px;border:0;" />
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Hey there 👋, Moks here. Real human, sending this from Lagos.</p>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">You're on the Flipbook waitlist, and I'm glad you are. I'll send your invite the day the beta opens.</p>
    ${creatorBlock}
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Before launch, I'd love to know: <strong>what's the last book you finished, and what do you wish your current book-club setup did better?</strong> Just hit reply, even one sentence helps.</p>
    <p style="margin:28px 0 0;font-size:16px;line-height:1.5;">Victory Moks<br/><span style="color:#6b6a93;font-size:14px;">Designer &amp; Co-founder, Flipbook</span></p>
  </div></body></html>`;
}

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    audience: v.union(v.literal("reader"), v.literal("creator")),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[welcome-email] RESEND_API_KEY not set — skipping send for",
        args.email,
      );
      return null;
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
        text: buildText(args.audience),
        html: buildHtml(args.audience),
      }),
    });

    if (!res.ok) {
      // Log loudly but don't throw — the signup itself already succeeded; a
      // failed welcome email shouldn't surface as an error anywhere user-facing.
      const detail = await res.text().catch(() => "");
      console.error(
        `[welcome-email] Resend send failed (${res.status}) for ${args.email}: ${detail}`,
      );
    }
    return null;
  },
});
