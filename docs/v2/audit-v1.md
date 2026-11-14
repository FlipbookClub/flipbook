# v1 audit against the v2 PRD

**Task:** S0-1 (`docs/v2/specs/sprint-00-foundations.md`) · **Written:** 13 Nov 2026 · **Code read at:** `9c8e693` (main)
**Scope:** read-only. No code changed. Line numbers refer to that commit.

## Summary

1. **v1 EPUB books cannot carry reactions, highlights or bookmarks.** The reader returns an EPUB-only view with no composer and no margin (`src/screens/reader/ReaderScreen.tsx:830-836`). There should be nothing to map to v2 paragraph IDs. Confirm with production count C3 below.
2. **`paragraphIndex` is never written.** No code path in the app or backend sets it. v1 reactions are anchored by `page`, and text-anchored ones add a quote and rectangles. All of them sit on PDFs.
3. **v1 has no private highlights.** A v1 "highlight" is the painted anchor of a public reaction. PRD 4.5 ("at parity with v1"), PRD 1.4 ("highlights … intact") and roadmap Sprint 4 ("4.5 highlights (port v1)") assume a feature that does not exist.
4. **v1 has no spoiler gating.** It was removed by founder decision (`convex/reactions.ts:188`, `:303`). Club copies have no furthest-paragraph value to build on.
5. **Five v2 table names collide with v1 tables or fields** (`books`, `reactions`, `users`, `memberships`, `notificationPrefs`), and v2 `communities` is v1 `clubs`. The architecture's rule "no v1 table changes shape" needs a decision per table before Sprint 2.
6. **Any signed-in client can set its own Pro status** through the public mutation `users.syncProStatus` (`convex/users.ts:176`). Nothing in the app calls it. It contradicts ADR 004.

Items marked **Decision** need Moks before the sprint that depends on them. Section 7 lists them all.

---

## 1. Tables

Thirteen tables in `convex/schema.ts`. Verdicts: **keep** (v1 shape stays, v2 does not use it beyond reading), **extend** (v2 adds optional fields or new literals), **replaced** (a v2 table takes over; the v1 table stays readable for v1 clients until the minimum version passes every install).

| # | v1 table (line) | Verdict | v2 table | Notes |
| --- | --- | --- | --- | --- |
| 1 | `users` (5) | Extend | `users` | Add date of birth, age lane, Founding Host flag as optional fields. `pushToken`, `notificationPrefs`, `emailPrefs` and the reminder fields stay written for v1. `proSubscriptionStatus` / `proExpiresAt` are superseded by `entitlements` and `subscriptions`; see risk R6. |
| 2 | `clubs` (57) | Extend — **Decision D1** | `communities` | Convex cannot rename a table, and `Id<"clubs">` is a foreign key in six other tables and in every deep link. Either `clubs` stays the physical table and v2 calls it a community in its API, or a new `communities` table is backfilled and dual-written. `type` is `standard \| creator`; v2 needs new literals (widening a union is additive). `permissions.membersCanUploadBooks` maps to the 6.9 silent upload. |
| 3 | `memberships` (81) | Extend | `memberships` | `role` is `moderator \| member`; v2 host and co-host (6.5) need a new literal or a mapping (`moderator` = host). `isFollowing` is creator-club only and stays. `clubId` naming follows D1. |
| 4 | `clubBlocks` (100) | Keep | none | A per-club rejoin ban written by a moderator. v2 `blocks` (PRD 5.9) is person-to-person and mutual, so it is a different table, not a replacement. PRD 5.9 says a host's block also removes the person; that path should write both. |
| 5 | `bookmarks` (112) | Keep | none | Page-number bookmarks, PDF only. The v2 PRD has no bookmark story and the data model has no table. **Decision D5:** whether bookmarks survive in v2 for club copies. |
| 6 | `books` (129) | Replaced — **Decision D2** | `editions` (as "Club copy") + `entitlements` | Name collision. A v1 row is one club's upload: `clubId`, `uploadedByUserId` and `pdfStorageId` are required, and the strict `bookValidator` in `convex/books.ts` mirrors it. A catalogue book has none of those. The v2 catalogue table needs another name, or v1 `books` must loosen required fields (a shape change). `pdfStorageId` holds EPUBs too; `pdfPageCount` is a spine count for EPUBs. |
| 7 | `chapters` (167) | Keep | none | v1 creator-club chapter PDFs. Nothing in v2 uses it; the v2 "chapter map" lives on `editions`. Retire with v1. Count C6 says whether any exist. |
| 8 | `progress` (181) | Replaced | `readingState` | PDF rows carry `currentPage`, `totalPages`, `furthestPageReached`. EPUB rows carry `locationCfi` and `percentComplete`, and write `1 / 1 / 1` into the page fields (`ReaderScreen.tsx:624-625`). Backfill is in section 2. |
| 9 | `reactions` (207) | Replaced or extend — **Decision D3** | `reactions` | Name collision. `clubId` and `page` are required; v2 anchors to edition + paragraph. Extending means every v2 row writes a placeholder `page`, and v1's page-indexed queries must never see v2 rows. A new table avoids both. `reports` is new either way. |
| 10 | `waitlist` (251) | Keep | none | Written by `web/` through `convex/http.ts`. Out of scope for v2 app work. |
| 11 | `inviteCodes` (278) | Keep | none | Beta access codes, gated by `BETA_INVITE_REQUIRED`. Not the same as v2 `invites` (community invites); v1 club invites are the `clubs.inviteCode` field. Watch the near-collision in naming. |
| 12 | `notifications` (293) | Replaced | `activity` | ADR 011 makes `activity` the source of every push. v1 rows hold `deepLink` strings in the v1 route shape (`flipbook://clubs/<id>/…`). v1 fan-outs in `convex/notifications.ts` keep writing here while v1 is installed. |
| 13 | `newsletterSends` (322) | Keep | none | Dedup log for the monthly email. Untouched by v2. |

**Embedded v1 fields that become v2 tables.** `users.pushToken` (one token per user, index `by_push_token`) becomes `pushTokens`. `users.notificationPrefs` becomes the `notificationPrefs` table. v1 clients keep reading and writing the embedded fields, so v2 must either dual-write or treat the embedded value as the fallback until v1 is retired.

**Strict return validators.** `bookValidator`, `progressValidator`, `reactionValidator` and `userValidator` are strict `v.object()` mirrors of their tables. A field added to a table and not to its validator deploys cleanly and then fails every query that returns a row carrying it. Any additive change to tables 1, 6, 8 or 9 must touch the validator in the same pull request.

**No v2 table exists yet.** None of `editions`, `entitlements`, `orders`, `ledger`, `credits`, `subscriptions`, `readingState`, `highlights`, `rhythmDays`, `reports`, `communityBooks`, `invites`, `takeoverRequests`, `messages`, `pins`, `activity`, `flags`, `appConfig` or the other System tables is in the schema.

---

## 2. Reaction anchors

### How v1 stores a position

| Field (`convex/schema.ts:207`) | Written by | Meaning |
| --- | --- | --- |
| `page` (required, ≥ 1) | Every reaction | PDF page number. The only position on plain reactions. |
| `paragraphIndex` (optional) | Nothing | Never set. See (c). |
| `highlightQuote`, `highlightRects` (optional) | Top-level reactions made from a text selection | The selected text and its rectangles, normalised 0..1 to the page box, top-left origin on both platforms. Replies never carry them (`convex/reactions.ts:169-170`). |
| `bookId` or `chapterId` (exactly one) | Every reaction | Scope: a club book, or a creator-club chapter. |
| `parentReactionId` (optional) | Replies | One level deep. A reply must share its parent's page (`reply_page_mismatch`). |

Write paths: `ReaderScreen.handleReactionSubmit` (`:491`), the offline queue flush (`src/lib/useReactionQueueFlush.ts`), replies from `ReactionDetailsSheet`, and the dev-only `convex/seed.ts`.

### (a) EPUB uploads

**v1 stores nothing, because EPUB books cannot be reacted to.** `ReaderScreen.tsx:836` returns early for `fileType === "epub"` with a header, the `EpubReader`, a contents sheet and a display sheet. There is no `ReactionComposer`, no `MarginReactionsList`, no highlight painting and no bookmark button. The code comment at `:833` says so: "Out of scope for this batch per P4-T10: highlights, reactions and bookmarks inside EPUBs." The WebView runtime (`epubRuntime.ts`) posts no selection message.

A book's file type is fixed at upload: `books.updateMetadata` changes title, author and genres only, so a PDF with reactions cannot later become an EPUB.

The only EPUB position v1 holds is per reader, in `progress`: `locationCfi` (resume point) and `percentComplete` (0–100). There is no furthest-point value for EPUBs; `furthestPageReached` is always 1.

### (b) PDF uploads

Every v1 reaction is on a PDF. Two kinds:

- **Page-level:** `page` only. Shown in the margin list for that page.
- **Text-anchored:** `page` + `highlightQuote` + `highlightRects`. Captured natively (`captureSelection` in `modules/native-highlight-pdf/`, iOS PDFKit and Android PDFium), painted with `addHighlight`, and tapping the paint opens the thread.

Margin reads are page-keyed: `reactions.listForPage` (index `by_book_and_page`), `listHighlights` (first 500 rows per book), `listForBook` (newest first, for Discussions).

### (c) Is `paragraphIndex` stable across font sizes and devices?

**The question does not arise: the field is never populated.** `ReaderScreen` omits it from the mutation arguments, the queue flush passes `undefined` explicitly (`useReactionQueueFlush.ts:86`), and the seed script does not set it. Count C4 confirms this on production.

Had it been used, it would be stable for PDFs (fixed layout, no font control) and meaningless for EPUBs.

The PDF anchors that do exist are stable: a page number and page-normalised rectangles do not move with device or settings, because a PDF does not reflow.

### Can v1 EPUB reactions be mapped to v2 paragraph IDs?

**There are none to map.** If count C3 returns zero, as the code predicts, the "biggest migration risk" named in the spec reduces to the points below.

### What a backfill needs

| Data | Backfill | Risk |
| --- | --- | --- |
| PDF reactions | No remapping. ADR 006 says club copies keep v1 anchors. Each v1 book becomes an edition marked "Club copy"; its reactions stay page-anchored and are served to v2 through `access`. | Low for the data. The open question is spoilers; see below. |
| EPUB reactions | None expected. | None, if C3 is zero. |
| EPUB progress | `locationCfi` and `percentComplete` carry over to `readingState` for resume. Furthest paragraph cannot be derived on the server from a CFI for an un-ingested file. | Medium. Either run club-copy EPUBs through ingest (then a CFI resolves to a paragraph ID once, client-side, on first v2 open), or leave club copies outside the paragraph model. **Decision D4.** |
| PDF progress | `furthestPageReached` is real and monotonic (`convex/progress.ts:99`). It maps to a page-based furthest point. | Low. |
| Deleted users | v1 hard-deletes a leaving user's reactions (`convex/users.ts:382-390`). PRD 11.2 wants them kept as "Former reader". | Already-deleted rows are gone; nothing to backfill. |

**The real anchor question is spoilers on club copies (Decision D4).** PRD 5.2 says a reader only sees reactions to text already read. v1 shows every reaction to every member. For PDF club copies a page-based rule is available today (`reaction.page ≤ furthestPageReached`). For EPUB club copies there is no ordering at all unless they are ingested. The architecture says "v1 club copies keep whatever anchors v1 uses" and does not say whether the spoiler engine applies to them. Turning gating on changes what existing clubs see on upgrade.

**New EPUB club copies (6.9).** A legacy host can still upload an EPUB in v2. Whether members can react inside it depends on D4: without ingest it has no paragraph IDs, so it stays read-only as in v1.

### Production counts for Moks

Read-only, in the Convex dashboard for the **production** deployment, **Data** tab. Nothing is created or deployed. Each step is: pick the table, open **Filter**, add the condition, read the document count. If the filtered view does not show a count, the tables are small enough to count rows.

| # | Table | Filter | What it tells us | Expected | Result |
| --- | --- | --- | --- | --- | --- |
| C1 | `books` | none | Total uploads | — | |
| C2 | `books` | `fileType` equals `"epub"` | EPUB club copies. **Note each `_id`** for C3 | A few | |
| C3 | `reactions` | `bookId` equals each `_id` from C2, one at a time | Reactions on EPUB books | **0** | |
| C4 | `reactions` | `paragraphIndex` ≥ `0` (number) | Reactions with a paragraph index | **0** | |
| C5 | `reactions` | none, then `highlightQuote` ≥ `""` (string) | Total reactions, then text-anchored ones | — | |
| C6 | `chapters` | none | Creator-club chapters | 0 or few | |
| C7 | `clubs` | `type` equals `"creator"` | Creator clubs | 0 or few | |
| C8 | `progress` | `percentComplete` ≥ `0` (number) | EPUB reading rows that need a `readingState` backfill | A few | |
| C9 | `users` | `proSubscriptionStatus` equals `"active"` | Users marked Pro. No purchase flow exists, so any row is suspect (R6) | **0** | |
| C10 | `memberships` | `role` equals `"moderator"` | Founding Host candidates (6.8) | About the number of clubs | |
| C11 | `bookmarks` | none | Whether D5 matters | — | |

The ≥ filters work because Convex orders values by type, so a comparison against a number or a string only matches rows where the field is set to that type. If the filter builder offers "is not unset" for a field, that is equivalent.

If C3 or C4 is not zero, stop: the code path that wrote those rows is not in this repository at `9c8e693`, and this section needs revisiting before ADR 006 is accepted.

---

## 3. UI

### What the v2 design system provides

The spec points at `docs/v2/design-handoff/README.md` → "Components". There is no such heading; the list is one paragraph under "Design system" ("Components used"). It names 21 components. `_ds_manifest.json` lists 16. All 25 distinct names exist in `_ds_bundle.js`.

- **In both:** Button, Badge, Banner, BookCover, Icon, ChatMessage, VoiceNote, MarginReaction, ReactionPicker, MemberProgress, SessionCard, LiveBar.
- **README only:** Toast, AppHeader, SegmentedTabs, TabBar, Sheet, OptionRow, Emblem, UnreadDot, Composer.
- **Manifest only:** BookCard, Veil, MarginAhead (and the `REACTIONS` constant).
- **Named in the README as not in the DS, built inline:** band pill, toggle switch, grouped list card, week-dot strip, stacked totals bar.

**Not in the v2 DS at all:** Avatar, text Input, Checkbox, Skeleton, EmptyState, an offline banner. v1 has all six. The tokens cover Skeleton (`Skeleton` group in the mode files) but there is no component.

### `src/components/ui/` (12 files)

| File | Used by | v2 replacement | Notes |
| --- | --- | --- | --- |
| `Avatar.tsx` | 8 files | **None in DS** | Initials or image, sizes by token. Needed by Lobby, chat and margin. New `src/ui` component; flag it in Sprint 1. |
| `BottomSheet.tsx` | 2 files | `Sheet` | Wraps `@gorhom/bottom-sheet`. v2 sheets are inset 8 with radius 36 and a scrim; the wrapper can stay, the look changes. |
| `Button.tsx` | 23 files | `Button` | v1 variants `primary \| secondary \| alt`, sizes `sm \| md \| lg`. v2: `primary \| secondary \| ghost`, sizes lg 52 / md 48 / sm 40 / pill 36, plus loading. `alt` ≈ `ghost`. |
| `Card.tsx` | 5 files | None named | v2 uses `--card-fill` surfaces and the inline "grouped list card". Candidate for a `src/ui` component. |
| `Checkbox.tsx` | 2 files | **None in DS** | Used for v1 club permissions. v2 settings use the inline toggle switch. |
| `EmptyState.tsx` | 3 files | **None in DS** | Every v2 screen needs an empty state (CLAUDE.md). Copy and layout are per screen in the handoff logic classes. |
| `Input.tsx` | 18 files | **None in DS** | `boxed \| underline`. v2 has `Composer` for chat only. Sign-up, search and create-community need a text field; flag it in Sprint 1. |
| `OfflineBanner.tsx` | `App.tsx` | `Banner` (warning) | Mounted once at the app root. |
| `ScreenContainer.tsx` | **Unused** | `AppHeader` + layout rules | Dead code. Exports `ScreenContainer` and `SafeView`; nothing imports either. |
| `Skeleton.tsx` | 5 files | **None in DS** (tokens only) | Rebuild on the `Skeleton` token group. |
| `Tag.tsx` | Dev preview only | `Badge`, band pill | Not used by any shipping screen. |
| `Wordmark.tsx` | 2 files | Logo SVGs in `design-handoff/assets/` | Per-mode lockups already; swap the asset. |

### `src/theme/` (6 files)

All six are replaced by a generated theme (ADR 012). They stay in place for v1 screens until those screens are removed.

| File | What it holds | v2 source |
| --- | --- | --- |
| `palette.ts` | Hand-written brand hex values | `Brand.tokens.json` |
| `themes.ts` | Light / Flip / Dark semantic colours and button states, typed by hand; some marked "(derived)" | `Light`, `Flipbook`, `Dark` `.tokens.json` (13 groups each) |
| `spacing.ts` | `spacing` s1–s8 (4 to 64), `radius`, `shadows` | `_ds/tokens/spacing.css`, `glass.css` |
| `typography.ts` | Raleway (headings) and Inter (body) | `_ds/tokens/typography.css`: Manrope for UI, Literata for book text |
| `ThemeContext.tsx` | `ThemeProvider`, `useTheme()`; mode persisted in MMKV | Keep the mechanism. v2 adds a style axis (Glass now, Classic later). |
| `index.ts` | Barrel | — |

Also hand-copied and outside `src/theme/`: `tailwind.config.ts` repeats the palette as hex. NativeWind is installed and `global.css` is imported, but no component uses `className`. The Tailwind layer is dead weight today.

Fonts load in `App.tsx:65-72` (Raleway, Inter). Manrope and Literata are not installed. `App.tsx:22-34` caps OS text scaling at 1.6×; the handoff and PRD ask for 200%.

### `src/components/features/` (16 files)

| File | Used by | v2 replacement | Notes |
| --- | --- | --- | --- |
| `AuthorBadge.tsx` | `ReactionDetailsSheet` | `Badge` (author) | 5.7. |
| `BookCover.tsx` | **Unused** | `BookCover` | Dead code. Covers are drawn inline in `BookListCard`. |
| `BookListCard.tsx` | 2 files | `BookCard` | Shows page counts; v2 shows chapter and percent. |
| `BookOptionsSheet.tsx` | 1 file | `Sheet` + `OptionRow` | |
| `BookUploadSheet.tsx` | 1 file | `Sheet`, v1-styled content | Becomes the 6.9 silent upload. Pro-gated, legacy communities only. |
| `ChapterListItem.tsx` | 1 file | None | Creator-club chapters; retires with v1. |
| `ClubCard.tsx` | 2 files | Community row with `Emblem` | |
| `ClubOptionsSheet.tsx` | 1 file | `Sheet` + `OptionRow` | Host tools (6.5). |
| `GenrePicker.tsx` | 2 files | None named | Sign-up genres (1.2). Chips, radius 8. |
| `MarginReactionsList.tsx` | `ReaderScreen` | `MarginReaction`, `MarginAhead` | Page-keyed list. v2 is paragraph-keyed and server-filtered. |
| `MemberActionSheet.tsx` | 1 file | `Sheet` + `OptionRow` | Remove, block, promote. |
| `OnboardingModal.tsx` | `RootNavigator` | "What's new" cards (1.4) | One-time education modal, MMKV flag. |
| `ProgressVisualization.tsx` | **Unused** | `MemberProgress` | Dead code. |
| `ReactionBubble.tsx` | `MarginReactionsList` | `MarginReaction` | |
| `ReactionDetailsSheet.tsx` | `ReaderScreen` | `Sheet` + `MarginReaction` thread | Calls `reactions.create`, `remove`, `listReplies`, `listForPage` directly. |
| `ThemePicker.tsx` | Settings | `SegmentedTabs` | Light / Flip / Dark. |

`src/components/auth/` (`AuthLayout`, `AppleAuthButton`, `GoogleAuthButton`) is outside this task's list; it is replaced by the Epic 1 onboarding screens.

Icons: `src/lib/icons.tsx` already wraps Hugeicons. The emoji set in `convex/reactions.ts:10` is 🔥 ❤️ 😭 🤯 💀 ✨; check it against the DS `REACTIONS` constant when Sprint 5 starts.

---

## 4. Navigation

### Current tree

```
App.tsx
└─ providers: Clerk → Convex → Theme → GestureHandler → Keyboard → SafeArea → BottomSheetModal
   └─ RootNavigator            src/navigation/RootNavigator.tsx
      ├─ Splash                Clerk not loaded, or users.me in flight
      ├─ AuthStack             signed out: Welcome, CreateAccount, SignIn, VerifyEmail, ForgotPassword, ResetPassword
      ├─ OnboardingStack       signed in, no users row: DisplayName, UserDetails, GenrePreferences
      └─ MainTabs              signed in, users row exists (+ OnboardingModal once)
         ├─ Community  → CommunityStack: CommunityHome, Notifications, CreateCommunity, InviteMembers,
         │                JoinCommunity, ClubDetail, EditCommunity, EditBook, InviteAccept,
         │                PublishChapter, Reader, ViewProfile
         ├─ Library    → LibraryStack: LibraryHome, Reader
         └─ Profile    → ProfileStack: ProfileHome, EditProfile, Settings, ViewProfile
```

- The reader is a stack screen inside two tab stacks, so the tab bar stays mounted under it. v2 wants the reader and the live room full-screen, outside the tabs.
- Two root-level hooks run for every signed-in user: `usePushTokenRegistration` and `useReactionQueueFlush` (`RootNavigator.tsx:42`, `:46`).
- `NavigationContainer` owns deep links: prefixes `flipbook://` and `https://useflipbook.com`; routes `join/:inviteCode`, `clubs/:clubId`, `clubs/:clubId/chapters/:chapterId` (`src/lib/deeplinks.ts:16-48`). Every route is nested under the `Community` tab.

### Where the v2 tree mounts

**`RootNavigator.tsx:68-77`, the final `else` branch** (signed in, `me` exists). That branch becomes `useFlag("v2_shell") ? <V2Root /> : <MainTabs />`. Everything above it (Clerk gate, splash, auth, onboarding) and the `NavigationContainer` stay shared.

Three things to settle when that switch is written (Sprint 1, not now):

1. **The S0-2 update gate** goes above the whole `if` chain, so it blocks signed-out users too.
2. **Deep links.** `linkingConfig` is one static object keyed to v1 screen names. A v2 tree needs its own config, chosen by the same flag, or v2 screens must reuse the v1 route names. Notification rows already stored carry v1-shaped links.
3. **Flag flicker.** `useFlag` is off while loading (S0-7). A v2 user would see v1 tabs for a moment on cold start unless the splash holds until the flags query resolves.

v2 tabs are Home · Shelf · Communities · You; v1 has Community · Library · Profile. No v1 tab maps one-to-one.

---

## 5. Reader

### Where the engines are wired

| Piece | File | Role |
| --- | --- | --- |
| Screen | `src/screens/reader/ReaderScreen.tsx` (1,581 lines) | Everything: load, cache, progress sync, bookmarks, reactions, highlights, both engines, and five inline components (`Header` :1142, `ReaderCustomizationSheet` :1265, `TableOfContentsSheet` :1403, `BookmarkButton` :1482, `LoadingState` :1575). |
| Engine switch | `ReaderScreen.tsx:836` | `fileType === "epub"` returns the EPUB view; everything below is PDF. |
| EPUB view | `src/screens/reader/EpubReader.tsx` | `react-native-webview` host. Sends `open`, font size, flow and colours; receives `relocated` (CFI + percent), `ready` (contents), `tap`, `error`. |
| EPUB runtime | `src/screens/reader/epubRuntime.ts`, `epubReaderHtml.ts` | JavaScript injected into the WebView. epub.js and JSZip are bundled from `assets/epubjs/`, not fetched. |
| PDF view | `modules/native-highlight-pdf/` | Local Expo module. iOS: PDFKit (`ios/NativeHighlightPdfView.swift`). Android: PDFium (`android/.../NativeHighlightPdfView.kt`). Command-driven through a ref: `openDocument`, `jumpToPage`, `setDisplayMode`, `addHighlight`, `removeHighlight`, `captureSelection`, `clearSelection`. |
| PDF fallback | `react-native-pdf`, `ReaderScreen.tsx:981` | Unreachable on phones: `useNativeHighlightReader` is true on both iOS and Android (`:356`). Dead path, still a dependency. |
| File cache | `src/lib/pdf.ts` | Downloads to `documentDirectory/books/`, 500 MB LRU. Plain files. |
| Progress cache | `src/lib/progress.ts` | MMKV copy of page or CFI for offline resume. |
| Offline reactions | `src/lib/reactionQueue.ts`, `useReactionQueueFlush.ts` | MMKV queue, drained at the root. |
| File type | `src/lib/bookFile.ts` | `bookFileType()`: absent means PDF. |
| Backend | `convex/books.ts`, `progress.ts`, `reactions.ts`, `bookmarks.ts` | `books.get` returns the file URL to club members. |

Reader settings today: EPUB font size (MMKV `reader.epubFontSize`) and paged or scroll (`reader.pageMode`). No typeface choice. Theme follows the app theme.

A stale comment in `modules/native-highlight-pdf/src/NativeHighlightPdf.types.ts` says `captureSelection` is iOS-only; the Kotlin module implements it. Comment only.

### What Sprint 3 will touch

Sprint 3 is 4.1 download and offline, 4.2 resume on any device, 4.3 display sheet, 4.4 contents and scrubber, plus the two-page-spread spike.

| File | Why |
| --- | --- |
| `ReaderScreen.tsx` | Too large to restyle in place. ADR 001 says v1 screens stay until replaced, so expect a new v2 reader screen that reuses the engines, with this file left for v1. |
| `EpubReader.tsx`, `epubRuntime.ts`, `epubReaderHtml.ts` | Typeface (Literata, Manrope), five font steps, `Reader/*` tokens, chapter + percent position, scrubber, paragraph-ID reporting for `readingState` (ADR 007: "add paragraph-ID support to the EPUB path"), the spread spike. The runtime is shared with v1, so changes must be additive to the message protocol. |
| `modules/native-highlight-pdf/` | Only if club-copy PDFs get the v2 chrome. No API change is needed for Sprint 3. |
| `src/lib/pdf.ts` | 4.1 download states; ADR 008 encryption at rest and short-lived links (R7). |
| `src/lib/progress.ts`, `convex/progress.ts` | 4.2 resume. v2 reads and writes `readingState`; v1 keeps `progress`. |
| `TableOfContentsSheet`, `ReaderCustomizationSheet` (inline in `ReaderScreen.tsx`) | 4.3 and 4.4 replace both. |
| New: `convex/access`, `convex/reading` | Every v2 reader query goes through `access` (ADR 003). |

---

## 6. Risks: where v1 contradicts `architecture.md`

Ordered by how early they bite.

| # | Finding | Evidence | Contradicts | When it bites |
| --- | --- | --- | --- | --- |
| R1 | **Table names collide.** v2 `books`, `reactions`, `users`, `memberships` share names with v1 tables of a different shape; v2 `communities` is v1 `clubs`; v2 `notificationPrefs` is a v1 field on `users`. | Section 1 | "All new tables are additions; no v1 table changes shape" | Sprint 2 (`books`, `editions`) |
| R2 | **No private highlights in v1.** A highlight is a reaction's anchor; it needs an emoji or comment and is visible to the club. No highlight colours, no `highlights` table. | `convex/reactions.ts:113-127`, schema `:207` | PRD 4.5 "at parity with v1"; PRD 1.4 "highlights … intact"; roadmap Sprint 4 "port v1" | Sprint 4 |
| R3 | **No spoiler gating in v1.** Removed by founder decision. `furthestPageReached` is still maintained for PDFs but nothing reads it. | `convex/reactions.ts:188`, `:303` | Hard part 1; PRD 5.2 | Sprint 5; and the upgrade moment for existing clubs |
| R4 | **v1 EPUBs are read-only, not anchored.** "v1 club copies keep whatever anchors v1 uses" has no content for EPUBs: there are no anchors and no furthest point. | Section 2 (a) | Hard part 2; ADR 006 consequences | Sprint 5, Sprint 7 (6.9) |
| R5 | **Positions are page numbers throughout v1 social UI.** Reactions, bookmarks, progress and book cards all show or key on pages. | `listForPage`, `BookListCard`, `bookmarks.page` | "social UI never shows page numbers" | Club copies in the Lobby (Sprint 7) |
| R6 | **A client can grant itself Pro.** `users.syncProStatus` is a public mutation taking `status` from the caller. Nothing in the app calls it and RevenueCat is not installed, but it is deployed. The free-tier cap reads the field it writes. | `convex/users.ts:176-191`; readers at `convex/clubs.ts:137`, `convex/memberships.ts:54` | ADR 004 (rejected: "Trusting the store SDK on the device") | Live today, low impact: it only lifts the 3-club cap. Must not be the basis for v2 entitlements. |
| R7 | **Book files are not protected.** `books.get` returns `ctx.storage.getUrl()` for the raw upload, and the app caches it as a plain file. A code comment calls the URL "signed"; nothing in the code sets an expiry. | `convex/books.ts:224-227`; `src/lib/pdf.ts:21` | ADR 008 | Sprint 2 for catalogue books. **Decision D6:** whether club copies get the same protection. |
| R8 | **Account deletion hard-deletes reactions and progress.** | `convex/users.ts:382-396` | PRD 11.2 ("Former reader", anonymous reading records) | Sprint 14 |
| R9 | **One push token per user**, embedded on `users`. | schema `:13`, index `by_push_token` | Data model: `pushTokens` table | Sprint 6 |
| R10 | **Pushes are sent straight from features.** Four fan-out actions each write a `notifications` row and send. | `convex/notifications.ts` | ADR 011 | Sprint 6. v1 fan-outs must keep running beside it. |
| R11 | **Theme and tokens are hand-copied**, in three places. | `src/theme/*`, `tailwind.config.ts`, hex literals in components | ADR 012 | Sprint 1 |
| R12 | **Fonts and text scaling.** Raleway and Inter are loaded; text scaling is capped at 1.6×. | `App.tsx:22-34`, `:65-72` | Handoff type (Manrope, Literata); 200% scaling | Sprint 1, Sprint 16 |
| R13 | **Deep links assume the v1 tree.** | `src/lib/deeplinks.ts:16-42` | ADR 001 (v2 tree behind a flag) | Sprint 1 |
| R14 | **Creator clubs and chapters are still live code**: `clubs.type = "creator"`, the `chapters` table, `PublishChapterScreen`, the chapter-drop fan-out, and `chapterId` on reactions, progress and bookmarks. | schema `:60`, `:167` | Neither the v2 PRD nor the architecture mentions them | Sprint 10 migration. Counts C6 and C7 size it. |

### Smaller mismatches in the documents

- `CLAUDE.md` says each mode token file carries "the same 14 groups". Each has 13: Surfaces, Text, Button, Feedback, Reader, Highlight, Margin, Overlay, Status, Badge, Progress, Focus, Skeleton.
- The spec cites `design-handoff/README.md` → "Components"; the section is "Design system", and its list differs from `_ds_manifest.json` (section 3).
- `design-handoff/README.md` → "Files" lists `PRD - Flipbook v2 Reader App.md`, which is not shipped. `docs/v2/README.md` already explains why.
- `convex/schema.ts:251` describes the waitlist as coming from `getflipbook.com`; everything else says `useflipbook.com`.
- `app.json` version is `1.0.0`. S0-2 needs a bump before the gate can distinguish builds.

---

## 7. Decisions for Moks

| # | Decision | Needed by | Options |
| --- | --- | --- | --- |
| D1 | `clubs` or `communities` as the physical table | Sprint 7; affects naming from Sprint 2 | Keep `clubs` and extend it, with v2 calling it a community in its API · or a new `communities` table with backfill and dual-write |
| D2 | Where catalogue books live, given v1 owns `books` | Sprint 2 | A new table name for the v2 catalogue · or loosen v1 `books` required fields |
| D3 | v2 reactions: extend v1 `reactions` or a new table | Sprint 5 | Extend with optional edition and paragraph fields and a placeholder `page` · or a new table, leaving v1 `reactions` for club copies |
| D4 | Do spoiler rules and paragraph anchors apply to club copies | Sprint 5 | PDFs: gate by page, or leave open as in v1 · EPUBs: ingest club copies to get paragraph IDs, or keep them read-only |
| D5 | Do v1 bookmarks carry into v2 | Sprint 3 | Keep for club-copy PDFs · or drop from v2 UI and leave the data |
| D6 | Do club copies get ADR 008 protection | Sprint 2 | Encrypt and short-link them like catalogue books · or leave as v1 |
| D7 | PRD 4.5 private highlights are new work, not a port | Sprint 4 | Re-scope the Sprint 4 line · and reword 1.4 and 4.5 in the live PRD |
