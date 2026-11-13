# ADR-002: Stay on Convex as one modular backend

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Margin reactions, the Lobby and chat all need live updates. Flipbook has one builder working with Claude Code.

## Decision

Keep Convex as the only backend: database, live queries, file storage, scheduler and HTTP actions. Organise `convex/` by domain (catalogue, access, reading, margin, communities, chat, sessions, billing, activity, system).

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Convex only (chosen) | Live queries out of the box; one system to learn and run | Vendor lock-in; costs grow with usage |
| Convex plus a separate realtime service | More control over fan-out | Two systems for one person |
| Microservices | Independent scaling | Far too much operational work for the team size |

## Consequences

Read `convex/_generated/ai/guidelines.md` before writing Convex code. Domains talk through internal functions, not by reading each other's tables directly.

## Revisit when

When the monthly Convex bill approaches the cost of a hire, or a workload needs something Convex can't do.
