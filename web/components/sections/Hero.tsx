"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { AvatarStack } from "@/components/AvatarStack";
import { Eyebrow } from "@/components/Eyebrow";
import { SignupCount } from "@/components/SignupCount";

const ease = [0.16, 1, 0.3, 1] as const;

// Reading-room hero. Editorial serif headline, generous whitespace, the
// form one tab away from the H1. The visual to the right is a low-budget
// "magic moment" suggestion — book page silhouette with a coral margin
// reaction. Drop in a real product loop later.
export function Hero() {
  const reduced = useReducedMotion();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-[1.05fr_0.95fr] md:px-10">
        <div>
          <motion.div {...fade(0.05)}>
            <Eyebrow>Now in open beta</Eyebrow>
          </motion.div>

          <motion.h1
            {...fade(0.15)}
            className="display mt-7 text-[clamp(48px,8.5vw,112px)] text-text"
          >
            You used to <em>finish</em>
            <br />
            books. You can <em>again.</em>
          </motion.h1>

          <motion.p
            {...fade(0.3)}
            className="mt-8 max-w-xl text-[17px] leading-[1.6] text-text-muted md:text-[18px]"
          >
            Reading is easier when you&apos;re not doing it alone. Flipbook helps
            you stay consistent with friends, book clubs, and communities that
            keep you turning the page.
          </motion.p>

          <motion.div {...fade(0.45)} className="mt-10 flex flex-col items-start gap-3">
            <Link
              href="/get-flipbook"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-[14px] font-semibold tracking-wide text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-accent-strong hover:shadow-accent/40 active:scale-[0.98]"
            >
              Get Flipbook
            </Link>
            <p className="text-[13px] text-text-muted">Free to join. No invite code.</p>
          </motion.div>

          <motion.div {...fade(0.6)} className="mt-6 flex items-center gap-3">
            <AvatarStack />
            <p className="text-[13px] text-text-subtle">
              <SignupCount />
            </p>
          </motion.div>
        </div>

        <motion.div
          {...fade(0.35)}
          aria-hidden
          className="relative mx-auto hidden aspect-[3/4] w-full max-w-md md:block"
        >
          <BookMockup />
        </motion.div>
      </div>
    </section>
  );
}

// A spare, typographic "open book" mockup. No photography — keeps with the
// brand anti-pattern about not being a SaaS funnel. Margin reaction is the
// only piece of coral.
function BookMockup() {
  return (
    <div className="absolute inset-0 -rotate-1 rounded-[28px] border border-line bg-bg-elevated/40 p-8 shadow-2xl shadow-black/10 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-text-subtle">
        <span>Chapter 04</span>
        <span>The Lighthouse</span>
      </div>

      <div className="space-y-3 font-display text-[15px] leading-[1.65] text-text/85">
        <p>
          And then, of course, the silence — the silence she had learned to listen
          for, the silence that pretended to be empty when it was really the room
          holding its breath.
        </p>
        <p className="relative">
          She turned the page very slowly. There was no hurry, not anymore.{" "}
          <span className="bg-accent/15 px-0.5 ring-1 ring-accent/30">
            The lighthouse had been there all along.
          </span>{" "}
          And so had she.
        </p>
        <p className="text-text-muted">
          In the morning, the gulls would come back. In the morning, the page would
          turn itself.
        </p>
      </div>

      <div className="absolute right-6 top-32 flex items-center gap-2 rounded-full border border-line bg-bg/80 px-3 py-1.5 text-[12px] text-text shadow-lg backdrop-blur-md">
        <span className="text-base leading-none">🔥</span>
        <span className="font-brand font-semibold text-text-muted">Ada</span>
      </div>

      <div className="absolute right-12 top-52 max-w-[180px] rounded-2xl border border-line bg-bg/80 px-3 py-2 text-[12px] text-text/90 shadow-lg backdrop-blur-md">
        <span className="font-brand font-semibold text-text-muted">Tobi:</span>{" "}
        wait, the lighthouse??
      </div>

      <div className="absolute bottom-5 right-6 text-[11px] uppercase tracking-[0.18em] text-text-subtle">
        72 / 240
      </div>
    </div>
  );
}
