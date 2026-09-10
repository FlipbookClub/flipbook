// P4-T1. One place that knows a book's file type, including the legacy
// default. `fileType` is absent on every row written before EPUB support, and
// all of those are PDFs, so the fallback is not a guess.
//
// Read through this rather than testing `book.fileType` directly, for the same
// reason genres go through bookGenres(): the default belongs in one place.

export type BookFileType = "pdf" | "epub";

export function bookFileType(book: {
  fileType?: BookFileType | string | null;
}): BookFileType {
  return book.fileType === "epub" ? "epub" : "pdf";
}

export function isEpub(book: { fileType?: BookFileType | string | null }): boolean {
  return bookFileType(book) === "epub";
}

// For the upload confirmation line and anywhere else a human reads the format.
export function fileTypeLabel(type: BookFileType): string {
  return type === "epub" ? "EPUB" : "PDF";
}
