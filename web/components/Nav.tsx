"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";
import { Wordmark } from "./Wordmark";

// Top nav. Reading-room calm: brand wordmark left, theme toggle + a single
// "Get Flipbook" CTA right. The page itself is the menu, so there's no link
// list — just the one action the whole page points to. A faint background +
// hairline fades in once you've scrolled past the hero so the bar stays
// legible over content.
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Passive listener; setState only flips at the threshold, so this does
    // not re-render on every scroll tick.
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-line bg-bg/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" aria-label="Flipbook home" className="inline-flex items-center">
          <Wordmark height={26} />
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <ThemeToggle />
          <Link
            href="/get-flipbook"
            className="hidden h-10 items-center rounded-full bg-accent px-5 text-[13px] font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-accent-strong sm:inline-flex"
          >
            Get Flipbook
          </Link>
        </div>
      </div>
    </header>
  );
}
