import type { Metadata } from "next";

import { DownloadLinksForm } from "@/components/DownloadLinksForm";
import { Eyebrow } from "@/components/Eyebrow";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Get Flipbook — Install on iPhone or Android",
  description:
    "Install Flipbook and tap \"Let me in.\" Free, open beta — no invite code needed.",
};

const IOS_LINK = "https://testflight.apple.com/join/DYP5aNv5";
const ANDROID_GROUP_LINK = "https://groups.google.com/g/flipbook-test/";
const ANDROID_STORE_LINK = "https://play.google.com/store/apps/details?id=com.flipbook.club";
const ANDROID_WEB_OPT_IN_LINK = "https://play.google.com/apps/testing/com.flipbook.club";

export default function GetFlipbookPage() {
  return (
    <>
      <Nav />
      <main className="px-6 pb-32 pt-40 md:px-10 md:pt-48">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Get started</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display mt-7 text-[clamp(40px,6.2vw,72px)] leading-[1.02] text-text">
              Your next reading room
              <br />
              <em>starts here.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-text-muted md:text-[18px]">
              Install Flipbook, tap &ldquo;Let me in,&rdquo; and you&apos;ll be
              reading with your people in under a minute. No invite code. No
              waitlist. Just start reading together.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:mt-20 md:grid-cols-2">
          <Reveal delay={0.1}>
            <Panel
              title="Get Flipbook on iPhone"
              steps={[
                <>Install <strong>TestFlight</strong> from the App Store, if you don&apos;t have it already.</>,
                <>
                  <ActionLink href={IOS_LINK}>Open the TestFlight link</ActionLink>.
                </>,
                <>Tap <strong>Accept</strong>, then <strong>Install</strong>.</>,
                <>Open Flipbook and tap <strong>&ldquo;Let me in.&rdquo;</strong></>,
              ]}
            />
          </Reveal>

          <Reveal delay={0.18}>
            <Panel
              title="Get Flipbook on Android"
              steps={[
                <>
                  <ActionLink href={ANDROID_GROUP_LINK}>Join the tester group</ActionLink> —
                  takes about ten seconds.
                </>,
                <>
                  Tap <strong>&ldquo;Join group.&rdquo;</strong>
                </>,
                <>
                  Open Flipbook on the{" "}
                  <ActionLink href={ANDROID_STORE_LINK}>Play Store</ActionLink>.
                </>,
                <>
                  Can&apos;t install yet?{" "}
                  <ActionLink href={ANDROID_WEB_OPT_IN_LINK}>
                    Use the web opt-in link
                  </ActionLink>{" "}
                  instead.
                </>,
                <>Open Flipbook and tap <strong>&ldquo;Let me in.&rdquo;</strong></>,
              ]}
            />
          </Reveal>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-[15px] leading-[1.7] text-text-muted">
              Flipbook is free during beta, and founding clubs will always have
              a free home here. If anything isn&apos;t working, just reply to
              any email from us. Every message comes straight to me.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-10 max-w-md">
            <DownloadLinksForm />
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Panel({ title, steps }: { title: string; steps: React.ReactNode[] }) {
  return (
    <div className="card flex h-full flex-col p-7 md:p-9">
      <h2 className="font-display text-[clamp(22px,2.6vw,30px)] leading-tight text-text">
        {title}
      </h2>
      <ol className="mt-6 space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span className="font-brand mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 text-[12px] font-semibold text-accent">
              {i + 1}
            </span>
            <span className="text-[15px] leading-[1.7] text-text-muted md:text-[16px]">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-accent underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}
