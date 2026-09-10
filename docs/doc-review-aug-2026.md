# Foundation Docs — Alignment Review Report

**Date:** August 15, 2026
**Reviewer:** Claude (with Moks)
**Scope:** every doc in `docs/` + `vision.json` + `CLAUDE.md`, checked for alignment with the decisions made since July 15 (v2 pivot) and August 15 (growth-ideology revision, Android priority, EPUB-in-v1, Masobe, beta actuals).

---

## 1. What changed in this review

| Doc | Version | Changes applied |
|---|---|---|
| `product-vision.md` | v2.0 → **v2.1** | **Values revision (WP-15)**: "Read alongside, not at each other" reworded (personal/club streaks OK, public ranking banned); new core value "Build the daily reading habit" (daily-return over time-in-app, supersedes the old anti-value); "Respect the reader's attention" revised (contextual reminders allowed, shame banned); Product Principle 4 revised; anti-pattern "Never gamify reading" → "Gamify only in service of the reading habit". **Masobe App** added to the competitive narrative (collaboration-first, compete-if-declined). All revisions marked "(Revised Aug 15, 2026)" inline. |
| `vision.json` | 2.0 → **2.1** | Same ideology revision applied to `feeling.antiPatterns`; new "Daily return, not session length" entry in `productPrinciples` (now 7); `meta.changeSummary` records v2.1 (ideology, Masobe, v1 EPUB/multi-genre back-port, Android majority-platform fact). Validates as JSON. |
| `prd.md` | v2.0 → **v2.1** | **FR-112** revised from "never engagement-driven push" to "reading-shaped notifications only" (reminders allowed, shame banned) — resolves the direct conflict with the reminder-push feature (P5-T2). **§ 9 Migration Plan** gains an interim note: v1 ships EPUB upload + multi-genre while v2 builds, designed v2-compatible (`genres` array ≈ v2 `genreTags`; epub.js reader de-risks TASK-125/126). |
| `product-roadmap.md` | v2.0 → **v2.1** | New **Phase 7.5 — v1 Beta Hardening (ACTIVE)** block: Builds 11/11.5/12, beta actuals (163 users, 88 Android / 75 iOS), pointer to `execution-prd-next-batch.md` as the working spec, and the note that v1's epub.js choice feeds the v2 reader decision (TASK-125). |
| `go-to-market.md` | v2 → **v2.1** | **Reality-check addendum** at the top: real beta base (163 users, Android majority) vs. July's waitlist projections — re-baseline targets at next Sunday review; Masobe launch noted; Oyinadé named flagship beta user; elapsed weeks of the § 7 plan marked directional; Oct 13 target stands until explicitly moved. Masobe added to the § 2 wedge list (gracious externally, sharp internally). |
| `docs/supply/target-list.md` | — | **Masobe entry (#4) reshaped**: collab-first pitch (their titles renting on Flipbook non-exclusive), never the first publisher call, compete-if-declined. **Masobe urgency lever** added to the Tier 1 pitch note (use with every other publisher). **Oyinadé/Lumee added as ally A0** (founding-partner, v2 design-partner candidate, community-intro source). |
| `CLAUDE.md` | — | Planning-docs index rewritten: `execution-prd-next-batch.md` flagged as the ACTIVE workstream at the top; all doc versions and one-line descriptions updated; model-math, synthesis, supply/, and the operational playbooks (beta-readiness, onboarding-flows, store-listing) now listed. |
| `waitlist-landing-page-copy-v4.md` | — | Status banner: this is the **current live** site copy (v1 positioning); replaced by `landing-page-copy.md` at v2 cutover (TASK-194); v1-v3 drafts marked superseded. |
| `landing-page-copy.md` | v2 | Brand guardrail softened: shame framing still banned in copy; streaks/goals now permitted product features (celebration framing if ever marketed). |
| `synthesis-aug-2026.md` | — | WP-15 marked DONE (this review executed it). Earlier amendments (Android reversal, EPUB-in-v1) were already applied Aug 15. |

## 2. Reviewed, no changes needed

- **`model-math.md` + `flipbook-model.xlsx`** — assumptions unaffected by this round. Masobe's pricing (₦1,999 floor) sits *above* our Pro annual (₦1,550) and Band B rental (₦1,500), so the "we undercut" position holds without touching the model. Revisit only if the collaboration deal happens (Masobe titles would likely enter at Band C/D).
- **`docs/supply/author-pitch-email.md` + `author-term-sheet.md`** — terms unchanged (70/30, bands, 4-week rental, audio opt-out). Still accurate.
- **`beta-readiness.md`** — EAS/TestFlight playbook, still accurate; Phase 7.5 builds follow it.
- **`onboarding-flows.md`** — age-segmented onboarding spec tied to Phases 9/10; unaffected.
- **`store-listing.md`** — v1-positioned store copy ("Flipbook: Read Together"); correct for current stores. Needs a v2 rewrite at cutover — tracked implicitly under TASK-193; not urgent.
- **`execution-prd-next-batch.md`** — written Aug 15, already aligned; Phase 0 checked off by Claude Code (PR #3).
- **`synthesis-aug-2026.md`** — already amended for founder overrides.

## 3. Known open items (deliberate, not drift)

1. **GTM numbers need re-baselining against reality** (163 users vs. July projections) — flagged in the GTM addendum, owned by the next Moks + Ayodeji Sunday review. The docs now say so explicitly rather than carrying stale targets silently.
2. **`store-listing.md` v2 rewrite** — due at v2 cutover (TASK-193), not before.
3. **Streak/goal mechanics have no design yet** — the ideology now permits them; the design work is parked until post-catalog (per synthesis parking lot). When designed, they must honor the revised guardrails (personal/club-level, resettable without shame, no public ranking).
4. **`docs/archive/roadmap-v1.md`** — referenced by the roadmap but not yet created; v1 task detail lives in git history. Create only if someone actually needs it.
5. **Supply-outreach actuals unknown to the docs** — the target-list tracker columns (first send date, replies, outcomes) are only as current as Ayodeji keeps them. The docs can't self-verify this.

## 4. Alignment state after this review

Every guiding doc now tells the same story: **v1 is live and being hardened (Phase 7.5 / execution PRD) while v2 (catalog + rentals + Pro) is built on a 90-day clock; the product optimizes for the daily reading habit with growth mechanics in-bounds and shame mechanics banned; Android is the majority platform; Masobe validated the market and sharpened the supply pitch; and the flagship beta user is a named, cultivated relationship.** Any agent (or human) reading `CLAUDE.md` → `execution-prd-next-batch.md` → the planning docs will get a consistent picture.
