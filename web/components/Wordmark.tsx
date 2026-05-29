"use client";

import Image from "next/image";

import { useTheme } from "./ThemeProvider";

// Brand wordmark — the Figma-exported SVGs from the Expo app's
// `assets/images/Logo/`, copied into `public/logo/`. Mode-aware: each theme
// mode gets its own colored variant so the mark sits correctly on every
// background. Native aspect ratio is 175:42; `height` drives the size and
// width scales proportionally.
const SRC = {
  light: "/logo/full-light-colored.svg",
  flip: "/logo/full-flip-colored.svg",
  dark: "/logo/full-dark-colored.svg",
} as const;

const NATIVE_W = 175;
const NATIVE_H = 42;

export function Wordmark({ height = 28 }: { height?: number }) {
  const { mode } = useTheme();
  const width = Math.round((NATIVE_W / NATIVE_H) * height);
  return (
    <Image
      src={SRC[mode]}
      alt="Flipbook"
      width={width}
      height={height}
      priority
      // SVGs are static art; let Next serve them unoptimized.
      unoptimized
    />
  );
}
