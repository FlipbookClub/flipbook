@AGENTS.md

**ACTIVE WORKSTREAM: Flipbook v2 build (from Nov 2026).** Start every session with `docs/v2/README.md`, then `docs/v2/architecture.md`, then the slice spec in `docs/v2/specs/`. **Build only what a spec in `docs/v2/specs/` covers.** If asked to write app code that no spec covers, say so and ask for the spec. `docs/execution-prd-next-batch.md` (Builds 11/12) is a closed historical record — do not start work from it.

**Team:** three cofounders — Moks (product & design), Ayodeji (business & operations), Sharon Ariyo-Adeoye (brand, story & community, joined Sept 2026).

**Where documents live.** Engineering artifacts are tracked in `docs/`. Strategy, money, brand and people documents live in `business/`, which is **gitignored on purpose** — never add it to a commit, a branch or a PR. The test: *if a coding agent reads or writes it, it belongs in `docs/`; otherwise `business/`.* See `business/README.md`.

Planning docs in `docs/` (read for product context, not implementation rules). Updated Sept 2026 — v2 pivot (catalog + rentals + Pro), growth-ideology revision, third cofounder, global positioning frame:
- `docs/product-vision.md` (v2.2) — vision, personas, brand voice, design philosophy, revised values (daily-return, habit mechanics allowed)
- `docs/v2/prd.md` — **the v2 Reader App PRD; canonical for all v2 product behaviour.** Where it disagrees with any older doc below, it wins
- `docs/prd.md` (v2.2) — earlier v2 spec (data model, FRs, migration plan). Superseded by `docs/v2/prd.md` for product behaviour; flag conflicts rather than choosing
- `docs/Flipbook v2 — Reader App PRD.md` — stale draft-4 copy of the PRD; ignore it, use `docs/v2/prd.md`
- `docs/product-roadmap.md` (v2.2) — Phase 7.5 ✅ complete; Phases 11-17 = v2 build; active phase undecided
- `docs/beta-readiness.md` — build and release playbook
- `docs/onboarding-flows.md` — age-segmented onboarding screen specs
- `docs/error-reporting.md` — engineering
- `vision.json` (v2.2) — structured PLAID intake, source of truth for product direction

**Design tokens.** The v2 design system is the four Tokens Studio exports at the repo root — use these, not the older summary file:
- `Brand.tokens.json` — brand primitives (DeepIndigo, VibrantCoral, Neutral, secondary + accent scales). Mode files reference these.
- `Light.tokens.json` · `Dark.tokens.json` · `Flipbook.tokens.json` — the three theme modes. **`Flipbook.tokens.json` is the Flip mode** (indigo `#3B3A6D`), named for its Figma set, not a master file. Each carries the same 14 groups: Surfaces, Text, Button, Feedback, Reader, Highlight, Margin, Overlay and others.
- `docs/v2/design-handoff/_ds/tokens/*.css` — v2 glass materials, Glass/Classic style tokens, radius, spacing, type. Use these for everything the JSON files don't carry. If the two sources disagree on a value, stop and flag it.
- `design-tokens.json` — the earlier hand-curated Figma extraction. Superseded for colour by the four files above; keep for its `typography`, `componentsObserved` and `implementationNotes` until those are ported.

Business context in `business/` (untracked; read only if you genuinely need it, never edit from a code task): `strategy/` (GTM, unit economics, synthesis), `brand/` (website brief, marketing copy, store listing), `supply/` (author outreach), `people/` (cofounder briefs).

*Note: some business docs are still duplicated in `docs/` pending a cleanup commit — `business/` is canonical, the `docs/` copies are stale.*

**Notion mirror (standing rule).** Every document in `business/` and the team-context docs in `docs/` are mirrored one-way into the Flipbook HQ teamspace in Notion. The repo is canonical; Notion is a copy. When you create or update one of these docs and a Notion connection is available, mirror the change to its Notion page in the same session, then update `business/.notion-sync.json` (page ids + source sha256 + sync date). Never edit Notion as the source of truth. A weekly scheduled task checks for drift. Mirror rules and the page map are in `business/README.md`.

## Flipbook v2 rules
- Before coding, read `docs/v2/architecture.md` and the ADRs the spec names.
- Before any Convex code, read `convex/_generated/ai/guidelines.md`.
- Never decide access or spoiler visibility in the app. Call `convex/access`.
- Schema changes are additive. Never change an existing function's contract; add a v2 variant.
- Use semantic tokens and `src/ui` components only. No hex values, no new one-off components without saying so.
- Ship the Glass style only (Classic is retired for now), in Light, Flip and Dark. Icons are Hugeicons, stroke-rounded, 1.5.
- Copy comes verbatim from the design file's logic class (`docs/v2/design-handoff/*ScreenGlass.dc.html`). No invented copy, no exclamation marks, never "platform".
- Every screen implements the loading, empty, error and offline states the spec lists.
- Write tests first for anything touching spoilers, access or money (`docs/v2/testing/strategy.md`).
- One concern per pull request. If the spec and the code disagree, stop and flag it.
- Never run git merge, rebase or `git clean`. Moks handles git.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
