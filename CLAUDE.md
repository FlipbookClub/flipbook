@AGENTS.md

**ACTIVE WORKSTREAM:** `docs/execution-prd-next-batch.md` — the working spec for the current v1 batch (Builds 11/12: bug fixes, Android reader, EPUB, multi-genre, retention). If you're writing app code right now, start there.

**Where documents live.** Engineering artifacts are tracked in `docs/`. Strategy, money, brand and people documents live in `business/`, which is **gitignored on purpose** — never add it to a commit, a branch or a PR. The test: *if a coding agent reads or writes it, it belongs in `docs/`; otherwise `business/`.* See `business/README.md`.

Planning docs in `docs/` (read for product context, not implementation rules). Updated Aug 2026 for the v2 pivot (catalog + rentals + Pro) and the growth-ideology revision:
- `docs/product-vision.md` (v2.1) — vision, personas, brand voice, design philosophy, revised values (daily-return, habit mechanics allowed)
- `docs/prd.md` (v2.1) — v2 feature spec, data model, FRs, migration plan
- `docs/product-roadmap.md` (v2.1) — Phase 7.5 = active v1 hardening; Phases 11-17 = v2 build
- `docs/beta-readiness.md` — build and release playbook
- `docs/onboarding-flows.md` — age-segmented onboarding screen specs
- `docs/error-reporting.md` — engineering
- `vision.json` (v2.1) — structured PLAID intake, source of truth for product direction
- `design-tokens.json` — Figma-extracted tokens (Light/Flip/Dark)

Business context in `business/` (untracked; read only if you genuinely need it, never edit from a code task): `strategy/` (GTM, unit economics, synthesis), `brand/` (website brief, marketing copy, store listing), `supply/` (author outreach), `people/` (cofounder briefs).

*Note: some business docs are still duplicated in `docs/` pending a cleanup commit — `business/` is canonical, the `docs/` copies are stale.*

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
