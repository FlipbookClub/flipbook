# ADR-004: Convex is the source of truth for entitlements

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Readers get books through store purchases, web purchases (Paystack), Pro, gifts, credits, club copies and previews. Consumable store purchases can't be restored from the store.

## Decision

Keep one `entitlements` table in Convex: one row per grant, with source, start, end and price paid. RevenueCat and Paystack webhooks only write to it, and only the access module reads it. The app never decides access from the store SDK.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Convex entitlements (chosen) | One truth across iOS, Android and web; works for gifts and credits | We must handle webhooks idempotently |
| Trust the store SDK on the device | Less backend work | Doesn't cover web, gifts or credits; can be tampered with |

## Consequences

Every webhook is idempotent (replay twice, nothing doubles). Every sale also writes an append-only ledger row.

## Revisit when

Never.
