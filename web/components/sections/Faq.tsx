"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

const items: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "How is this different from Goodreads?",
    a: "Goodreads is for the books you've finished. Flipbook is for the book you're reading right now. Different primitive, different room.",
  },
  {
    q: "I tried Discord book clubs. They didn't stick.",
    a: "Same here. They die because the conversation isn't tied to the book. On Flipbook, reactions live on the page — they show up because you're already there.",
  },
  {
    q: "I prefer reading alone.",
    a: "You still can. Solo reading works. The clubs are there when you want them.",
  },
  {
    q: "When does the beta open?",
    a: "Soon. Design-partner clubs get in first; the rest of the waitlist follows the same day.",
  },
  {
    q: "Is it free?",
    a: "Yes — for the beta, and free forever for every founding club. A Pro tier comes later for the obsessed. It will never be a paywall on reading together.",
  },
  {
    q: "iOS and Android?",
    a: "Both, from day one. Mobile-first by design. A web companion comes later.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="relative border-t border-line bg-pull px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <Eyebrow>The questions we keep getting</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] text-text">
            Likely on your mind.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <ul className="mt-14 divide-y divide-line border-y border-line">
            {items.map((it, i) => (
              <FaqItem key={i} q={it.q} a={it.a} index={i} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function FaqItem({ q, a, index }: { q: string; a: React.ReactNode; index: number }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const id = `faq-${index}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="font-display text-[clamp(20px,2.2vw,26px)] leading-tight text-text">
          {q}
        </span>
        <span
          className={`shrink-0 rounded-full border border-line p-2 text-text-muted transition-all duration-300 group-hover:border-accent group-hover:text-accent ${
            open ? "rotate-45 border-accent text-accent" : ""
          }`}
        >
          <Plus size={16} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: reduced ? 0.2 : 0.35, delay: reduced ? 0 : 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: reduced ? 0 : 0.3, ease: [0.7, 0, 0.84, 0] },
                opacity: { duration: 0.2 },
              },
            }}
            style={{ overflow: "hidden" }}
          >
            <p className="max-w-3xl pb-7 pr-12 text-[16px] leading-[1.7] text-text-muted md:text-[17px]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
