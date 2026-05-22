import { storage } from "./storage";

// Minimal book metadata cache so the reader can open a previously-read book
// offline. Convex's useQuery only caches in memory while a subscriber is
// mounted — once the reader unmounts, the cached `books.get` result is gone
// and a subsequent offline open hangs on the loading state. Persisting just
// what the reader needs locally (storage ID, title, club name, page count)
// bridges that gap without re-implementing query caching.

const PREFIX = "bookMeta:v1:";

export interface CachedBookMeta {
  bookId: string;
  storageId: string;
  clubId: string;
  clubName: string;
  title: string;
  author: string;
  pageCount: number;
  isRemoved: boolean;
  updatedAt: number;
}

function key(bookId: string): string {
  return `${PREFIX}${bookId}`;
}

export function readBookMeta(bookId: string): CachedBookMeta | null {
  const raw = storage.getString(key(bookId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedBookMeta;
  } catch {
    return null;
  }
}

export function writeBookMeta(meta: CachedBookMeta): void {
  storage.set(key(meta.bookId), JSON.stringify(meta));
}
