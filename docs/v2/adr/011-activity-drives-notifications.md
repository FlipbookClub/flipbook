# ADR-011: The Activity table drives every notification

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Every push must have something real behind it, and spoilers must be veiled in pushes too (PRD 10.1, principle 2).

## Decision

Features write rows to an `activity` table. Push notifications are generated from those rows by the scheduler, with spoiler text veiled on the server and user preferences applied.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Activity table first (chosen) | One place for rules, preferences and spoilers | One extra write per event |
| Features send pushes directly | Fewer moving parts | Rules duplicated; spoilers leak |

## Consequences

The Activity screen (10.2) reads the same table.

## Revisit when

Never.
