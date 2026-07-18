import Link from "next/link";

import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

// Homepage snippet — teases the install flow and hands off to the dedicated
// /get-flipbook page for the full, device-by-device instructions. Keeps the
// homepage short; the elaborate version lives on its own page.
export function GetFlipbook() {
  return (
    <section
      id="get-flipbook"
      className="relative border-t border-line px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Eyebrow>Get started</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-7 text-[clamp(40px,6.2vw,80px)] leading-[1.02] text-text">
            Your next reading room
            <br />
            <em>starts here.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-text-muted">
            Install Flipbook and tap &ldquo;Let me in.&rdquo; Free to join, no
            invite code needed.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <Link
            href="/get-flipbook"
            className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-[14px] font-semibold tracking-wide text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-accent-strong hover:shadow-accent/40 active:scale-[0.98]"
          >
            Get Flipbook
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
