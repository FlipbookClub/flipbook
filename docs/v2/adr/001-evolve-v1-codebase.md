# ADR-001: Evolve the v1 codebase and Convex deployment

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

v1 is live with 188 sign-ups across 16+ communities. Their clubs, books, highlights, reactions and progress must survive the upgrade (PRD 1.4). v1 also contains hard-won pieces: the native PDF highlight module (`modules/native-highlight-pdf/`) and the epub.js reader.

## Decision

Build v2 in the existing repo and the same Convex deployment. The v2 UI is a new navigation tree mounted behind the `v2_shell` feature flag; v1 screens stay until v2 replaces them.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Evolve the v1 repo (chosen) | Keeps data, auth, reader and native modules; one backend for both apps during the transition | v1 and v2 code live side by side for a while |
| Start a fresh app | Clean slate | Loses the reader work; needs a data migration between two backends; two apps to maintain |

## Consequences

Every schema change must be additive while v1 is installed anywhere (ADR rules in `CLAUDE.md`). A minimum-version gate is needed so v1 can eventually be retired (Sprint 0, S0-2).

## Revisit when

Never for v2.
