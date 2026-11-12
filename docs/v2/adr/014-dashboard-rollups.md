# ADR-014: Dashboard reads nightly rollups

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

The founders' dashboard (PRD 13.8–13.16) must be fast on a phone, filterable and exportable, without scanning every reader's records live.

## Decision

A nightly Convex job fills daily rollup tables (`metricsDaily`) with money and counts from Flipbook's own ledger and entitlements. Funnels and cohorts come from PostHog's query API. A daily FX rate (`fxRates`) drives the USD toggle; targets come from the `targets` table.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Nightly rollups (chosen) | Fast pages; ledger stays the single source for money | Data is up to a day old |
| Live queries over raw tables | Always current | Slow and expensive as data grows |
| A separate BI tool or warehouse | Powerful | Another system to run |

## Consequences

The analytics event plan (Sprint 0, S0-8) must exist before launch or the funnels stay empty.

## Revisit when

When founders need same-day data or joins PostHog can't answer.
