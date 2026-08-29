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
*(Updated Aug 15 after Phases 0-2 landed. Anything below marked "rebuilt" replaced what build 10 shipped.)*

- Phase 0 is done: `main` reflects shipped build 10, and work happens on feature branches off `main`.
- **The iOS reader was rebuilt on an imperative-command architecture** (`fix/reader-resume`, commits `1ebbd7c` / `4a53bab`). This is the single most important thing to understand before touching reader code. See "Reader architecture" below.
- Android side of `modules/native-highlight-pdf/` (PdfiumAndroid-based) has working text-selection + highlight (proven in a test harness) but **no scrolling/page-turning** and is **not wired into the app**. It still carries the old reactive-prop shape that the iOS rebuild removed. Phase 3 must port it to the new model, not copy the old one.
- `src/screens/reader/ReaderScreen.tsx` ~311: `const useNativeHighlightReader = Platform.OS === "ios";` — Android still renders the legacy `react-native-pdf` `<Pdf>` path (no highlighting).
- Both build-10 iOS regressions (BUG-001, BUG-002) are fixed and device-verified. Build 11 has not shipped yet.

### Reader architecture (read before any reader work, iOS or Android)

The native view is **command-driven, not prop-driven.** JS calls `openDocument()` once and then only *listens* to `onPageChanged`. The native side owns scroll position outright. There are no `documentUri` / `startPage` / `highlights` props any more.

Why this matters: the old design had JS and native both trying to own "what page are we on," reconciled through deferred blocks that raced each other. Four rounds of targeted patches each fixed one race and revealed another. Two rules fall out of the rebuild, and **both apply to Android**:

1. **Nothing may move scroll position as a side effect of data changing.** `addHighlight` / `removeHighlight` never call `go(to:)`. Painting an annotation cannot move the reader, structurally, rather than by guard.
2. **The open must be keyed to the native view instance, not to mount.** React swaps the native view instance during post-mount layout churn (hiding the tab bar resizes the subtree repeatedly). A one-shot open leaves the replacement instance empty while the loaded one sits off-screen, which renders as a black page with a correct page counter. `ReaderScreen.tsx` handles this with a callback ref that bumps a generation counter (~320) and re-issues the open onto each new instance, restoring the current page rather than the original resume page.

**Debugging protocol for reader bugs:** these failures are near-impossible to reason about from screenshots, and each device round costs a 15-20 minute EAS build. After the *second* failed device round on one symptom, stop patching and add a native debug event stream (state at every transition, plus an instance identifier when object identity could be in play) logged through Metro. That is what found the black-screen bug, on its first run, after five failed theory-patches. `1ebbd7c` contains the instrumentation if it is needed again.

### Key file anchors (verified against the repo on Aug 15)
| Path | What lives there |
|---|---|
| `src/screens/reader/ReaderScreen.tsx` | The reader. `openDocumentWithRetry` helper at ~90 (covers the Fabric view-registration race); `initialPage` memo at ~228; platform gate at ~311; view-generation callback ref at ~320; open effect at ~555; highlight diff effect just below it; native view rendered at ~695, legacy `<Pdf>` at ~709. |
| `src/screens/reader/ReactionComposer.tsx` | Reaction/comment composer with quoted-context support. |
| `modules/native-highlight-pdf/ios/NativeHighlightPdfView.swift` | iOS native view (rebuilt). Events: `onPageChanged`, `onSelectionChanged`, `onHighlightTapped` (no `onDocumentLoaded`/`onLoadError` — `openDocument` throws instead). Commands: `openDocument` ~154, `setDisplayMode` ~194, `addHighlight` ~241, `removeHighlight` ~263, `captureSelection` ~286. Render self-correction in `layoutSubviews`/`didMoveToWindow`/`refreshRenderPipeline` ~111-150. |
| `modules/native-highlight-pdf/ios/NativeHighlightPdfDocumentInspector.swift` | Module-level `inspectPdf`: page count + first-page cover thumbnail via PDFKit, no mounted view needed. Used by the upload flow on iOS. |
| `modules/native-highlight-pdf/ios/NativeHighlightPdfModule.swift` | Expo module definition. Imperative `AsyncFunction` bindings (all `.runOnQueue(.main)`), no `Prop()` bindings. |
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
4. **Commit messages** reference the phase + task ID from this doc (e.g., `P3-T2: match the iOS command surface on Android`).
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

> **Resolved 2026-08-15, but not via the diagnosis path below.** Four rounds of targeted patches against these hypotheses all failed on device. Root cause was architectural: the native view took `documentUri`/`startPage`/`highlights` as reactive React props, and both sides tried to own "what page are we on," reconciled through racing deferred blocks. The reader was rebuilt on an imperative-command model (commit `1ebbd7c`): JS calls `openDocument()` once and then only listens to `onPageChanged`, so PDFKit owns scroll position outright. T1-T3 below are retained as a record of what was ruled out.

- [x] **P1-T1.** Check the write path first: query Convex prod `progress` rows for recent test accounts. If `currentPage` hasn't advanced since build 10 shipped, the native reader's `onPageChanged` event is not reaching `progress.update` — inspect the event wiring in `ReaderScreen.tsx` (is the handler attached to the native path or only the legacy `<Pdf>` path?) and the payload shape (`page` field name/type must match what the mutation expects).
- [x] **P1-T2.** Check the native prop race: `NativeHighlightPdfView.swift` line ~91 admits `documentUri`/`startPage` prop-order isn't guaranteed. If `startPage` is applied before the document loads, `PDFView.go(to:)` is a silent no-op. **Fix pattern:** store the requested start page in the view; apply it inside the document-did-load path (where `onDocumentLoaded` fires); guard against double-application if the prop re-fires.
- [x] **P1-T3.** Check the JS freeze logic: `ReaderScreen.tsx` ~198-244. `initialPage` falls back through `serverProgress?.currentPage ?? cached?.page`. Verify `openAtPageRef` cannot freeze a value of `1` (or `undefined` coerced) while `serverProgress` is still loading. The guard `initialPage !== null` only protects if the memo returns `null` (not `1`) during load — confirm and fix if the fallback chain short-circuits to a default prematurely.
- [x] **P1-T4.** Regression test on device per §6 items 1, 5, 6 (resume, force-quit resume, offline resume). Both fresh-install and upgrade-from-build-10 paths.

**Acceptance:** read to page N → background → relaunch → opens at N. Force-quit variant passes. Club progress bars reflect N on a second account. Legacy `<Pdf>` path (Android) unaffected.

---

## Phase 2 — BUG-001: press-and-hold selection (High)

**Symptom.** Selection requires quick double-tap-then-drag. Expected iOS-native behavior: long-press starts selection with drag handles; user extends across a block of text; highlight/react menu follows.

**Approach (iOS, `NativeHighlightPdfView.swift`):**

> **Resolved 2026-08-15.** The shadowing recognizer was not in the module at all. `GestureHandlerRootView` wraps the whole app in `App.tsx`, so RNGH's root arbitration recognizer sat above the reader even after every screen-local `GestureDetector` was removed. Wrapping the native view in `Gesture.Native()` makes it stand down, restoring PDFKit's own long-press selection. A custom in-module long-press recognizer was also removed (it synthesized a programmatic selection, which PDFKit does not attach drag handles to).
>
> **Also fixed in the same rebuild, beyond the original scope:**
> - Page-by-page reading mode had never been wired to the iOS native view (`displayMode` was hardcoded to `.singlePageContinuous`). Now a real `setDisplayMode` command.
> - Books opened to a black screen. React swaps the native view instance during post-mount layout churn, and a one-shot open left the replacement empty while the loaded instance sat off-screen. The open is now keyed to view instance. Found by adding a native debug event stream after five failed device rounds, which is the lesson worth carrying into Phase 3.
> - Cover capture moved off the off-screen `react-native-pdf` render plus `react-native-view-shot` (which silently no-opped when missing from the dev-client binary) onto PDFKit's own thumbnail API on iOS. Android path unchanged.

- [x] **P2-T1.** Inventory every gesture recognizer the view adds to `PDFView`/its subviews, plus any `gestureRecognizer(_:shouldRecognizeSimultaneouslyWith:)` / delegate overrides. Identify which one shadows PDFKit's built-in long-press text selection.
- [x] **P2-T2.** Restore native selection: PDFKit's `PDFView` provides long-press → selection-with-handles for free unless a custom recognizer wins arbitration. Scope the custom tap-recognizer (highlight-tap-to-open-thread) so it only claims touches that hit-test onto an existing highlight annotation; otherwise let the touch pass through. If needed, `require(toFail:)` the built-in interactions.
- [x] **P2-T3.** Drive highlight creation from `pdfView.currentSelection` via the selection-changed path / edit menu — do not synthesize selection from raw touches on iOS.
- [x] **P2-T4.** Preserve existing behaviors: tap-a-highlight-opens-thread, quoted context in composer, no orphan annotations, double-tap word-select still works.
- [x] **P2-T5.** Device matrix §6 items 2, 3, 4, 8.

**Acceptance:** long-press a word → handles appear → drag to extend → highlight/react → annotation persists and threads correctly. All build-10 highlight behaviors intact.

**Ship gate → Build 11:** Phases 0-2 complete, §6 matrix green on a physical iPhone → bump build number → EAS build → TestFlight. Nothing else rides in this build.

---

## Phase 3 — Android native reader integration (majority-platform parity)

**Why now:** 88 of 163 users are on Android and have no highlighting at all. The module's hard part (selection + coordinate mapping on PdfiumAndroid) is already proven; what's missing is scrolling and integration.

> **Read "Reader architecture" in §0 first.** The iOS reader was rebuilt after this phase was originally written, and the tasks below were rewritten on Aug 15 to match. The Android module currently carries the *old* reactive-prop shape (`documentUri` / `startPage` / `highlights` as `Prop()` bindings, plus `onDocumentLoaded` / `onLoadError` events). Porting that shape forward would reproduce the exact bug class that cost four failed device rounds on iOS. Port the architecture, not the old prop surface.

- [x] **P3-T1. Add continuous vertical scroll to the Android module.** Match the iOS reader's interaction model. Recommended shape: a `RecyclerView` of per-page rendered bitmaps (PdfiumAndroid renders per page; recycle aggressively; render at device resolution with a lower-res placeholder while scrolling). Preserve the existing per-page selection touch handling — selection long-press and scroll must coexist (long-press wins on text; vertical drag wins on movement; standard Android touch-slop disambiguation). Note iOS also supports a page-by-page mode (`setDisplayMode`); Android may ship continuous-only in this phase, but the command must exist and be a no-op rather than absent, so the JS layer stays platform-agnostic.
- [x] **P3-T2. Match the iOS command + event surface exactly**, so `ReaderScreen.tsx` needs no `Platform.OS` branches. Commands: `openDocument(uri, startPage, displayMode) -> {totalPages, startPage}` (throws on failure), `setDisplayMode`, `jumpToPage`, `addHighlight`, `removeHighlight`, `clearSelection`, `captureSelection`. Events: `onPageChanged` (page = topmost fully-visible page), `onSelectionChanged`, `onHighlightTapped`. **No `Prop()` bindings for document/page/highlight state, and no `onDocumentLoaded`/`onLoadError`** — a command either resolves or throws. Android's current `onHighlightCreated` / `createHighlightFromSelection` pair is replaced by the capture-then-persist-then-`addHighlight` flow iOS uses, so cancelling the composer leaves no orphan annotation.
- [x] **P3-T3. Rule 1 from day one: no data change may move scroll position.** `addHighlight` / `removeHighlight` must not scroll, re-anchor, or "restore" position under any circumstance. On iOS this is what made the react-to-a-highlight page jump structurally impossible rather than merely guarded.
- [x] **P3-T4. Rule 2 from day one: survive view replacement and late layout.** The start page must be applied once the view actually has usable bounds, not at document-set time (Android's equivalent of the iOS `layoutSubviews` self-correction: hold the requested page as pending and apply it when layout arrives). Verify the view tolerates being recycled by Fabric mid-session; the JS side already re-issues `openDocument` per view instance, so the native side must handle a fresh `openDocument` on a view that already has a document.
- [x] **P3-T5. Selection UX:** long-press to select (Android convention), with drag handles to extend. If PdfiumAndroid selection handles are custom-drawn, keep them simple (start/end pins). Check whether RNGH's root recognizer interferes as it did on iOS; if so, the JS-side fix is the same `Gesture.Native()` wrapper already in `ReaderScreen.tsx`.
- [x] **P3-T6. Wire into `ReaderScreen.tsx`:** flip the gate at ~311 to include Android once P3-T1..T5 pass in a test harness. No new JS branching should be needed: the open effect, view-generation ref, and highlight diff effect are already platform-agnostic.
- [x] **P3-T7. Highlight render + tap-to-thread parity** on Android: existing highlights render as overlays at correct coordinates (coordinate mapping already proven); tapping one opens its thread.
> **Status Aug 16: T1-T7 done and emulator-verified; T8 blocked on hardware.** Verified on an emulator: pages render, resume lands on the correct page (not page 1), scrolling advances the page counter, long-press raises a selection and the event reaches JS, and persisted highlights plus margin reactions render correctly positioned. Also fixed in passing: a render storm (unconditional invalidate after failed renders) that caused visible flicker and stuck blank pages, and the native view overflowing its slot and painting over the header and page counter.
>
> **Explicitly NOT verified**, and not to be claimed until a physical mid-tier device exists: long-press timing, scroll-vs-selection arbitration under real fingers, drag-handle precision, and scroll performance on a 300+ page book. The emulator is too resource-starved for any performance claim to mean anything.
>
> Useful for whoever picks this up: Android builds run locally via Gradle (`JAVA_HOME` = Android Studio's bundled JDK, then `./gradlew assembleDebug` in `android/`), about 15s incremental, no EAS quota. JS changes hot-reload with no rebuild at all.

- [x] **P3-T8. Android EAS build** from current head (naturally includes the unverified `82a028f` cleanup — closing ST-06) → internal testing track → §6 full matrix on a physical Android device (mid-tier, e.g., a Redmi/Samsung A-series, not a flagship). *(Done Aug 26 on a borrowed **Redmi 13C, Android 13** — mid-tier as specified. Resume after force-quit, offline read + reaction sync, scroll-vs-selection arbitration, highlight tap opening its thread with no page jump, and a fresh sign-in all passed. Text selection FAILED and was fixed in the same session, see #12. Rotation/backgrounding was not run.)*

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

- [x] **P4-T11.** Schema (additive): add `genres: v.optional(v.array(v.string()))` to `books`. **Keep the legacy `genre` field untouched** — do not migrate rows, do not remove the field. Cap at 3 genres per book, all validated against the `GENRES` catalogue.
- [x] **P4-T12.** `books.register` + `books.updateMetadata`: accept new optional `genres` array arg (validated: 1–3 entries, each in catalogue, deduped). When `genres` is provided, also write `genre = genres[0]` for backward compatibility with any reader of the legacy field. Existing single-`genre` callers keep working unchanged.
- [x] **P4-T13.** Read path: everywhere book genre is displayed, resolve as `genres ?? (genre ? [genre] : [])` — one shared helper in `src/lib/genres.ts` (e.g., `bookGenres(book)`), not scattered ternaries.
- [x] **P4-T14.** *(Input half done Aug 16: GenrePicker is multi-select with a visible cap, wired into the upload sheet and EditBookScreen. Remaining: render genre chips on display surfaces. Note book genre is currently displayed NOWHERE in the app, so that half is new UI rather than a change; it also touches `BookListCard`, which is in flight in PR #7, so it was deliberately left out to avoid a conflict.)* UI: upload flow + `EditBookScreen.tsx` switch from single-select to multi-select chips (max 3, same catalogue, existing chip component styling). Display surfaces (book cards, book detail) render up to 3 genre chips. **Shipped Aug 28 (#9), but NOT as chips:** founder review on iOS found a chip row too heavy on a card already carrying title, author/pages, subtitle, started date and progress bar. Genre renders as one muted line under the author, middot-separated because most of the catalogue is multi-word, clipped to a single line. Verified on iOS and on the Redmi 13C.

**Acceptance:** a club uploads a book tagged "Mystery" + "Thriller"; both chips render on the book card; an old book with only legacy `genre` still displays correctly; editing an old book upgrades it to the array transparently.

**Acceptance:** a club uploads an `.epub`; members open it on iOS and Android; it renders paginated with TOC and theme-correct colors; closing and reopening resumes at the exact location; progress percentage shows on club surfaces; PDFs behave exactly as before. Oyinadé's club can read *Thirteen* as an EPUB.

**Ship gate → Build 12:** Phase 4 (+ Phase 5 if ready) → both stores.

---

## Phase 5 — Retention infrastructure (Build 12 co-passenger, per synthesis Wave 2)

Compressed spec; full context in `docs/synthesis-aug-2026.md` §3.3.

- [ ] **P5-T1.** Notifications: add `new_book_in_club` type + fanout inside the existing book-registration mutation path; add reaction-reply **push** (in-app row already exists). Reuse the shipped fanout/unreadCount module; extend the type union — no parallel code path.
- [ ] **P5-T2.** Reading-reminder push (FB-011): `users.reminderHour` + `reminderEnabled` (additive, default enabled at 19:00 local — Moks to confirm default before merge); hourly Convex cron matches local hour, pulls latest `progress` row, sends contextual copy via Expo push ("Chapter 5 of *Thirteen* is waiting — the room is just ahead of you"). Settings toggle. Never shame-toned; copy rules per `product-vision.md` voice guide.
- [ ] **P5-T3.** Bookmark polish (FB-006): livelier tap animation + visible corner mark on bookmarked pages (PDF reader only this batch).
- [x] **P5-T4. Offline reaction echo (BUG-003, found in Build 11 device testing).** *(Done Aug 16, device-verified: queued drops echo immediately, convert cleanly on reconnect with no duplicates, and survive an offline restart. Branch `fix/offline-reaction-echo`.)* Not retention infra, but it rides Build 12 as reader polish. **Symptom:** dropping a reaction or comment in airplane mode is completely invisible until reconnect, so a tester posted the same comment twice and saw both appear on reconnect. **Cause (pre-existing, predates the Phase 1-2 rebuild, identical in `8405024`):** `handleReactionSubmit` returns right after `enqueueReaction`, so it never paints the highlight, and `MarginReactionsList` renders only from the `reactions.listForPage` query, which has nothing new while offline. **Fix shape:** hold pending reactions in local state in `ReaderScreen.tsx` (MMKV is not reactive, and pending items must survive an offline app restart, so seed from `listQueued()` on mount), merge them into the margin list with a distinct "sending" treatment, paint the highlight immediately using the local ID, then swap to the real reaction ID when the queue flushes. Touches `MarginReactionsList.tsx` (its `MarginReaction` type assumes a server row with `_id` and a populated `user`) and `ReactionBubble.tsx` for the pending state. Verify the flush path in `RootNavigator` reconciles rather than double-painting.
- [ ] **P5-T5.** Re-engagement email pair (FB-012): weekly cron → club-owner digest + reader progress note, `sendWelcomeEmail` plumbing pattern, per-user `emailPrefs` (additive) with unsubscribe honored. **Ayodeji writes the copy; Claude Code wires the pipeline with placeholder copy and flags for review.**

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
8b. Close the reader and reopen the same book, twice, on an already-cached file → renders content both times (guards the view-instance black screen; a correct page counter over a blank page is the signature of this bug returning).
8c. Reader settings → switch Page by page ⇄ Continuous scroll → layout changes, swipe/scroll works in each, and your page is preserved across the switch.
9. *(EPUB, from Phase 4)* Upload `.epub` → open on both platforms → paginate, TOC-jump, theme switch → close/reopen resumes exactly.
9b. *(Multi-genre, from Phase 4C)* Upload with 2 genres → both chips render; legacy single-genre book still displays; edit upgrades it.
10. *(Phase 5)* Reminder fires at set hour with correct book context; toggle off silences it.

## 7. Sequencing summary

```
Day 0:        Phase 0 (push, merge, cleanup)                    ← DONE
Days 1-4:     Phase 1 (resume) → Phase 2 (selection) → matrix     ← DONE (iOS reader rebuilt)
              BUILD 11 → TestFlight                               ← NEXT, not yet shipped
              ← public commitment to Oyinadé rides on this
Days 4-10:    Phase 3 (Android reader) → BUILD 11.5 → Play internal track
Days 8-16:    Phase 4 (EPUB v1) → Phase 5 (retention) → BUILD 12 → both stores
Continuous:   additive-only schema · one concern per build · matrix per reader PR
              · flag deviations, don't improvise architecture
```

## 8. Parking lot (do not build in this batch)

- EPUB highlights/reactions via CFI ranges (design doc first; the epub.js `annotations` API is the likely path).
- EPUB bookmarks.
- ~~Horizontal page-by-page mode for the iOS PDF reader.~~ **Shipped Aug 15** as part of the Phase 2 rebuild: the reading-mode toggle had never been wired to the native view, so fixing it was in scope rather than optional.
- Moderator broadcast messages (FB-005) — next notifications wave.
- Club reading-goal metrics (FB-009) — v2 roadmap parking lot per founder.
- Streak mechanics — post-catalog (v2 era).
- **Android text-selection finesse, deferred to v2 (founder call, Aug 26).** Selection now works end to end on Android (multi-character drag, handle adjustment, tap to dismiss) and highlight bands are close to iOS but not equal to them. The gap is methodological, not a tuning oversight: PDFKit's `selectionsByLine().bounds` derives line boxes from the PDF's own font metrics (ascent/descent per line), which is what the iOS module uses. PdfiumAndroid exposes glyph boxes and `getFontSize()`, not those metrics, so the Android side approximates by unioning glyph boxes per line and growing by the median inter-line gap. Closing the last few percent means deriving real font metrics, which is v2-sized work.

  Two dead ends recorded so they are not walked again:
  - `FPDFText_CountRects`/`FPDFText_GetRect` are **not** the counterpart of `selectionsByLine()`. Measured on a real book: one selection produced 6 line bands where `CountRects` returned **261** rects, each tight to a single letterform (9.6pt vs our 13.2pt). Rendered as tinted text rather than a highlighter bar. Tried and reverted.
  - Existing Android-made highlights keep their stored ragged rects. Only `rects` and the quote are persisted, not the character range, so there is nothing to recompute from. They need re-creating, or a migration if the volume ever justifies one.

- Rich upload metadata (cover photo + synopsis) in v1 — v2 catalog carries this; only add to v1 if the Phase 4 upload-flow touch makes it trivially cheap (flag first). **Multi-genre is NOT parked — it ships in this batch as Phase 4C (founder decision, Aug 15).**

---

*Claude Code: mark checkboxes as tasks complete, reference task IDs in commits, and keep PR descriptions honest about what was device-verified vs. simulator-verified vs. unverified.*
