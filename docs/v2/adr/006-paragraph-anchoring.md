# ADR-006: Stable paragraph IDs anchor reactions

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Reactions must sit beside the same paragraph for everyone, at any font size, on any device (PRD 5.1). v1 anchors by `page` and an optional `paragraphIndex`, which shift when text reflows.

## Decision

The ingest pipeline (PRD 14.1) tags every block in a catalogue EPUB with a stable paragraph ID and writes a chapter map. Reactions anchor to edition + paragraph ID; highlights add character offsets inside that paragraph. Paragraph IDs never change after publish.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Paragraph IDs at ingest (chosen) | Stable across devices and fonts; cheap to query | Every book must go through ingest |
| EPUB CFI positions | Standard | Fragile and expensive to compare; tied to rendering |

## Consequences

The edition lock (6.3) makes this safe: a new edition is a new set of anchors. v1 club copies keep v1 anchors (see the Sprint 0 audit).

## Revisit when

When a publisher ships a revised edition of a live book.
