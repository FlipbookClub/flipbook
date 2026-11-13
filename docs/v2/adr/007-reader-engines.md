# ADR-007: Keep epub.js and the native PDF module

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Both readers work on both platforms in v1 after significant effort. A reader rewrite is the highest-risk change available.

## Decision

Keep epub.js inside a WebView for EPUB and `modules/native-highlight-pdf/` for PDF club copies. Restyle them for v2 and add paragraph-ID support to the EPUB path.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Keep both (chosen) | Proven on real devices | epub.js limits some layouts |
| New reader engine | More control | Months of work and new regressions |

## Consequences

Sprint 3 starts with a spike: two-page spread and margin reactions beside paragraphs on a mid-range Android.

## Revisit when

If the Sprint 3 spike fails on performance or the two-page spread.
