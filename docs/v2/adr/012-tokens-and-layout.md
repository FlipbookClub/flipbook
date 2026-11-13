# ADR-012: Generated design tokens; layout by window width

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Three themes (Light, Flip, Dark), the Glass style, and large screens later. Hand-copied colours drift.

## Decision

Generate the app theme from token sources: colours from the Tokens Studio exports at the repo root (`Brand`, `Light`, `Dark`, `Flipbook` = Flip), and glass, style, radius, spacing and type from `docs/v2/design-handoff/_ds/tokens/*.css`. Ship Glass only; keep tokens style-scoped so Classic can return. Icons are Hugeicons. Lay out by window width from day one.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Generated tokens (chosen) | No stray hex values; themes stay in sync | A small generator script to maintain |
| Hand-written theme | Quick to start | Drifts from design quickly |

## Consequences

If the two token sources disagree on a value, stop and flag it.

## Revisit when

Never.
