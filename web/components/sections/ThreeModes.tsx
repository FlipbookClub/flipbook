"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/Reveal";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";

// Mode swatches that ALSO drive the page theme — tapping one flips the
// whole site to that mode. Proves the claim instead of describing it.
const swatches: Array<{
  mode: ThemeMode;
  label: string;
  bg: string;
  text: string;
  accent: string;
}> = [
  { mode: "light", label: "Light", bg: "#f7f3e3", text: "#252442", accent: "#f83b3b" },
  { mode: "flip", label: "Flip", bg: "#3b3a6d", text: "#f7f3e3", accent: "#ff6b6b" },
  { mode: "dark", label: "Dark", bg: "#121212", text: "#f1ece0", accent: "#e4b363" },
];

export function ThreeModes() {
  const { mode, setMode } = useTheme();
  const reduced = useReducedMotion();

  return (
    <section
      id="three-modes"
      className="relative border-t border-line px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">A reader for every hour</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] text-text">
                Three modes.
                <br />
                One library.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-[17px] leading-[1.7] text-text-muted">
                Light for the morning commute. Flip — our brand-native indigo — for
                the late-night reading nook. Dark for everyone else. Reading is
                personal. Your reader should be too.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 text-[13px] text-text-subtle">
                Tap a swatch — the whole site flips with you.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {swatches.map((s) => {
                const active = mode === s.mode;
                return (
                  <motion.button
                    key={s.mode}
                    onClick={() => setMode(s.mode)}
                    whileHover={reduced ? undefined : { y: -4 }}
                    whileTap={reduced ? undefined : { scale: 0.985 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border text-left ${
                      active ? "border-accent" : "border-line"
                    }`}
                    style={{ backgroundColor: s.bg, color: s.text }}
                    aria-label={`${s.label} mode preview`}
                    aria-pressed={active}
                  >
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                      <span
                        className="font-brand text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: s.text, opacity: 0.6 }}
                      >
                        {s.label}
                      </span>
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.accent }}
                      />
                    </div>

                    <div className="absolute inset-x-5 bottom-5 space-y-2">
                      <div
                        className="font-display text-[20px] leading-tight"
                        style={{ color: s.text }}
                      >
                        The lighthouse had been there all along.
                      </div>
                      <div
                        className="font-brand text-[11px] uppercase tracking-[0.18em]"
                        style={{ color: s.text, opacity: 0.5 }}
                      >
                        72 / 240
                      </div>
                    </div>

                    <div
                      className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: s.accent, color: s.bg }}
                    >
                      🔥
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
