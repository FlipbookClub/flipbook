# ADR-005: Store purchases in the app, Paystack on the web

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

App Store and Google Play rules require in-app purchase for digital goods sold in the app outside the US. The PRD (Epic 15, settled 12 Oct) adds a web front door on useflipbook.com that sells rentals and gifts through Paystack.

## Decision

In the app, rentals, gifts and Pro are sold through App Store and Google Play via RevenueCat. On useflipbook.com, rentals and gifts are sold through Paystack. Both write the same entitlements in Convex. The app never links to, mentions or embeds web payment (the five store rules in PRD Epic 15).

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Store in the app, Paystack on the web (chosen) | Compliant everywhere; web avoids store fees | Two payment paths to test |
| Web checkout linked from the app | No store fees | Breaks store rules outside the US; risks removal |

## Consequences

Products are priced per region in each store. Authors receive 70% of net (after store and payment fees).

## Revisit when

When store rules change in Flipbook's markets.
