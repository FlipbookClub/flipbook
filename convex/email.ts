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
// Reader audience gets the real install links immediately (beta is open,
// self-serve). Creator audience is still a genuine waitlist for the private
// creator beta, so it keeps the "I'll reach out separately" framing.

const DEFAULT_FROM = "Moks at Flipbook <hello@useflipbook.com>";
// hello@useflipbook.com is live via Cloudflare Email Routing.
const REPLY_TO = "hello@useflipbook.com";

const IOS_LINK = "https://testflight.apple.com/join/DYP5aNv5";
const ANDROID_GROUP_LINK = "https://groups.google.com/g/flipbook-test/";
const ANDROID_STORE_LINK = "https://play.google.com/store/apps/details?id=com.flipbook.club";
const ANDROID_WEB_OPT_IN_LINK = "https://play.google.com/apps/testing/com.flipbook.club";

function subjectFor(audience: "reader" | "creator"): string {
  return audience === "reader"
    ? "Here's how to get Flipbook"
    : "You're on the creator list — one quick question";
}

function buildText(audience: "reader" | "creator"): string {
  if (audience === "reader") {
    return `Hey there, Moks here. Real human, sending this from Lagos.

Thanks for grabbing the Flipbook links. The beta is open, no invite code needed. Here's how to get in:

ON IPHONE
1. Install TestFlight from the App Store if you don't have it already.
2. Open this link: ${IOS_LINK}
3. Tap Accept, then Install.
4. Open Flipbook and tap "Let me in."

ON ANDROID
1. Join our tester group (about ten seconds): ${ANDROID_GROUP_LINK}
2. Tap "Join group."
3. Open the Play Store: ${ANDROID_STORE_LINK}
4. Can't install yet? Use the web opt-in link instead: ${ANDROID_WEB_OPT_IN_LINK}
5. Open Flipbook and tap "Let me in."

Free to join, free forever for founding clubs. If anything isn't working, just reply, I read every message.

Victory Moks
Designer & Co-founder, Flipbook`;
  }

  return `Hey there 👋, Moks here. Real human, sending this from Lagos.

You flagged that you're writing something serial — you're on the creator list. I'll reach out about the private creator beta separately.

Before then, I'd love to know: what are you working on, and what do you wish your current publishing setup did better? Just hit reply, even one sentence helps.

Victory Moks
Designer & Co-founder, Flipbook`;
}

function buildHtml(audience: "reader" | "creator"): string {
  // Inline styles only — email clients strip <style>/external CSS. Light,
  // restrained, personal: this should read like a note, not a campaign.
  if (audience === "reader") {
    return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f3e3;">
  <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3a6d;">
    <img src="https://www.useflipbook.com/logo/wordmark-light.png" alt="Flipbook" width="150" height="36" style="display:block;width:150px;height:auto;margin-bottom:28px;border:0;" />
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Hey there, Moks here. Real human, sending this from Lagos.</p>
    <p style="margin:0 0 28px;font-size:16px;line-height:1.6;">Thanks for grabbing the Flipbook links. The beta is open, no invite code needed. Here's how to get in:</p>

    <p style="margin:0 0 6px;font-size:16px;line-height:1.3;font-weight:600;">📱 On iPhone</p>
    <ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.5;">
      <li>Install <strong>TestFlight</strong> from the App Store if you don't have it already.</li>
      <li>Open this <a href="${IOS_LINK}" style="color:#3b3a6d;">TestFlight link</a>.</li>
      <li>Tap <strong>Accept</strong>, then <strong>Install</strong>.</li>
      <li>Open Flipbook and tap "Let me in."</li>
    </ol>

    <p style="margin:0 0 6px;font-size:16px;line-height:1.3;font-weight:600;">🤖 On Android</p>
    <ol style="margin:0 0 28px;padding-left:20px;font-size:15px;line-height:1.5;">
      <li>Join our <a href="${ANDROID_GROUP_LINK}" style="color:#3b3a6d;">tester group</a> (about ten seconds).</li>
      <li>Tap "Join group."</li>
      <li>Open the <a href="${ANDROID_STORE_LINK}" style="color:#3b3a6d;">Play Store</a>.</li>
      <li>Can't install yet? Use the <a href="${ANDROID_WEB_OPT_IN_LINK}" style="color:#3b3a6d;">web opt-in link</a> instead.</li>
      <li>Open Flipbook and tap "Let me in."</li>
    </ol>

    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Free to join, free forever for founding clubs. If anything isn't working, just reply, I read every message.</p>
    <p style="margin:28px 0 0;font-size:16px;line-height:1.5;">Victory Moks<br/><span style="color:#6b6a93;font-size:14px;">Designer &amp; Co-founder, Flipbook</span></p>
  </div></body></html>`;
  }

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f3e3;">
  <div style="max-width:520px;margin:0 auto;padding:40px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3b3a6d;">
    <img src="https://www.useflipbook.com/logo/wordmark-light.png" alt="Flipbook" width="150" height="36" style="display:block;width:150px;height:auto;margin-bottom:28px;border:0;" />
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Hey there 👋, Moks here. Real human, sending this from Lagos.</p>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">You flagged that you're writing something serial — you're on the creator list. I'll reach out about the private creator beta separately.</p>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Before then, I'd love to know: <strong>what are you working on, and what do you wish your current publishing setup did better?</strong> Just hit reply, even one sentence helps.</p>
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
        subject: subjectFor(args.audience),
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
