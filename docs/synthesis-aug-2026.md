# Flipbook — Synthesis, Work Plan & Execution Plan

**Date:** August 15, 2026
**Owners:** Moks + Ayodeji
**Inputs synthesized:** current app state (beta-feedback branch), confirmed iOS bugs, user feedback (Oyinadé Balógun / Lumee Book Club + reader requests), ideology flags, Masobe competitive intel, and the v2 roadmap (`product-roadmap.md` v2.0).
**Companion docs:** `product-vision.md` v2.0, `prd.md` v2.0, `product-roadmap.md` v2.0, `go-to-market.md` v2, `model-math.md`.

---

# PART 1 — SYNTHESIS

## 1.1 The one-paragraph read

Flipbook is running two products at once: a live v1 (clubs + PDF uploads, iOS on TestFlight build 10) with real users generating real feedback, and a planned v2 (catalog + rentals + Pro) that reuses v1's community primitives. The synthesis of everything received says: **v1's live experience has two regressions that are actively hurting the exact users we need as v2 evangelists; the single highest-leverage insight is that most of what users are asking for is already specced in v2; the ideology shift (growth-first, habit-forming mechanics allowed) resolves three previously-blocked feedback items; and Masobe's app launch raises supply-side urgency while validating the market.** The work plan that falls out is not "do everything" — it's a strict sequence: secure the work (git), fix the regressions, ship the retention basics that v1 and v2 share, keep the v2 build on its critical path, and use Masobe's launch as a forcing function in publisher conversations.

## 1.2 Item inventory, grouped by theme

### Theme A — Work at risk (infrastructure hygiene)

| ID | Item | Severity |
|---|---|---|
| ST-04 | `beta-feedback` is 12 commits ahead of origin; work exists on one machine only | **Critical — single point of failure** |
| ST-05 | `main` far behind (`5495819`); hasn't absorbed beta-feedback work | High |
| ST-06 | Android cleanup commit `82a028f` never rebuilt/device-verified since `a55a27b9` | Low-medium |
| ST-07 | Stale branch `feat/native-highlight-ios` — safe to delete | Trivial |

### Theme B — Live regressions (iOS, build 10)

| ID | Item | Severity |
|---|---|---|
| BUG-001 | Highlight requires double-tap-then-drag; expected press-and-hold + drag handles | High — breaks the app's signature interaction |
| BUG-002 | Books no longer resume at last-read page; always open at page 1 | **Critical — breaks the basic reader contract, corrupts the beta experience for every active reader** |

Both regressions arrived with the native highlight module ship. Both sit in the `ReaderScreen.tsx` ↔ native-module boundary. Both must be fixed and shipped as **build 11 before anything else ships**, because every day they're live, they erode exactly the beta cohort (Oyinadé's club, the parents' students, the founding-partner clubs) whose word-of-mouth the v2 launch depends on.

### Theme C — Feedback already answered by v2 (validate, don't rebuild)

These items require **no new design work** — they're already in `prd.md` v2.0. The action is to note them as *validated by real users* and keep the v2 build moving:

| ID | Feedback | v2 answer |
|---|---|---|
| FB-001 | EPUB support (Oyinadé's #1 blocker — she hasn't read a book on the app because of it) | v2 catalog is EPUB-native (FR-030) |
| FB-002 | Multi-genre per book | `books.genreTags` array (v2 schema) |
| FB-008 | Cover photo + synopsis at upload | `books.coverImageStorageId`, `description` (v2 schema) |
| FB-003 | Paragraph-level highlight + comment | Shipped in build 10 — pending BUG-001 fix to be actually usable |

**Bridge decision (AMENDED Aug 15, founder override):** EPUB upload IS back-ported into v1 in the next update — clubs can upload PDF or EPUB. Rationale: improves the live experience now, unblocks the flagship user (Oyinadé), and the EPUB reader work (epub.js-based, cross-platform) directly de-risks and prefigures the v2 catalog reader. Rich metadata (cover/synopsis/multi-genre) remains v2-only unless trivially cheap during the upload-flow touch. See `docs/execution-prd-next-batch.md` Phase 4.

### Theme D — Retention & habit surface (the ideology shift, applied)

The IDEO block resolves the tension flagged during intake. New position, formally adopted:

> **Flipbook optimizes for daily return, not session length.** The goal is that reading on Flipbook becomes a daily habit. Mechanics that build that habit — streaks, contextual nudges, re-engagement notifications and emails, progress celebration — are in-bounds and encouraged. Mechanics that inflate time-in-app without serving reading — infinite scroll, engagement-bait feeds, rage-driven notification spam — remain out.

This reframe (daily-return vs. time-in-app) keeps a principled line while opening the growth toolkit. What it unblocks:

| ID | Item | Status under new ideology |
|---|---|---|
| FB-011 | Push nudges back to the current book | **Unblocked.** Ship as "reading reminder" — user-schedulable, on by default, contextual copy ("Chapter 5 of *Thirteen* is waiting — Tolu is 2 pages ahead of you"), never shame-toned |
| FB-012 | Re-engagement emails to club owners + readers | **Unblocked.** Weekly club digest (owner) + reading-progress email (reader). Encouraging, not guilt-driven |
| FB-004/FB-014 | In-app + push notifications: new book in club, reaction replies, made-a-mod | **Unblocked and partially shipped** (mod-promotion + unreadCount already live in build 10). Remaining: new-book-in-club fanout, reaction-reply push |
| FB-009 / IDEO-004 | Club-level reading-goal marker ("books we read this year") | **Parking lot**, revisit in v2 roadmap. Noted as club-level (ambient, collective) rather than individual leaderboard when it comes |
| — | Streaks / daily-reading mechanics | **Now permitted.** Not yet designed. Enters the backlog as a v2-era feature (post-catalog), because a streak on a rental catalog ("you've read every day for 12 days") is far stronger than a streak on a PDF-upload app |

**Doc consequence:** `product-vision.md` v2 §1 (Core Values), §3 (Product Principles), §4 (Brand Anti-Patterns) need a values-revision pass. The anti-patterns to *keep*: no infinite scroll, no engagement-bait feeds, no public follower counts, no fake urgency, never feel cheap, never use "platform." The anti-patterns to *revise*: "never gamify reading" → "gamify reading only in service of the reading habit, never as anxiety"; "no streaks" → streaks allowed, gentle-toned; "no push nudges" → contextual nudges allowed. This edit is scheduled in the work plan (WP-15), not done silently here.

### Theme E — Product polish backlog (real, not urgent)

| ID | Item | Disposition |
|---|---|---|
| FB-005 | Moderator broadcast messages to club | Backlog — reading-shaped, fits North Star; natural companion to notifications work |
| FB-006 | Bookmark: livelier tap feedback + visible page mark | Backlog — small, high-delight; candidate for build 12 |
| FB-007 | Reader page colors follow app theme / user choice | Backlog — merges with v2 reader work (FR-032 already specs themes in reader) |
| FB-010 | Richer user-profile view | Backlog — design task first |
| FB-013 | Tablet responsiveness | Backlog — deferred to v2-era; noted demand signal |
| ST-02 | iOS page-by-page (horizontal) reading mode inert | Backlog — fold into the same reader-work window as BUG-001/002 if cheap, else defer |
| ST-03 | Android highlight integration (needs page-turn gesture) | **AMENDED Aug 15 (founder override):** Android PDF module stays open and is now high priority — 88 of 163 users (54%) are on Android, making it the majority platform. The module gets scroll/page-turn work + ReaderScreen integration in the next batch. See `docs/execution-prd-next-batch.md` Phase 3. |

### Theme F — Competitive & supply (Masobe)

- **Masobe App is live**: single-publisher subscription reading (₦1,999/2 books, ₦3,999/5, ₦5,999 unlimited; $2-6 international), offline reading, physical-paperback ordering. No community layer, no rental, no multi-publisher catalog.
- **Read:** adjacent, not head-on. It's a publisher's storefront; Flipbook is a library-and-club. Overlapping surface, different primitive.
- **Strategy adopted:** collaboration-first (pitch Masobe titles renting on Flipbook non-exclusive at 70/30 with featured shelf), compete-if-declined (undercut on price, own community, sign the publishers and indies they can't).
- **Urgency lever for supply:** Cassava/Farafina/Ouida/Parrésia just watched a rival publisher build distribution. "Build your own moat or use ours" goes into Ayodeji's pitch immediately.
- **Doc consequences:** target-list entry #4 (Masobe) reshaped; competitive narrative in product-vision gets a Masobe paragraph; model-math unchanged (we already price below their floor).

### Theme G — People

- **Oyinadé Balógun (Lumee Book Club)** is the persona made flesh: club founder, articulate, engaged, already evangelizing ("We need more home-grown tech-in-literature initiatives"). Action: personal reply from Moks, founding-partner status, first-name-basis feedback loop. She is also the ideal **first design-partner for the v2 catalog beta**.
- Her email also carried the Masobe intel — evidence the beta cohort is a sensing network, not just a QA pool.

## 1.3 Contradictions found and resolved

1. **"Fix everything now" vs. "v2 is the priority."** Resolved by the bridge principle: *v1 gets regression fixes and shared-infrastructure work only; all new capability lands in v2.* Notifications and re-engagement are shared infrastructure (v2 needs them too) — build once, on the v1 surface, designed for v2 reuse.
2. **Growth mechanics vs. brand anti-patterns.** Resolved by the daily-return reframe (Theme D). The brand keeps its taste; the growth toolkit opens.
3. **Android parity vs. not wasting work.** Resolved: no more Android PDF investment; Android parity arrives with the v2 EPUB reader.
4. **Oyinadé's asks vs. v1 upload surface.** Resolved: no back-ports; her asks are v2 validation, and she's told so personally.

---

# PART 2 — PRIORITIZED WORK PLAN

Ordered by (urgency × impact × dependency). Each item has an owner and a week target. Weeks count from Monday Aug 17, 2026.

## Wave 0 — Today/tomorrow (before any other work)

| # | Item | Owner | Detail |
|---|---|---|---|
| WP-01 | **Push `beta-feedback` to origin** | Moks | `git push origin beta-feedback`. 12 commits, weeks of native-module work, exists on one machine. This is a 30-second insurance policy against total loss. Do it before reading the rest of this doc. |
| WP-02 | Merge `beta-feedback` → `main` (or PR + merge) | Moks | `main` at `5495819` is dangerously stale. Merge so main reflects shipped reality (build 10 is *live on TestFlight* — main should contain what's shipped). |
| WP-03 | Delete stale `feat/native-highlight-ios` | Moks | Housekeeping, zero risk. |

## Wave 1 — This week (Aug 17-23): regression fixes → build 11

| # | Item | Owner | Detail |
|---|---|---|---|
| WP-04 | **Fix BUG-002 (resume at last-read page)** | Moks | Critical. Diagnostic path in Part 3 §3.2. |
| WP-05 | **Fix BUG-001 (press-and-hold selection)** | Moks | High. Diagnostic path in Part 3 §3.1. |
| WP-06 | Regression-test the reader end-to-end on device | Moks | Selection, highlight, thread-open, resume, progress-sync, offline. Manual matrix in Part 3 §3.4. |
| WP-07 | **Ship build 11 to TestFlight** | Moks | Contains only the two fixes + trivial cleanups. Small diff = safe ship. |
| WP-08 | Personal reply to Oyinadé | Moks | Thank her; tell her highlight+annotation shipped (and the gesture fix is coming in days); tell her EPUB is the heart of the next major release; invite her to founding-partner status. Costs 20 minutes, buys an evangelist. |
| WP-09 | Masobe-urgency update to supply pitches | Ayodeji | Update target-list #4; add "publishers are building moats" urgency line to Cassava/Farafina/Ouida pitches; continue founding-30 outreach. |

## Wave 2 — Weeks 2-3 (Aug 24 - Sep 6): retention infrastructure (shared v1/v2)

| # | Item | Owner | Detail |
|---|---|---|---|
| WP-10 | Complete the notifications matrix | Moks | Already live: mod-promotion, unreadCount, paginated list. Add: new-book-in-club fanout (FB-004), reaction-reply push (FB-014). Design the payload/fanout so v2 events (rental-expiring, chapter-drop) plug into the same module. |
| WP-11 | Reading-reminder push (FB-011) | Moks | User-schedulable daily reminder, on by default at a sane hour, contextual copy pulling current book + club position. Settings toggle. This is the first artifact of the new daily-return ideology. |
| WP-12 | Re-engagement email pair (FB-012) | Ayodeji (content) + Moks (wiring) | Weekly club-owner digest + reader progress email via existing Convex email plumbing (`sendWelcomeEmail` pattern). Warm tone, zero guilt. Unsubscribe honored. |
| WP-13 | Bookmark polish (FB-006) | Moks | Small: livelier tap animation + visible corner mark on bookmarked pages. Ship inside any Wave 2 build. |
| WP-14 | Android build re-verification | Moks | Rebuild from current head (includes `82a028f`), smoke-test the old reader path on device. Closes ST-06. No new Android feature work. |
| WP-15 | Values revision in product-vision.md — **DONE Aug 15** (applied to `product-vision.md` v2.1, `vision.json` v2.1, `prd.md` FR-112 during the foundation-docs alignment review) | Moks + Ayodeji (30-min sit-down) | Rewrite Core Values + Anti-Patterns per Theme D. The daily-return principle goes in writing; the kept anti-patterns stay in writing. This prevents future-us relitigating. |

## Wave 3 — Weeks 3-6 (Sep 7 - Oct 4): v2 critical path (unchanged, now user-validated)

The v2 build continues per `product-roadmap.md` Phases 11-16 — the feedback round *strengthened* the case for the existing plan (EPUB, catalog metadata, multi-genre all user-demanded). Priorities within the phase order, restated with the new context:

| # | Item | Owner | Detail |
|---|---|---|---|
| WP-16 | EPUB reader decision + integration (TASK-125/126) | Moks | Now doubly urgent: it's v2's core *and* the answer to the flagship user's blocker *and* Android's parity path. Reader choice must support: press-and-hold selection (BUG-001's lesson), per-paragraph anchoring, resume-position (BUG-002's lesson — make it a launch acceptance criterion), theme-following page colors (FB-007). |
| WP-17 | Catalog + rental foundation (TASK-122-137) | Moks | Per roadmap. |
| WP-18 | Supply sprint to 15+ signed authors | Ayodeji | Founding-30 target; Masobe urgency lever in every publisher conversation. |
| WP-19 | Masobe collaboration pitch | Ayodeji | After 2-3 other publisher conversations are warm (never make the rival publisher the first call). Offer: non-exclusive rental at 70/30, featured shelf, community layer they don't have to build. |
| WP-20 | Profile-view design (FB-010) + tablet audit (FB-013) | Moks (design time) | Design-only this wave; build later. Tablet: audit which screens break, cost the fix, schedule into v2 UI work if cheap. |

## Parking lot (explicitly deferred, revisit at v2 launch)

- Club-level reading-goal marker / books-read-this-year metric (FB-009 / IDEO-004) — flagged as "really useful in the v2 roadmap"; club-level ambient framing when it comes.
- Streak mechanics design — after the catalog exists; streaks-on-rentals are the strong version.
- Moderator broadcast messages (FB-005) — bundle with a future notifications/messaging wave.
- iOS horizontal page-mode (ST-02) — only if the reader window makes it nearly-free; else it dies with the PDF reader in v2.
- Android PDF module — formally closed. Parity via v2 EPUB reader.

---

# PART 3 — TECHNICAL EXECUTION PLAN

Constraint honored throughout: **the live v1 iOS app (build 10 users) must never be broken.** Every change ships behind the smallest possible diff, on-device verified, with a rollback path.

## 3.0 Ground rules

1. **One concern per build.** Build 11 = regression fixes only. Build 12 = notifications/retention. No mixing.
2. **Branch discipline.** After WP-01/02: feature branches off `main`, PR into `main`, `beta-feedback` retired or fast-forwarded to main. No more long-running divergence.
3. **Convex prod is shared between v1 and v2.** All v2 schema work is *additive* (new tables) or *renames handled as additive-then-migrate* (communities). Never edit a v1-serving function's contract in place; add a v2 variant, cut clients over, deprecate later.
4. **Device verification is mandatory for reader changes.** The reader regression escaped because the highlight ship was verified for highlighting but not for the surrounding lifecycle. Every reader PR runs the §3.4 matrix before merge.

## 3.1 BUG-001 — Press-and-hold text selection

**Symptom.** Selection requires quick double-tap-then-drag. Expected: long-press starts selection, drag handles extend it (iOS-native behavior every user knows).

**Likely cause.** The native highlight module's custom gesture recognizer is intercepting or replacing PDFKit's default long-press selection path. Two common variants:
- A custom `UILongPressGestureRecognizer`/`UITapGestureRecognizer` added for highlight-tap-to-open-thread is winning the gesture arbitration against PDFKit's built-in text-selection interaction, so the built-in long-press never fires; the double-tap path that works is PDFKit's *other* built-in (double-tap word-select) which the custom recognizer doesn't shadow.
- Or selection was reimplemented from scratch on touch events (given the Android module needed exactly that), inheriting the double-tap trigger.

**Fix path.**
1. In the iOS module, inventory every `UIGestureRecognizer` added to `PDFView` or its subviews, and every point where `isUserInteractionEnabled` / `gestureRecognizer(_:shouldRecognizeSimultaneouslyWith:)` is customized.
2. Restore PDFKit's native selection: long-press → selection with drag handles comes free from `PDFView` unless something shadows it. The custom tap-a-highlight recognizer should (a) require the built-in long-press to fail first (`require(toFail:)`) or (b) be scoped to taps that land on an existing highlight annotation (hit-test annotations before claiming the touch, cancel otherwise).
3. The highlight-creation flow then reads `pdfView.currentSelection` on menu action (the standard `UIMenuController` / `UIEditMenuInteraction` path), instead of driving selection itself.
4. Acceptance: long-press selects a word with handles; dragging handles extends selection; the highlight/react menu appears on selection; tapping an existing highlight still opens its thread; double-tap still does word-select (native default); no orphan annotations.

**Risk.** Low-medium. Gesture arbitration changes can subtly break the tap-to-open-thread path — the §3.4 matrix covers both.

**Rollback.** The module is iOS-gated and additive; worst case, revert the gesture commit and re-ship build 10 behavior while re-approaching.

## 3.2 BUG-002 — Resume at last-read page

**Symptom.** Since the highlight update, books always open at page 1. Progress *display* elsewhere (club progress bars) may still be correct — distinguish during diagnosis.

**Diagnosis order (most likely first).**
1. **Initial-page prop never applied to the native view.** The old `react-native-pdf` `<Pdf page={n}>` path had resume built in. The new native PDFKit view likely mounts and calls `go(to:)` never, or before the document finishes loading (a classic race: `document` not yet set when the jump is issued, so it's a no-op and the view stays at page 1). Check `ReaderScreen.tsx` for where `initialPage`/`currentPage` from the `progress` query is passed to the native component, and check the native side for *when* it applies it. Fix: apply the jump in the document-did-load callback, not at init.
2. **Progress read path broken.** The Convex `progress` query may be returning correctly but the value discarded because the native component's prop contract changed (renamed prop, type mismatch — silently ignored over the bridge).
3. **Progress write path broken.** If the native view no longer emits page-change events (or emits them with a different event name), `progress.updatedAt`/`currentPage` stops updating, so even a correct read returns stale page 1. Verify rows in Convex prod for your own test reads since build 10's ship date — if `currentPage` is frozen, the write path is the bug (and club progress bars are silently stale too, which makes this worse than reported).
4. Acceptance: open book → read to page N → background the app → relaunch → book opens at page N. Also: force-quit variant, offline variant, and the club progress bar reflects N.

**Risk.** Low once located — this is lifecycle plumbing, not architecture.

**Note for v2:** resume-position becomes an explicit acceptance criterion on the EPUB reader integration (WP-16) so this class of regression can't ship silently again.

## 3.3 Retention infrastructure (Wave 2) — build once for v1 and v2

**Notifications module (WP-10).** The shipped module (schema type, fanout, `unreadCount`, paginated `list`) is the right foundation. Additions:
- New event types as *data*, not new code paths: extend the notification `type` union (`new_book_in_club`, `reaction_reply` push) and reuse the existing fanout. The v2 types (`rental_expiring`, `chapter_drop`, `payout_sent`) are future union members on the same table — designed now, added later.
- Fanout for new-book-in-club: trigger inside the existing book-registration mutation (v1) — one internal function, N memberships → N notification rows + push tickets via the existing Expo push path.
- Idempotency: notification creation keyed on (userId, type, relatedId) where sensible to avoid duplicate fanout on retried mutations.

**Reading-reminder push (WP-11).**
- Convex cron (hourly) scans users with reminders enabled whose local reminder hour matches, joins their most-recent `progress` row, composes contextual copy, sends via Expo push. Store `reminderHour` + `reminderEnabled` on `users` (additive schema change, default enabled at 19:00 local — confirm default).
- Copy rules per the revised values: name the book, name the club position ("the room is just ahead of you"), never shame.

**Re-engagement emails (WP-12).**
- Reuse the `sendWelcomeEmail` scheduling pattern: weekly cron → per-club digest for owners (new members, reactions count, current book position), per-reader progress note. Batch-send with per-user unsubscribe flags (additive `emailPrefs` on `users`).

**Rollback for all Wave 2:** every feature is flag-gated by its own schema field default (reminders off = no cron sends; email prefs default off until launch toggle). Server-side kill = set defaults false; no client re-ship needed.

## 3.4 Reader regression matrix (run on device before merging any reader PR)

1. Open book fresh → lands on last-read page (or page 1 if genuinely new).
2. Long-press a word → selection handles appear → drag to extend → highlight → annotation persists, no orphan.
3. Tap an existing highlight → thread opens with quoted context.
4. Drop a reaction from the thread → appears for a second account in the same club.
5. Read 5+ pages → force-quit → relaunch → resume correct; club progress bar correct on second device.
6. Airplane mode: open cached book, read, highlight → reconnect → progress + highlight sync.
7. Scroll performance on a 300+ page PDF — no jank regression.
8. (Post-BUG-001 fix) Double-tap word-select still works; no gesture conflicts with page scroll.

## 3.5 Sequencing & safety summary

```
Day 0:        WP-01 push → WP-02 merge to main → WP-03 branch cleanup
Week 1:       BUG-002 fix → BUG-001 fix → §3.4 matrix → build 11 → TestFlight
              (Ayodeji parallel: Oyinadé reply drafted for Moks, Masobe-urgency pitches out)
Weeks 2-3:    Notifications additions → reminder push → email pair → bookmark polish
              → build 12 → Android re-verify build (ST-06 closed)
              → values revision sit-down (WP-15) → product-vision.md edit
Weeks 3-6:    v2 critical path resumes full-speed (EPUB reader decision is the gate)
              Supply sprint + Masobe collab pitch when warm
Continuous:   branch discipline; additive-only schema on shared prod; device
              matrix on every reader PR; one concern per build
```

**What would make this plan fail, and the guard against each:**
- *Fixing the bugs introduces new reader regressions* → §3.4 matrix is mandatory, small diffs only, build 11 contains nothing else.
- *Wave 2 scope-creeps into v2 delay* → Wave 2 is capped at the five listed items; anything else goes to the parking lot.
- *Supply outreach stalls while heads are down in code* → the waves are split by owner; Ayodeji's track never blocks on Moks's.
- *The machine dies before the push* → WP-01 is Wave 0, today.

---

*End of synthesis. The next edit to `product-vision.md` (values revision, WP-15) and `docs/supply/target-list.md` (Masobe reshape, WP-09) should reference this doc.*
