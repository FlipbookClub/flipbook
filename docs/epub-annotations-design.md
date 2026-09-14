# EPUB highlights and reactions — design note

**Status:** proposed, not built. Unblocks the P4-T10 parking-lot item.
**Date:** September 14, 2026
**Context:** the EPUB reader shipped in Phase 4B and is device-verified on iOS
and Android. Highlights and reactions inside EPUBs were explicitly parked,
because page-anchored reactions do not map onto reflowable text.

---

## The decision

**Anchor on the CFI range. Store the quoted snippet alongside it.**

Not the snippet alone. The snippet is what a human reads and the fallback when
the anchor breaks; the CFI is what the code resolves.

A CFI (Canonical Fragment Identifier) is EPUB's own pointer into a document.
epub.js already produces one for any selection and resolves one back to a
position, which is what makes resume work today.

### Why not snippet-only

Anchoring on text alone is appealing because it needs no new concepts, but it
fails three ways that matter:

1. **Ambiguity.** A sentence that appears twice in a book cannot be located. In
   non-fiction, repeated headings and stock phrases are common.
2. **No ordering.** Reactions cannot be sorted into reading order, so there is
   no way to show "reactions up to where you are", and the reader's margin has
   nothing to sort by.
3. **Fragility under edit.** A snippet match is exact-string matching against
   text the publisher controls. Any whitespace or typographic difference
   (curly vs straight quotes, a soft hyphen) silently loses the anchor.

### Why the snippet still earns its place

A CFI is tied to one specific EPUB file. If a club re-uploads the book — a
better scan, a different edition, a fixed typo — every stored CFI points into a
document that no longer exists, while the quote still tells a human exactly
what was being discussed. The thread survives as a conversation even when the
highlight cannot be repainted.

So: **CFI is the anchor, snippet is the meaning.** When the CFI fails to
resolve, the reaction still renders in Discussions with its quote; it just
loses its highlight in the page.

---

## What has to change

### 1. `reactions.page` is the awkward part

`page` is currently `v.number()` and required. EPUBs have no page. This is the
only genuinely invasive part of the work, and it should be decided before
anything is written.

Two options:

**(a) Widen `page` to optional.** Semantically honest. Costs an audit of every
reader: `listForPage`, the reader margin list, the spoiler-adjacent filtering,
and anything that sorts or groups by page. Convex allows widening a required
field to optional, but every consumer must handle `undefined`.

**(b) Keep `page` required and write a sentinel (`1`) for EPUB reactions.**
Cheap and non-breaking, and it matches the precedent already set by
`books.pdfPageCount`, which stores a documented placeholder for EPUBs.

**Recommendation: (b) for the first cut**, with the same explicit comment
`pdfPageCount` carries. `page` for an EPUB reaction means nothing and nothing
should read it; `cfiRange` is what identifies position. Revisit if the sentinel
starts leaking into UI the way `1 pages` did on the book card.

> Note the precedent cuts both ways. The `1 pages` bug reached a device
> precisely because a placeholder leaked into a display surface. If (b) is
> chosen, every page-displaying surface needs the same `fileType` guard the
> book card now has.

### 2. Schema, additive

```ts
// convex/schema.ts — reactions
cfiRange: v.optional(v.string()),   // EPUB anchor, e.g. "epubcfi(/6/14[x]!/4/2,/1:0,/1:42)"
```

`highlightQuote` already exists, added for the June PDF.js reader and still
carried on the table. It needs no change. `highlightRects` stays PDF-only:
rect geometry is meaningless for reflowable text, since the same range occupies
different boxes at different font sizes.

**Remember `reactionValidator`** in `convex/reactions.ts`. It is a strict
mirror of the table, and `reactionWithUserValidator` spreads its fields, so
adding `cfiRange` there covers both. Adding to the table and not the validator
deploys clean and then breaks every reaction query the moment one row carries
the new field. This has caught the codebase three times already:
`bookValidator` (4A), `progressValidator` (4A), `userValidator` (P5-T2).

### 3. Reader wiring

epub.js gives the whole path natively:

- **Capture.** On selection, `rendition.getRange(cfi)` and the runtime's
  existing selection plumbing produce `{ cfiRange, quote }`. The runtime
  already posts selection events; it needs a CFI added to the payload.
- **Paint.** `rendition.annotations.highlight(cfiRange, {}, handler)` draws it
  and takes a tap handler, which is the thread-open path.
- **Repaint.** Annotations live on the rendition, so they must be re-applied
  after a flow change — the same lesson the font-size and flow work already
  hit, where a rebuild silently drops everything the old rendition carried.
- **Remove.** `rendition.annotations.remove(cfiRange, "highlight")`.

No native module work. This stays inside the WebView runtime.

### 4. Margin list

The PDF reader's margin is page-keyed (`listForPage`). EPUBs have no page to
key on, so the first cut should **not** try to reproduce the margin. Options,
cheapest first:

1. **Tap a highlight to open its thread** and nothing else. Reactions are
   discoverable through Discussions, which already sorts chronologically and
   needs no page.
2. Later: a per-section list, keyed on the spine item rather than a page.

Option 1 is the whole of the first cut. It delivers the interaction that
matters (react to a passage, discuss it) without inventing a page concept.

---

## Explicitly out of scope for a first cut

- EPUB bookmarks. Same anchor problem, separate feature, no demand yet.
- Spoiler gating by position. Reactions are visible to all members today (a
  founder override of FR-018) and nothing here changes that.
- Migrating existing PDF reactions. They are page-anchored and stay that way.

## Open questions for the founder

1. Does a reaction on a re-uploaded book keep its thread with a broken
   highlight, or disappear? This note assumes **keep** — a conversation is
   worth more than a highlight.
2. Should EPUB reactions appear in the club progress/activity surfaces that
   currently assume a page number?
