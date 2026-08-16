// Shared genre catalogue — used by onboarding (GenrePreferences), book upload,
// and book editing. PRD § Functional Requirements > Profile setup.
//
// The canonical list lives in `convex/genres.ts` so the server can validate
// against the same values; this re-exports it so app code keeps importing
// from "@/lib/genres" and the two can never drift apart.
export {
  GENRES,
  MAX_BOOK_GENRES,
  isKnownGenre,
  normalizeGenres,
} from "../../convex/genres";

// A book's genres, tolerating the legacy single-`genre` field.
//
// `genres` (array, up to MAX_BOOK_GENRES) is what new writes populate; older
// rows only have `genre`. Every read path should go through this rather than
// scattering `genres ?? [genre]` ternaries, so the legacy shape is handled in
// exactly one place and can be dropped cleanly if those rows are ever
// migrated.
export function bookGenres(book: {
  genres?: string[];
  genre?: string;
}): string[] {
  if (book.genres && book.genres.length > 0) return book.genres;
  return book.genre ? [book.genre] : [];
}
