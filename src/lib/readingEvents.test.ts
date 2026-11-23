import {
  EPUB_FINISHED_PERCENT,
  finishedEventKey,
  hasReachedEnd,
  readingEventProps,
} from "./readingEvents";

describe("readingEventProps", () => {
  it("sends ids and the content type only", () => {
    expect(readingEventProps({ kind: "book", contentId: "b1", fileType: "epub" })).toEqual({
      book_id: "b1",
      content_kind: "book",
      file_type: "epub",
    });
  });

  it("never carries anything that could be a title or text", () => {
    const props = readingEventProps({ kind: "chapter", contentId: "c1", fileType: "pdf" });
    expect(Object.keys(props).sort()).toEqual(["book_id", "content_kind", "file_type"]);
  });
});

describe("hasReachedEnd", () => {
  it("PDF: only on the last page", () => {
    expect(hasReachedEnd({ fileType: "pdf", page: 199, totalPages: 200 })).toBe(false);
    expect(hasReachedEnd({ fileType: "pdf", page: 200, totalPages: 200 })).toBe(true);
  });

  it("PDF: a one-page document is finished when opened", () => {
    expect(hasReachedEnd({ fileType: "pdf", page: 1, totalPages: 1 })).toBe(true);
  });

  it("PDF: nonsense values never count as finished", () => {
    expect(hasReachedEnd({ fileType: "pdf", page: Number.NaN, totalPages: 10 })).toBe(false);
    expect(hasReachedEnd({ fileType: "pdf", page: 5, totalPages: 0 })).toBe(false);
  });

  it("EPUB: at the same threshold the server uses", () => {
    expect(EPUB_FINISHED_PERCENT).toBe(98);
    expect(hasReachedEnd({ fileType: "epub", percent: 97 })).toBe(false);
    expect(hasReachedEnd({ fileType: "epub", percent: 98 })).toBe(true);
    expect(hasReachedEnd({ fileType: "epub", percent: Number.NaN })).toBe(false);
  });
});

describe("finishedEventKey", () => {
  it("is one key per book", () => {
    expect(finishedEventKey("b1")).not.toBe(finishedEventKey("b2"));
  });
});
