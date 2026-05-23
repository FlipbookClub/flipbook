import { storage } from "./storage";

// Minimal content metadata cache so the reader can open a previously-read
// book OR chapter offline. Convex's useQuery only caches in memory while a
// subscriber is mounted — once the reader unmounts the cached `books.get` /
// `chapters.get` result is gone and a subsequent offline open hangs on the
// loading state. Persisting just what the reader needs locally bridges that
// gap without re-implementing query caching.

const PREFIX = "contentMeta:v1:";

export type ContentKind = "book" | "chapter";

export interface CachedContentMeta {
  kind: ContentKind;
  // Book ID or chapter ID, depending on `kind`. Stored as the cache key too.
  contentId: string;
  storageId: string;
  clubId: string;
  clubName: string;
  title: string;
  // Author is only set for books. Chapter "author" is the publishing
  // moderator, which the UI already gets from the club context.
  author?: string;
  pageCount: number;
  isRemoved: boolean;
  updatedAt: number;
}

function key(contentId: string): string {
  return `${PREFIX}${contentId}`;
}

export function readContentMeta(contentId: string): CachedContentMeta | null {
  const raw = storage.getString(key(contentId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedContentMeta;
  } catch {
    return null;
  }
}

export function writeContentMeta(meta: CachedContentMeta): void {
  storage.set(key(meta.contentId), JSON.stringify(meta));
}

// --- Backwards-compat aliases (Phase 3 callers) -----------------------------
// Kept so existing imports keep working until the reader refactor sweeps them.
export type CachedBookMeta = CachedContentMeta & { bookId: string };

export function readBookMeta(bookId: string): CachedBookMeta | null {
  const meta = readContentMeta(bookId);
  if (!meta) return null;
  return { ...meta, bookId: meta.contentId };
}

export function writeBookMeta(meta: Omit<CachedBookMeta, "kind" | "contentId">): void {
  writeContentMeta({ ...meta, kind: "book", contentId: meta.bookId });
}
