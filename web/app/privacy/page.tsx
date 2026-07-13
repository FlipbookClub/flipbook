import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Privacy Policy — Flipbook",
  description: "How Flipbook collects, uses, and protects your data.",
};

const EFFECTIVE_DATE = "July 13, 2026";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[680px] px-6 pb-24 pt-32 font-raleway text-text">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text/60">Effective {EFFECTIVE_DATE}</p>

        <p className="mt-8 text-lg leading-relaxed">
          Flipbook is a small, independent app — we collect only what we need
          to run reading communities, and we don&rsquo;t sell your data to
          anyone. This page explains what we collect, why, and how to control
          it.
        </p>

        <Section title="What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account info</strong> — email address, display name, and
              (if you sign in with Google or Apple) the profile photo they
              provide. We never require your real name.
            </li>
            <li>
              <strong>Reading activity</strong> — which books/chapters you
              open, your page progress, bookmarks, and the reactions or
              comments you post. This is the core of what makes a reading
              community work.
            </li>
            <li>
              <strong>Content you upload</strong> — book/chapter files and
              club cover images you or a moderator add to a community.
            </li>
            <li>
              <strong>Device &amp; usage data</strong> — basic app usage
              analytics and crash reports, so we can fix bugs and understand
              what&rsquo;s working. This is anonymized where possible and never
              sold.
            </li>
            <li>
              <strong>Push notification token</strong> — so we can notify you
              about replies, chapter drops, and club activity. You can turn
              individual notification types off in Settings.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>
            Strictly to run the app: authenticating you, syncing your
            reading progress across devices, showing you and your
            clubmates&rsquo; reactions, sending the notifications you&rsquo;ve
            opted into, and diagnosing bugs/crashes. We do not use your data
            for ad targeting, and Flipbook currently has no ads.
          </p>
        </Section>

        <Section title="Who we share it with">
          <p>We use a small number of trusted service providers to run Flipbook:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Convex</strong> — our database and backend.
            </li>
            <li>
              <strong>Clerk</strong> — authentication (sign-in/sign-up).
            </li>
            <li>
              <strong>Resend</strong> — transactional email (invites, account
              notices).
            </li>
            <li>
              <strong>PostHog</strong> — product analytics (only if enabled
              on your build).
            </li>
            <li>
              <strong>Sentry</strong> — crash/error reporting (only if enabled
              on your build).
            </li>
          </ul>
          <p className="mt-3">
            Each only receives what it needs to do its job. We do not sell
            your personal data to third parties, and we do not share it for
            advertising purposes.
          </p>
        </Section>

        <Section title="Your controls">
          <p>
            You can edit your profile, change notification preferences, and
            delete your account at any time from Settings. Deleting your
            account removes your profile and personal data; if you moderate a
            community, you&rsquo;ll need to transfer or close it first.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Flipbook is not directed at children and is not intended for
            anyone under the age required to consent to data processing in
            their region. If you believe a child has provided us data,
            contact us at{" "}
            <a className="underline" href="mailto:hello@useflipbook.com">
              hello@useflipbook.com
            </a>{" "}
            and we&rsquo;ll remove it.
          </p>
        </Section>

        <Section title="Data retention & security">
          <p>
            We keep your data for as long as your account is active, plus a
            limited window after deletion for backups and abuse prevention.
            Data is encrypted in transit (HTTPS/TLS) between the app and our
            services.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this policy changes in a meaningful way, we&rsquo;ll update the
            date at the top of this page and, where appropriate, notify you
            in the app.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about your data? Reach us at{" "}
            <a className="underline" href="mailto:hello@useflipbook.com">
              hello@useflipbook.com
            </a>
            .
          </p>
        </Section>

        <div className="mt-16 flex items-center justify-between border-t border-line pt-8">
          <Wordmark />
          <Link href="/" className="text-sm underline">
            Back to Flipbook
          </Link>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-text/85">{children}</div>
    </section>
  );
}
