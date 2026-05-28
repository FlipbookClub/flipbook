"use client";

import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";

// Top nav. Reading-room calm: brand wordmark left, theme toggle right,
// no menu — the page itself is the menu.
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mix-blend-normal">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          aria-label="Flipbook home"
          className="font-brand text-lg font-semibold tracking-[-0.01em] text-text"
        >
          Flipbook
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
