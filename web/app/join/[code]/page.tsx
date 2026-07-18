import type { Metadata } from "next";

// Community invite landing page: https://useflipbook.com/join/<code>
//
// This is the tappable, shareable target for community invites (custom-scheme
// links like flipbook:// aren't clickable in iMessage/WhatsApp/email and do
// nothing for people without the app). When universal/app links are verified
// the OS opens the app directly and this page is never seen; otherwise it's the
// graceful fallback — an "Open in Flipbook" deep link plus the raw code.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const title = "Join a community on Flipbook";
  const description = "You've been invited to read together on Flipbook.";
  return {
    title,
    description,
    // Absolute URL resolved via metadataBase (useflipbook.com) so the link
    // unfurls with a preview card when shared.
    openGraph: { title, description, url: `/join/${code}`, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const deepLink = `flipbook://join/${encodeURIComponent(code)}`;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, no optimization needed */}
      <img src="/logo/full-flip-colored.svg" alt="Flipbook" className="mb-10 h-9 w-auto" />

      <div className="card flex w-full max-w-md flex-col items-center gap-5 p-8">
        <span className="inline-flex items-center gap-2 text-sm text-text-muted">
          <span className="pulse-dot" aria-hidden /> Community invite
        </span>

        <h1 className="display text-3xl">Almost there.</h1>

        <p className="text-balance text-text-muted">
          Looks like someone invited you to a Reading Room. Install Flipbook
          first, then come back and tap this link again to join the
          conversation.
        </p>

        <div className="w-full rounded-xl bg-[var(--code-bg)] px-4 py-3 font-mono text-lg tracking-[0.2em] text-text">
          {code}
        </div>

        <a
          href={deepLink}
          className="w-full rounded-full bg-accent px-6 py-3.5 font-semibold text-bg transition-colors hover:bg-accent-strong"
        >
          Open in Flipbook
        </a>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <a
            href="https://testflight.apple.com/join/DYP5aNv5"
            className="flex-1 rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Get Flipbook for iPhone
          </a>
          <a
            href="https://groups.google.com/g/flipbook-test/"
            className="flex-1 rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent"
          >
            Get Flipbook for Android
          </a>
        </div>
      </div>
    </main>
  );
}
