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

        <h1 className="display text-3xl">You&rsquo;re invited to read together</h1>

        <p className="text-balance text-text-muted">
          Someone invited you to their community on Flipbook. Open the app to join.
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

        <p className="text-sm text-text-subtle">
          Don&rsquo;t have the app yet? Flipbook is in private beta —{" "}
          <a href="/" className="text-accent underline-offset-4 hover:underline">
            join the waitlist
          </a>
          .
        </p>
      </div>
    </main>
  );
}
