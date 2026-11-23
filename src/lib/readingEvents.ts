// S0-8. The two v1 reading events, book_opened and book_finished, decided by
// pure functions so the rules are tested (readingEvents.test.ts).
//
// Properties are ids only: never a title, an author, a file name or any text
// from the book. v1 has no editions; v2 adds edition_id alongside book_id.

import type { AnalyticsProps } from "./analytics";

// Matches convex/progress.ts EPUB_FINISHED_PERCENT: an EPUB rarely reports a
// clean 100% because the last spine item is often a colophon nobody scrolls.
export const EPUB_FINISHED_PERCENT = 98;

export interface ReadingContent {
  kind: "book" | "chapter";
  contentId: string;
  fileType: "pdf" | "epub";
}

export function readingEventProps(content: ReadingContent): AnalyticsProps {
  return {
    book_id: content.contentId,
    content_kind: content.kind,
    file_type: content.fileType,
  };
}

export type ReadingPosition =
  | { fileType: "pdf"; page: number; totalPages: number }
  | { fileType: "epub"; percent: number };

// The same rule the server uses to set progress.finishedAt.
export function hasReachedEnd(position: ReadingPosition): boolean {
  if (position.fileType === "epub") {
    return Number.isFinite(position.percent) && position.percent >= EPUB_FINISHED_PERCENT;
  }
  const { page, totalPages } = position;
  return Number.isFinite(page) && Number.isFinite(totalPages) && totalPages >= 1 && page >= totalPages;
}

// book_finished is sent once per book per device. The key lives in MMKV.
export function finishedEventKey(contentId: string): string {
  return `analytics.bookFinished.${contentId}`;
}
