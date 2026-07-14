import type { Metadata } from "next";
import Link from "next/link";

import { Nav } from "@/components/Nav";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Delete Your Account — Flipbook",
  description: "How to delete your Flipbook account and your data.",
};

export default function DeleteAccountPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[680px] px-6 pb-24 pt-32 font-raleway text-text">
        <h1 className="font-display text-4xl">Delete your account</h1>

        <p className="mt-8 text-lg leading-relaxed">
          You can delete your Flipbook account and its data at any time. Here&rsquo;s how.
        </p>

        <Section title="From the app (fastest)">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open Flipbook and go to <strong>Profile → Settings</strong>.</li>
            <li>Tap <strong>Delete account</strong> and confirm.</li>
          </ol>
          <p className="mt-3">
            If you moderate a community, you&rsquo;ll need to transfer it to
            another member or close it first — Flipbook won&rsquo;t delete an
            account that&rsquo;s the only moderator of an active community.
          </p>
        </Section>

        <Section title="Without the app installed">
          <p>
            Email{" "}
            <a className="underline" href="mailto:hello@useflipbook.com">
              hello@useflipbook.com
            </a>{" "}
            from the address on your account and ask us to delete it. We&rsquo;ll
            confirm your identity and process the request promptly.
          </p>
        </Section>

        <Section title="What gets deleted">
          <p>
            Your profile, display name, avatar, reading progress, bookmarks,
            reactions/comments, and push token are deleted. A limited copy may
            remain briefly in backups or logs for abuse prevention, then is
            purged on our normal retention schedule — see the{" "}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>{" "}
            for details. Communities you belonged to keep any messages/reactions
            from other members intact; deleting your account removes your
            authorship attribution from your own content going forward.
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
