# ADR-010: Low-bitrate voice notes in Convex storage

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Voice notes must respect expensive data plans (PRD 7.3).

## Decision

Record mono at a low bitrate (about 0.5 MB for 2 minutes) and store files in Convex storage. Waveforms are computed on the device and stored as a small array.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Convex storage (chosen) | One system; simple access rules | Storage cost grows |
| Third-party media hosting | Cheaper at scale | Another vendor and another access path |

## Consequences

Downloads are cached for offline playback.

## Revisit when

When storage costs climb.
