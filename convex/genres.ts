// Canonical genre catalogue. Lives in convex/ so the server can validate
// against it; `src/lib/genres.ts` re-exports it for the app, so there is
// exactly one list rather than two that can drift apart.
//
// Not a Convex function module — just shared constants.
export const GENRES = [
  "Fiction",
  "Fantasy",
  "Science fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Historical fiction",
  "Literary fiction",
  "Young Adult (YA)",
  "Children's Books",
  "Classics",
  "Biography & Memoir",
  "History",
  "Self-Help",
  "Business & Finance",
  "Psychology",
  "Health & Wellness",
  "Religion & Spirituality",
  "Politics",
  "True Crime",
  "Science",
  "African Literature",
  "Nigerian Literature",
  "Poetry",
] as const;

// FR: a book carries at most three genres.
export const MAX_BOOK_GENRES = 3;

const GENRE_SET = new Set<string>(GENRES);

export function isKnownGenre(value: string): boolean {
  return GENRE_SET.has(value);
}

// Trims, drops blanks, dedupes, and keeps catalogue order. Returns null when
// the input is unusable (unknown genre, or more than MAX_BOOK_GENRES) so
// callers can reject rather than silently storing something different from
// what the user chose.
export function normalizeGenres(input: string[]): string[] | null {
  const seen = new Set<string>();
  for (const raw of input) {
    const value = raw.trim();
    if (!value) continue;
    if (!isKnownGenre(value)) return null;
    seen.add(value);
  }
  if (seen.size > MAX_BOOK_GENRES) return null;
  return GENRES.filter((g) => seen.has(g));
}
