"use client";

import { motion } from "framer-motion";

import { useTheme, type ThemeMode } from "./ThemeProvider";

const LABELS: Record<ThemeMode, string> = {
  light: "Light",
  flip: "Flip",
  dark: "Dark",
};

// Three-mode picker that doubles as proof of the "three modes" claim further
// down the page. Each pill renders in its own mode's colors so the toggle
// itself is a tiny demo.
export function ThemeToggle() {
  const { mode, setMode, modes } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Reading mode"
      className="relative inline-flex items-center gap-0.5 rounded-full border border-line bg-bg-elevated/40 p-0.5 backdrop-blur-md"
    >
      {modes.map((m) => {
        const active = m === mode;
        return (
          <button
            key={m}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m)}
            className="relative px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]"
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-text/10"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 font-brand font-semibold ${
                active ? "text-text" : "text-text-muted"
              }`}
            >
              {LABELS[m]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
