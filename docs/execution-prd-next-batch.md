# Execution PRD — Next Batch (Builds 11 & 12)

**Date:** August 15, 2026
**Audience:** Claude Code (primary executor) + Moks (reviewer, device tester)
**Source decisions:** `docs/synthesis-aug-2026.md` (as amended Aug 15) + founder overrides: Android is the majority platform (88/163 users) and must reach reader parity; EPUB upload ships in v1 now.
**Public commitment:** Moks told Oyinadé (Lumee Book Club) on Aug 10 that a sustainable highlight solution lands "this week." Phases 1-2 are past due. Treat as top priority.

---

## 0. Context primer (read fully before any code)

### What this app is
Flipbook v1: mobile book-club app. Clubs upload books, members read in-app, reactions/comments anchor to pages, progress syncs in real time. Expo (React Native) + Convex (prod deployed) + Clerk. iOS ships from TestFlight (build 10, commit `156cb3f`); Android's last EAS build was `a55a27b9` (2026-07-30).

### Current state you are inheriting
- Branch `beta-feedback` is 12 commits ahead of origin — **Phase 0 fixes this before anything else.**
- iOS reader uses a custom native module: `modules/native-highlight-pdf/` (PDFKit-based). Android side of the same module (PdfiumAndroid-based) has working text-selection + highlight (proven in a test harness) but **no scrolling/page-turning** and is **not wired into the app**.
- `src/screens/reader/ReaderScreen.tsx` line 268: `const useNativeHighlightReader = Platform.OS === "ios";` — Android still renders the legacy `react-native-pdf` `<Pdf>` path (no highlighting).
- Two live iOS regressions shipped with build 10 (see Phases 1-2).

### Key file anchors (verified against the repo on Aug 15)
| Path | What lives there |
|---|---|
| `src/screens/reader/ReaderScreen.tsx` | The reader. `initialPage` memo at ~198; `openAtPageRef` freeze logic at ~238-244; native path renders `<NativeHighlightPdfView startPage={...}>` at ~531; legacy path renders `<Pdf page={...}>` at ~557. |
| `src/screens/reader/ReactionComposer.tsx` | Reaction/comment composer with quoted-context support. |
| `modules/native-highlight-pdf/ios/NativeHighlightPdfView.swift` | iOS native view. Events: `onDocumentLoaded`, `onPageChanged`, `onSelectionChanged`, `onHighlightTapped`, `onLoadError`. **Line ~91 comment admits prop application order between `documentUri` and `startPage` isn't guaranteed — prime suspect for BUG-002.** Highlight annotation creation ~147. |
| `modules/native-highlight-pdf/ios/NativeHighlightPdfModule.swift` | Expo module definition / prop bindings. |
| `modules/native-highlight-pdf/android/src/main/java/expo/modules/nativehighlightpdf/NativeHighlightPdfView.kt` | Android native view (PdfiumAndroid). Selection + coordinate mapping proven. No scroll container. |
| `modules/native-highlight-pdf/src/` | JS API: `NativeHighlightPdfView.tsx`, types, index. |
| `convex/progress.ts` | `update` (mutation), `getMine`, `listForClub`, `listMine`, `listMyLibrary`. |
| `convex/books.ts` | `generateUploadUrl`, `register`, `get`, `listForClub`, `currentForClub`, `setCurrentlyReading`, `updateMetadata`, `remove`, `moveToLibrary`. |
| `convex/schema.ts` | v1 schema. `books` table: `pdfStorageId`, `pdfPageCount`, etc. |
| `convex/_generated/ai/guidelines.md` | **Read before any Convex change. Its rules override training data.** |

### Non-negotiable ground rules
1. **Never break live users.** Build 10 is in real hands (163 users). All Convex schema changes are **additive** (new optional fields, new tables). Never change an existing function's argument or return contract — add a variant if needed.
2. **One phase per PR. One concern per build.** Build 11 = Phases 1-2 (+ 0). Build 11.5 (Android) = Phase 3. Build 12 = Phase 4 (+ Phase 5 if it fits cleanly).
3. **Device verification is mandatory for reader changes.** Every reader-touching PR must list the §6 matrix results in its description. Simulator is insufficient for gesture work — flag any step you cannot verify in simulator so Moks runs it on hardware.
4. **Commit messages** reference the phase + task ID from this doc (e.g., `P1-T2: apply startPage after documentDidLoad`).
5. If a fix requires deviating from this plan, **stop and flag it in the PR** rather than silently improvising. Small implementation details are yours; architectural choices are not.
6. Never run destructive git commands. Never force-push. Never touch `docs/` content except the checkboxes in this file.

---

## Phase 0 — Secure the work (do first, ~10 minutes)

- [x] **P0-T1.** `git push origin beta-feedback` — 12 unpushed commits are a single point of failure.
- [x] **P0-T2.** Open a PR `beta-feedback` → `main`, merge it (build 10 is live; `main` must reflect shipped reality). If merge conflicts arise in `docs/*` or `vision.json`, keep the newest (working-tree) versions. *(No conflicts — clean fast-forward, `main` had no commits `beta-feedback` lacked. Merged as [PR #3](https://github.com/FlipbookClub/flipbook/pull/3).)*
- [x] **P0-T3.** Delete branch `feat/native-highlight-ios` (fully merged, stale). *(Local only — never existed on origin.)*
- [x] **P0-T4.** From here on: feature branches off `main` (`fix/reader-resume`, `fix/selection-gesture`, `feat/android-native-reader`, `feat/epub-v1`), PRs into `main`.

**Acceptance:** `git status` clean; origin has everything; `main` == shipped build 10 + docs.

---

## Phase 1 — BUG-002: books must resume at last-read page (Critical)

**Symptom.** Since build 10, every book opens at page 1 instead of the last-read page. Regression arrived with the native reader integration.

**Diagnosis order (stop at first confirmed cause; there may be more than one):**

- [ ] **P1-T1.** Check the write path first: query Convex prod `progress` rows for recent test accounts. If `currentPage` hasn't advanced since build 10 shipped, the native reader's `onPageChanged` event is not reaching `progress.update` — inspect the event wiring in `ReaderScreen.tsx` (is the handler attached to the native path or only the legacy `<Pdf>` path?) and the payload shape (`page` field name/type must match what the mutation expects).
- [ ] **P1-T2.** Check the native prop race: `NativeHighlightPdfView.swift` line ~91 admits `documentUri`/`startPage` prop-order isn't guaranteed. If `startPage` is applied before the document loads, `PDFView.go(to:)` is a silent no-op. **Fix pattern:** store the requested start page in the view; apply it inside the document-did-load path (where `onDocumentLoaded` fires); guard against double-application if the prop re-fires.
- [ ] **P1-T3.** Check the JS freeze logic: `ReaderScreen.tsx` ~198-244. `initialPage` falls back through `serverProgress?.currentPage ?? cached?.page`. Verify `openAtPageRef` cannot freeze a value of `1` (or `undefined` coerced) while `serverProgress` is still loading. The guard `initialPage !== null` only protects if the memo returns `null` (not `1`) during load — confirm and fix if the fallback chain short-circuits to a default prematurely.
- [ ] **P1-T4.** Regression test on device per §6 items 1, 5, 6 (resume, force-quit resume, offline resume). Both fresh-install and upgrade-from-build-10 paths.

**Acceptance:** read to page N → background → relaunch → opens at N. Force-quit variant passes. Club progress bars reflect N on a second account. Legacy `<Pdf>` path (Android) unaffected.

---

## Phase 2 — BUG-001: press-and-hold selection (High)

**Symptom.** Selection requires quick double-tap-then-drag. Expected iOS-native behavior: long-press starts selection with drag handles; user extends across a block of text; highlight/react menu follows.

**Approach (iOS, `NativeHighlightPdfView.swift`):**

- [ ] **P2-T1.** Inventory every gesture recognizer the view adds to `PDFView`/its subviews, plus any `gestureRecognizer(_:shouldRecognizeSimultaneouslyWith:)` / delegate overrides. Identify which one shadows PDFKit's built-in long-press text selection.
- [ ] **P2-T2.** Restore native selection: PDFKit's `PDFView` provides long-press → selection-with-handles for free unless a custom recognizer wins arbitration. Scope the custom tap-recognizer (highlight-tap-to-open-thread) so it only claims touches that hit-test onto an existing highlight annotation; otherwise let the touch pass through. If needed, `require(toFail:)` the built-in interactions.
- [ ] **P2-T3.** Drive highlight creation from `pdfView.currentSelection` via the selection-changed path / edit menu — do not synthesize selection from raw touches on iOS.
- [ ] **P2-T4.** Preserve existing behaviors: tap-a-highlight-opens-thread, quoted context in composer, no orphan annotations, double-tap word-select still works.
- [ ] **P2-T5.** Device matrix §6 items 2, 3, 4, 8.

**Acceptance:** long-press a word → handles appear → drag to extend → highlight/react → annotation persists and threads correctly. All build-10 highlight behaviors intact.

**Ship gate → Build 11:** Phases 0-2 complete, §6 matrix green on a physical iPhone → bump build number → EAS build → TestFlight. Nothing else rides in this build.

---

## Phase 3 — Android native reader integration (majority-platform parity)

**Why now:** 88 of 163 users are on Android and have no highlighting at all. The module's hard part (selection + coordinate mapping on PdfiumAndroid) is already proven; what's missing is scrolling and integration.

- [ ] **P3-T1. Add continuous vertical scroll to the Android module.** Match the iOS reader's interaction model (continuous vertical scroll — do NOT invent a page-swipe model iOS doesn't have). Recommended shape: a `RecyclerView` of per-page rendered bitmaps (PdfiumAndroid renders per page; recycle aggressively; render at device resolution with a lower-res placeholder while scrolling). Preserve the existing per-page selection touch handling — selection long-press and scroll must coexist (long-press wins on text; vertical drag wins on movement; standard Android touch-slop disambiguation).
- [ ] **P3-T2. Emit the same JS events as iOS** with identical payload shapes: `onDocumentLoaded`, `onPageChanged` (page = topmost fully-visible page), `onSelectionChanged`, `onHighlightTapped`, `onLoadError`. The JS layer must not need `Platform.OS` branches in event handling.
- [ ] **P3-T3. Apply the Phase 1 lesson from day one:** `startPage` must be applied after document load (scroll to page offset in a post-layout pass), never at prop-set time.
- [ ] **P3-T4. Apply the Phase 2 lesson from day one:** selection triggers on **long-press** (Android convention), with drag handles to extend. If PdfiumAndroid selection handles are custom-drawn, keep them simple (start/end pins).
- [ ] **P3-T5. Wire into `ReaderScreen.tsx`:** flip the gate at line ~268 to include Android once P3-T1..T4 pass in the test harness. All existing props (`startPage`, `documentUri`, highlight data) flow identically.
- [ ] **P3-T6. Highlight render + tap-to-thread parity** on Android: existing highlights render as overlays at correct coordinates (coordinate mapping already proven); tapping one opens its thread.
- [ ] **P3-T7. Android EAS build** from current head (naturally includes the unverified `82a028f` cleanup — closing ST-06) → internal testing track → §6 full matrix on a physical Android device (mid-tier, e.g., a Redmi/Samsung A-series, not a flagship).

**Acceptance:** an Android user can scroll-read a 300-page PDF without jank, long-press to select and highlight, tap highlights to open threads, resume at last-read page, and sync progress. Feature parity with iOS build 11 reader.

**Ship gate → Build 11.5 (Android) or fold into Build 12** if timing aligns. Do not hold the iOS bug-fix build for Android work.

---

## Phase 4 — EPUB upload + reading in v1

**Founder decision:** v1 clubs can upload **PDF or EPUB**, starting next update. This unblocks the flagship user and de-risks the v2 catalog reader (v2 is EPUB-native per `prd.md` v2 FR-030).

### 4A — Schema + upload (Convex, additive only)

- [ ] **P4-T1.** `convex/schema.ts` — add to `books`: `fileType: v.optional(v.union(v.literal("pdf"), v.literal("epub")))`. **Absent/undefined ⇒ `"pdf"` (legacy rows).** The existing `pdfStorageId` field stores the file for both types (yes, the name is now imperfect — renaming would force a migration; add a schema comment instead). `pdfPageCount` stays required; for EPUBs store the spine-item count (chapter count) — it feeds nothing critical for EPUBs.
- [ ] **P4-T2.** `convex/books.ts` `register` mutation — accept optional `fileType` arg (default `"pdf"`), validate: EPUBs pass the same 50MB cap; reject any other type. Do not change the existing argument contract — `fileType` is a new optional arg.
- [ ] **P4-T3.** Upload UI (club book-upload flow) — accept `.epub` (MIME `application/epub+zip`) in the document picker alongside PDF; show the file type in the upload confirmation.
- [ ] **P4-T4.** `convex/progress.ts` — additive fields on `progress` table: `locationCfi: v.optional(v.string())` and `percentComplete: v.optional(v.number())`. EPUB progress = CFI (precise resume) + percentage (display). PDF rows keep using `currentPage`/`totalPages` untouched. `progress.update` accepts the new optional args; club progress bars display `percentComplete` when present, else `currentPage/totalPages`.

### 4B — EPUB reader (cross-platform, WebView-based)

- [ ] **P4-T5.** New component `src/screens/reader/EpubReader.tsx`: **epub.js inside `react-native-webview`** (single implementation for iOS **and** Android — this is deliberate; no native module work for EPUB v1). Bundle epub.js locally (no CDN dependency at runtime — offline reading must work). Load the EPUB from the cached local file via a file URI or base64 bridge.
- [ ] **P4-T6.** Reader features for v1 EPUB — scoped to: continuous or paginated flow (epub.js `flow: "paginated"` recommended — closest to book feel), chapter navigation via TOC, font-size steps, and **theme-following page colors** (Light/Flip/Dark backgrounds via epub.js themes — this also delivers Oyinadé's FB-007 for EPUBs).
- [ ] **P4-T7.** Resume: on `relocated` events, debounce-persist `locationCfi` + `percentComplete` to `progress.update`. On open, `display(savedCfi)` **after** the book's `ready` promise resolves (the Phase 1 lesson, WebView edition).
- [ ] **P4-T8.** `ReaderScreen.tsx` routes by `book.fileType`: `"epub"` → `EpubReader`, else existing PDF paths. Keep the switch dumb and obvious.
- [ ] **P4-T9.** Offline: EPUB file cached to device on first open (same pattern as PDFs); reader works in airplane mode; progress syncs on reconnect.
- [ ] **P4-T10.** **Explicitly out of scope for this batch (do not build):** highlights/reactions inside EPUBs (page-anchored reactions don't map to reflowable text; CFI-range annotations are a designed follow-up — see Parking Lot), bookmarks on EPUB, EPUB metadata extraction beyond title. If any of these turn out to be nearly-free, flag in the PR — don't just add them.

### 4C — Multi-genre selection (founder-prioritized; ships in Build 12 with 4A/4B)

Current state (verified): `books.genre` is a single optional string (`convex/schema.ts` ~106), from the shared `GENRES` catalogue (`src/lib/genres.ts`), written in `books.register` and `books.updateMetadata`, edited in `src/screens/community/EditBookScreen.tsx`.

- [ ] **P4-T11.** Schema (additive): add `genres: v.optional(v.array(v.string()))` to `books`. **Keep the legacy `genre` field untouched** — do not migrate rows, do not remove the field. Cap at 3 genres per book, all validated against the `GENRES` catalogue.
- [ ] **P4-T12.** `books.register` + `books.updateMetadata`: accept new optional `genres` array arg (validated: 1–3 entries, each in catalogue, deduped). When `genres` is provided, also write `genre = genres[0]` for backward compatibility with any reader of the legacy field. Existing single-`genre` callers keep working unchanged.
- [ ] **P4-T13.** Read path: everywhere book genre is displayed, resolve as `genres ?? (genre ? [genre] : [])` — one shared helper in `src/lib/genres.ts` (e.g., `bookGenres(book)`), not scattered ternaries.
- [ ] **P4-T14.** UI: upload flow + `EditBookScreen.tsx` switch from single-select to multi-select chips (max 3, same catalogue, existing chip component styling). Display surfaces (book cards, book detail) render up to 3 genre chips.

**Acceptance:** a club uploads a book tagged "Mystery" + "Thriller"; both chips render on the book card; an old book with only legacy `genre` still displays correctly; editing an old book upgrades it to the array transparently.

**Acceptance:** a club uploads an `.epub`; members open it on iOS and Android; it renders paginated with TOC and theme-correct colors; closing and reopening resumes at the exact location; progress percentage shows on club surfaces; PDFs behave exactly as before. Oyinadé's club can read *Thirteen* as an EPUB.

**Ship gate → Build 12:** Phase 4 (+ Phase 5 if ready) → both stores.

---

## Phase 5 — Retention infrastructure (Build 12 co-passenger, per synthesis Wave 2)

Compressed spec; full context in `docs/synthesis-aug-2026.md` §3.3.

- [ ] **P5-T1.** Notifications: add `new_book_in_club` type + fanout inside the existing book-registration mutation path; add reaction-reply **push** (in-app row already exists). Reuse the shipped fanout/unreadCount module; extend the type union — no parallel code path.
- [ ] **P5-T2.** Reading-reminder push (FB-011): `users.reminderHour` + `reminderEnabled` (additive, default enabled at 19:00 local — Moks to confirm default before merge); hourly Convex cron matches local hour, pulls latest `progress` row, sends contextual copy via Expo push ("Chapter 5 of *Thirteen* is waiting — the room is just ahead of you"). Settings toggle. Never shame-toned; copy rules per `product-vision.md` voice guide.
- [ ] **P5-T3.** Bookmark polish (FB-006): livelier tap animation + visible corner mark on bookmarked pages (PDF reader only this batch).
- [ ] **P5-T4.** Re-engagement email pair (FB-012): weekly cron → club-owner digest + reader progress note, `sendWelcomeEmail` plumbing pattern, per-user `emailPrefs` (additive) with unsubscribe honored. **Ayodeji writes the copy; Claude Code wires the pipeline with placeholder copy and flags for review.**

**Acceptance:** each feature individually kill-switchable server-side (schema defaults), zero regressions to existing notification behavior.

---

## 6. Device verification matrix (run per reader-touching PR; paste results in PR description)

1. Open book fresh → lands on last-read page (or page 1 if genuinely new).
2. Long-press a word → selection handles appear → drag to extend → highlight → persists, no orphan.
3. Tap an existing highlight → thread opens with quoted context.
4. Drop a reaction → appears for a second account in the same club (real-time).
5. Read 5+ pages → force-quit → relaunch → resume correct; club progress bar correct on second device.
6. Airplane mode: open cached book, read, highlight (PDF) → reconnect → progress + highlight sync.
7. Scroll performance on a 300+ page PDF — no jank regression. (Android: mid-tier device.)
8. Double-tap word-select still works; no gesture conflict with scroll.
9. *(EPUB, from Phase 4)* Upload `.epub` → open on both platforms → paginate, TOC-jump, theme switch → close/reopen resumes exactly.
9b. *(Multi-genre, from Phase 4C)* Upload with 2 genres → both chips render; legacy single-genre book still displays; edit upgrades it.
10. *(Phase 5)* Reminder fires at set hour with correct book context; toggle off silences it.

## 7. Sequencing summary

```
Day 0:        Phase 0 (push, merge, cleanup)                    ← before anything
Days 1-4:     Phase 1 (resume) → Phase 2 (selection) → matrix → BUILD 11 → TestFlight
              ← public commitment to Oyinadé rides on this
Days 4-10:    Phase 3 (Android reader) → BUILD 11.5 → Play internal track
Days 8-16:    Phase 4 (EPUB v1) → Phase 5 (retention) → BUILD 12 → both stores
Continuous:   additive-only schema · one concern per build · matrix per reader PR
              · flag deviations, don't improvise architecture
```

## 8. Parking lot (do not build in this batch)

- EPUB highlights/reactions via CFI ranges (design doc first; the epub.js `annotations` API is the likely path).
- EPUB bookmarks.
- Horizontal page-by-page mode for the iOS PDF reader (only if Phase 2 work makes it nearly free — flag, don't build).
- Moderator broadcast messages (FB-005) — next notifications wave.
- Club reading-goal metrics (FB-009) — v2 roadmap parking lot per founder.
- Streak mechanics — post-catalog (v2 era).
- Rich upload metadata (cover photo + synopsis) in v1 — v2 catalog carries this; only add to v1 if the Phase 4 upload-flow touch makes it trivially cheap (flag first). **Multi-genre is NOT parked — it ships in this batch as Phase 4C (founder decision, Aug 15).**

---

*Claude Code: mark checkboxes as tasks complete, reference task IDs in commits, and keep PR descriptions honest about what was device-verified vs. simulator-verified vs. unverified.*
