# ADR-013: One Next.js site for the web front door and founders' console

**Status:** Proposed · **Date:** 12 Nov 2026 · **Decider:** Moks

## Context

PRD Epic 15 adds web pages on useflipbook.com; Epic 13 adds a founders' console. The repo already has a Next.js 16 site in `web/` (marketing and waitlist).

## Decision

Extend the existing `web/` Next.js site to serve the web front door and the founders' console, both on Convex and Clerk. Only a Clerk admin role reaches the console, and every admin action writes an audit log row.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| One Next.js site (chosen) | Reuses `web/`; Moks knows Next.js | Console and public pages share a deploy |
| Admin screens in the app | No second app | Admin code ships to every reader |
| Convex dashboard only | Free | Not safe or usable for founders |

## Consequences

The console's first stories land in Sprint 9; the front door in Sprints 11 and 17.

## Revisit when

When someone other than the founders needs console access.
