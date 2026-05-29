import type { ReactNode } from "react";

// Section eyebrow as a pill badge (Acctual-style), with a live coral pulse
// dot so every section opener reads as "alive." Replaces the old flat
// `.eyebrow` text + `.coral-dot` treatment everywhere on the page.
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-pull px-3.5 py-1.5 align-middle font-brand text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
      <span className="pulse-dot" aria-hidden />
      {children}
    </span>
  );
}
