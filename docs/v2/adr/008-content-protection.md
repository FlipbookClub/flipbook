# ADR-008: Encrypt books at rest; no DRM yet

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

Licensed rentals need reasonable protection. Real DRM (Readium LCP) costs money and time.

## Decision

Store book files encrypted, fetch them through short-lived links, keep the key in secure storage on the device, and allow offline reading until the rental ends.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| Encryption at rest (chosen) | Deters casual copying; cheap | Not true DRM |
| Readium LCP DRM | Industry standard | Licensing cost and integration time |
| No protection | Simplest | Unacceptable to publishers |

## Consequences

Ask the first publishers what protection they require before signing.

## Revisit when

When a publisher contract requires real DRM.
