# ADR-003: One access module decides who can see what

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Two rules break products when each screen enforces them on its own: paywalls (can this reader open this book?) and spoilers (has this reader reached this paragraph?). PRD principle 2: spoilers are sacred.

## Decision

Create `convex/access/` with the only functions that answer "can this user read this edition?" and "has this user reached this paragraph?". Every query that returns book content, reactions, chat, quote cards, Activity or notifications calls it before returning anything.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Server-side access module (chosen) | One place to test; nothing leaks over the network | Every query carries a small extra lookup |
| Checks in the app | Simpler queries | Anyone inspecting traffic sees spoilers and locked content; push notifications leak |

## Consequences

The spoiler invariant suite (`docs/v2/testing/strategy.md`) runs against this module on every pull request.

## Revisit when

Never.
