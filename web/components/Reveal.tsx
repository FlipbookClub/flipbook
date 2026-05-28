"use client";

import { motion, useReducedMotion, type Variant } from "framer-motion";
import type { ReactNode } from "react";

// Scroll-triggered fade + tiny upward translate. Defaults are tuned to feel
// like a page turn — slow, intentional, never bouncy.
interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  once?: boolean;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  as = "div",
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();

  const hidden: Variant = {
    opacity: 0,
    y: reduced ? 0 : y,
  };
  const visible: Variant = {
    opacity: 1,
    y: 0,
    transition: {
      duration: reduced ? 0.3 : 0.9,
      delay,
      ease,
    },
  };

  const Component = motion[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={{ hidden, visible }}
    >
      {children}
    </Component>
  );
}
