# ADR-009: Live sessions on LiveKit Cloud

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Epic 8 needs audio-only rooms that work on patchy 4G, keep playing in the background, and can record when the host turns it on.

## Decision

Use LiveKit Cloud, audio only, with room tokens issued by a Convex action. Recording uses LiveKit's recording service, off by default.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| LiveKit Cloud (chosen) | Expo plugin, low-bitrate audio, recording, no servers to run | Needs development builds (not Expo Go); per-minute cost |
| Agora | Mature | Heavier SDK; less Expo-friendly |
| Self-hosted | Cheapest at scale | Servers to run and secure |

## Consequences

Built in Release C (Sprints 19–20). Sprint 19 starts with a spike on throttled 3G.

## Revisit when

When session minutes cost more than self-hosting.
