@AGENTS.md

**ACTIVE WORKSTREAM:** `docs/execution-prd-next-batch.md` — the working spec for the current v1 batch (Builds 11/12: bug fixes, Android reader, EPUB, multi-genre, retention). If you're writing app code right now, start there.

Planning docs (read for product context, not implementation rules). All updated Aug 15, 2026 for the v2 pivot (catalog + rentals + Pro) and the growth-ideology revision:
- `docs/product-vision.md` (v2.1) — vision, personas, brand, revised values (daily-return, habit mechanics allowed)
- `docs/prd.md` (v2.1) — v2 feature spec, data model, FRs, migration plan
- `docs/product-roadmap.md` (v2.1) — Phase 7.5 = active v1 hardening; Phases 11-17 = v2 build
- `docs/go-to-market.md` (v2.1) — 90-day launch plan + Aug 15 reality-check addendum
- `docs/model-math.md` + `docs/flipbook-model.xlsx` — unit economics, 12-mo P&L, breakeven
- `docs/synthesis-aug-2026.md` — Aug 15 synthesis: state, bugs, feedback, ideology decisions
- `docs/supply/` — author pitch email, term sheet, target list (founding-30 outreach)
- `docs/landing-page-copy.md` (v2) — marketing-site copy for the v2 launch (replaces `waitlist-landing-page-copy-v4.md` at cutover)
- `docs/beta-readiness.md`, `docs/onboarding-flows.md`, `docs/store-listing.md` — operational playbooks
- `vision.json` (v2.1) — structured PLAID intake, source of truth for product direction
- `design-tokens.json` — Figma-extracted tokens (Light/Flip/Dark)

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
