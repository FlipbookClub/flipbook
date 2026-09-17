// P4-T4. How a progress row turns into a bar and a label.
//
// EPUBs carry percentComplete and meaningless 1/1 pages; PDFs carry pages and
// no percent. Five separate screens were each computing currentPage/totalPages
// inline, so this exists for the same reason bookGenres() does: one rule, not
// five ternaries that drift.

export interface ProgressLike {
  currentPage: number;
  totalPages: number;
  percentComplete?: number | null;
}

// 0..100, clamped. Prefers percentComplete when present, which is the only
// figure that means anything for reflowable text.
export function progressPercent(p: ProgressLike | null | undefined): number {
  if (!p) return 0;
  if (p.percentComplete != null) {
    return Math.max(0, Math.min(100, Math.round(p.percentComplete)));
  }
  if (!p.totalPages) return 0;
  return Math.max(0, Math.min(100, Math.round((p.currentPage / p.totalPages) * 100)));
}

// Long form for cards and detail rows: "Page 12 of 340" / "38% read".
export function progressLabel(p: ProgressLike | null | undefined): string {
  if (!p) return "Not started";
  if (p.percentComplete != null) return `${progressPercent(p)}% read`;
  return `Page ${p.currentPage} of ${p.totalPages}`;
}

// Compact form for tight rows: "Pg 12 | 340" / "38%".
export function progressLabelShort(p: ProgressLike | null | undefined): string {
  if (!p) return "Not started";
  if (p.percentComplete != null) return `${progressPercent(p)}%`;
  return `Pg ${p.currentPage} | ${p.totalPages}`;
}
