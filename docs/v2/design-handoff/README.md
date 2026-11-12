# Handoff: Flipbook v2 — Reader app (Epics 1–12 and large screens)

## Overview
Flipbook is a mobile reading app (iOS + Android) where people read the same book together: friends' reactions sit in the margin beside the paragraph that provoked them, revealed only when you reach it. Around each book is a community with a Lobby, Chat and live audio Sessions. v2 adds a library (rent, gift, Pro subscription), notifications, a private reading rhythm, profiles/settings and course communities for lecturers.

This package covers every user story in the PRD (`PRD - Flipbook v2 Reader App.md`, draft 4), Epics 1 to 12, as phone screens in every state, in three themes (Light, Flip, Dark), two styles (Glass default, Classic) and on both platforms. Three further files adapt the main screens to tablets, foldables and iPhone Duo (see Large screens).

## About the design files
The files here are **design references built in HTML**. They are prototypes showing intended look, copy and behaviour, not production code to copy. The task is to **recreate these screens in the target codebase** (React Native, SwiftUI/Compose, Flutter, etc.) using its own patterns. If no app exists yet, React Native or native iOS/Android are both reasonable; the designs assume native status bars, gesture bars and store purchase sheets.

How to open them: serve this folder over HTTP (e.g. `npx serve .`) and open any `Epic NN - *.dc.html` file in a desktop browser. Each Epic file is a pannable canvas of 390×844 phone frames, grouped by user story, read left to right. Each frame is a `*ScreenGlass.dc.html` file rendered with props:
- `screen` — which state (full list below)
- `theme` — `light` | `flip` | `dark`
- `look` — `glass` | `classic`
- `platform` — `ios` | `android`

You can open a screen file directly too. `.dc.html` files are HTML with an inline-styled template plus a small logic class (`renderVals()`) holding all copy and per-state data, so **the logic class in each screen file is the source of truth for copy and state data**. `support.js` is the runtime that renders them. Ignore it when implementing.

## Fidelity
**High fidelity.** Colours, type, spacing, radii, copy and states are final, with three exceptions:
1. **Payment steps are wireframes** (dashed boxes, labelled `WIREFRAME`). The payment route is undecided (PRD §8): native store sheet or web hand-off and return. Both variants are drawn (Epic 3 › 3.1, Epic 9 › 9.2). Everything around them is final.
2. **Placeholder content.** These need replacing with real catalogue data:
   - Fictional books: *Small Rain in Yaba*, *Letters to Kano*, *The House on Ọba Road*.
   - All chapter counts and reading times.
   - The course in Epic 12 (University of Lagos, ENG 214).
   - All person names and emails.
3. **Pro prices are placeholders**: ₦2,500 a month, ₦6,750 a quarter (₦2,250 a month), ₦24,000 a year (₦2,000 a month).

## Design system
Everything is built on the **Flipbook Design System** (bundled in `_ds/`):
- `_ds/.../tokens/*.css` — colours (brand scales + Light/Flip/Dark semantic layer), typography, spacing/radius/size/duration, glass materials and Glass/Classic style tokens.
- `_ds/.../_ds_bundle.js` — React reference implementations of the components, exposed as `window.FlipbookDesignSystem_7ad4ad.*`.

Use **semantic tokens only** (`--surface`, `--text`, `--primary`, `--card-fill`, `--radius-card` …). Never use the brand scales directly. Themes switch with `data-theme` and styles with `data-style` on any ancestor.

Components used: Button (primary/secondary/ghost; lg 52 / md 48 / sm 40 / pill 36; loading, disabled), Badge (pro, founding-host), Banner (positive/warning/error), Toast, BookCover, Icon (Hugeicons stroke-rounded, 1.5 stroke, 20/24px), AppHeader, SegmentedTabs, TabBar, Sheet, OptionRow, Emblem, UnreadDot, Composer, ChatMessage, VoiceNote, MarginReaction, ReactionPicker, MemberProgress, SessionCard, LiveBar.

Not in the DS, so these are built inline in the screens and are candidates for new components:
- **Band pill:** glass pill on cover corners, bottom-right, 22px tall, 700 11px.
- **Toggle switch:** 50×30 track, `--text` when on, `--tint-3` when off, `--surface` knob.
- **Grouped list card:** a `--card-fill` card with rows separated by `inset 0 1px 0 var(--divider)`, and a 32px tinted icon disc.
- **Week-dot strip:** used in Reading rhythm.
- **Stacked totals bar:** used in course progress.

### Key token values
Brand:
- indigo-900 `#3b3a6d`, indigo-600 `#6662c9`
- coral-400 `#ff6b6b`, coral-700 `#c11414`
- ivory `#f7f3e3`, pale-sky `#d1d8e0`, black `#121212`
- aqua `#73d2de`, gold `#e4b363`, gold-300 `#ebc584`, plum `#5d3a5a`

Semantic layer:
- **Light:**
  - Surface white (`neutral-50`); text indigo-900; primary indigo-900; text-accent coral-700.
  - Reader page ivory.
- **Flip** (the signature theme):
  - Surface indigo-900, raised indigo-800; text neutral-50; secondary text pale-sky; text-accent gold-300.
  - Primary coral-400, with black on-primary.
  - Reader page indigo-900, reader text ivory.
- **Dark:**
  - Surface `#121212`; primary indigo-600; text-accent gold.
  - Reader text pale-sky.

Type and spacing:
- **Type:** Manrope for UI, Literata for book text.
  - Display 32/40 700, h1 24/32 700, h2 20/28 600, h3 17/24 600.
  - Body 15/22 400, label 13/18 600, caption 12/16 500.
  - Reading 18/30 Literata, quote 16/24 italic.
- **Spacing:** 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48). Screen side margin 20, card padding 16, sections 24.
- **Radius:** cover 4; chips and inputs 8; Glass cards 22–28 (`--radius-card`); option rows 22 (`--radius-row`).
  - Glass controls are fully rounded pills.
  - Glass sheets are 36, inset 8 from the screen edge. Classic uses 12 for buttons and cards, 16 for sheets.
- **Elevation:** in-flow content has no shadow. Floating glass (tab bar, toasts, pills) uses `--float-*`; sheets use `--sheet-*`. Blur appears only on floating chrome and sheets.
- **Motion:** 200ms ease-out for fades and slides, 150ms for presses. No bounces. Every animation has a reduced-motion fallback.

## Global layout rules (all screens)
- **Frame:** 390×844. iOS status bar 54, home indicator 34. Android status bar 36, gesture area 24.
- **Header:** AppHeader floats over content at status-bar height (60px tall: back button plus a grouped action pill). Screen bodies start at `statusH + 64`.
- **Footer:** primary actions live in a bottom footer on `--chrome-fill` + `--chrome-blur` + `--chrome-edge`, padded 12 / 20 / (34 iOS | 24 Android). Buttons are lg (52px) and full width. Primary appears at most once per view.
- **Tab bar:** a floating glass pill inset 16, sitting 18px above the bottom (12 on Android). Tabs are Home · Shelf · Communities · You.
- **Sheets:** use DS Sheet with `overlay` (scrim plus inset panel). Content gap is 14; bottom padding is footPad − 16.
- **Covers:** 2:3 ratio, radius 4, a 1px `--divider` hairline. The band pill sits bottom-right, never over the author line.

## Content rules (from the brand)
- **Voice:** sentence case everywhere and no exclamation marks. The product never says “we”; it addresses the reader as “you”. Never use the word “platform”.
- **Prices:** written with no space after the naira sign (₦2,500). A price goes in the button label when it is the action (“Get it ₦2,500”). Pro books say “Included with Pro”, never ₦0.
- **Positions:** shown as chapter and percent (Ch 12 · 34%), never page numbers.
- **Spoilers:** anything ahead of the reader is veiled. Show who and which chapter, never the text.
- **Privacy:**
  - Never reveal who hasn't bought a book (“Not started”, never “hasn't bought”).
  - Reading rhythm is private.
  - Course progress shows totals only, with groups under 3 shown as “a few”.
- **Bands:** “Band A” to “Band D” everywhere.

  | Band | Contents | 4 weeks | With Pro |
  | --- | --- | --- | --- |
  | A | Classics | ₦500 | Free |
  | B | Independent | ₦1,500 | ₦1,275 |
  | C | Standout indie / Flipbook Editions | ₦2,500 | ₦2,125 |
  | D | Major publishers, hidden until launch | ₦4,000 | ₦3,400 |

  Pro rentals last 6 weeks.
- **Notifications:** every one has something to open behind it. Never guilt, fake urgency or streaks.

## Epics and screens
Each Epic file groups frames by PRD story, with the story ID as the kicker. Sections:

- **Epic 01 - Onboard.dc.html** — Arrive and onboard
  - 1.1 · P0 · Invitee: From a friend’s link to reading, in three screens
  - 1.2 · P0 · Browser: Sign up and say what you like to read
  - 1.3 · P0 · All: Asked once, neutrally
  - 1.4 · P0 · v1 user: Everything where you left it, and what’s new once
  - Classic style: The same flow in Classic
  - Android: The same screens on Android
- **Epic 02 - Discover.dc.html** — Discover
  - 2.1 · P0 · Browser: Home shows a few curated shelves
  - 2.2 · P0 · Browser: The book page says whether it’s for you, and who you’d read it with
  - 2.3 · P0 · Browser: Search by title, author or genre
  - 2.4 · P0 · All: Read the first chapter free
  - 2.5 · P0 · All: Four price bands, readable at a glance
  - Classic style: The same screens in Classic
  - Android: The same screens on Android
- **Epic 03 - Get the book.dc.html** — Get the book
  - 3.1 · P0 · Browser: Getting a book takes seconds and never feels like a checkout
  - 3.2 · P0 · Regular: For Pro members, classics and Specials just open
  - 3.3 · P1 · Browser: If payment fails, a calm way to try again
  - 3.4 · P0 · All: Shelf shows everything I’m reading
  - 3.5 · P0 · All: A heads-up before a rental ends, and an easy way to keep going
  - 3.6 · P0 · All: If a book is taken down, I’m told plainly and given a credit
  - 3.7 · P0 · All: Gift a copy to a specific friend, at full price
  - Light and Dark: Key screens in every room
  - Classic style: The same screens in Classic
  - Android: The same screens on Android
- **Epic 04 - Read.dc.html** — Read
  - 4.1 + 4.2 · P0: Open a book, pick up where you left off
  - 4.1 · States: Downloads, offline and storage
  - 4.3 · P0: Make the page yours
  - 4.4 · P0: Move around the book
  - 4.5 · P1: Private highlights
  - 4.6 · P0: Finishing feels like something
  - 4.7 · P0 · Regular: Read or listen
  - 4.7 · States: When audio isn’t there
  - Android: The same screens on Android
- **Epic 05 - Margin.dc.html** — Read together
  - 5.1 · P0: React without leaving the page
  - 5.2 · P0: Only what you’ve read
  - 5.3 · P0: Life ahead, without spoilers
  - 5.4 · P0: New reactions arrive gently
  - 5.5 · P0: Reply, and hear back
  - 5.5 · States: A reply you haven’t reached
  - 5.6 · P0: Choose whose margin you see
  - 5.7 · P1: The author is in the room
  - 5.8 · P0: Report a reaction
  - Android: The same screens on Android
- **Epic 06 - Communities.dc.html** — Communities
  - 6.1 · P0 · All: The Lobby is the room’s front door
  - 6.2 · P0 · Host (Pro): Start a community in under a minute
  - 6.3 · P0 · Host (Pro): Set the room’s book from the catalogue
  - 6.4 · P0 · Host: Inviting is one tap to WhatsApp
  - 6.5 · P0 · Host (Pro): Host tools
  - 6.6 · P0 · Free member: Up to 3 communities
  - 6.7 · P0 · Member: When the host’s Pro lapses, nothing breaks
  - 6.8 · P0 · Founding Host: Founding Hosts are thanked properly
  - 6.9 · P1 · Legacy host: Upload a PDF or EPUB, quietly
  - 6.10 · P1: Leave and keep your book
  - Android: The same screens on Android
- **Epic 07 - Chat.dc.html** — Community chat
  - 7.1 · P0: Chronological chat with text and voice notes
  - 7.2 · P0: You never get spoiled in chat
  - 7.3 · P0: Voice notes work on a real data plan
  - 7.4 · P0: Share a passage as a quote card
  - 7.5 · P0 · Host: Hosts keep chat healthy
  - 7.6 · P0: Chat doesn’t flood your phone
  - States: Loading, offline and empty
  - Android: The same screens on Android
- **Epic 08 - Sessions.dc.html** — Live sessions
  - 8.1 · P0 · Host (Pro): Schedule a session
  - 8.2 · P0: RSVP and reminders
  - 8.3 · P0: Warned before joining if you’re behind
  - 8.4 · P0: One tap into the room
  - 8.5 · P0 · Host: Running the room
  - 8.6 · P1: Summary and recording
  - 8.7 · P0 · Teen lane: Teens join only where they’re invited
  - States: Loading, empty, offline and a weak signal
  - Classic style: The same flow in Classic
  - Android: The same screens on Android
- **Epic 09 - Pro.dc.html** — Pro
  - 9.1 · P0: Pro shows up where it helps, not through nagging
  - 9.2 · P0: Compare plans and subscribe through the store
  - 9.3 · P0: My plan, renewal date and a manage-in-store link
  - 9.4 · P0: Specials feel like a members’ shelf
  - Founding Host · from Epic 6: Founding Host welcome and reminders
  - Light and Dark: Key screens in every room
  - Classic style: The same screens in Classic
  - Android: The same screens on Android
- **Epic 10 - Rhythm and notifications.dc.html** — Rhythm and notifications
  - 10.1 · P0: Reminders are about my book
  - 10.2 · P0: One place for what happened while I was away
  - 10.3 · P0: My reading rhythm
  - Light and Dark: Key screens in every room
  - Classic style: The same screens in Classic
  - Android: The same screens on Android
- **Epic 11 - You.dc.html** — You
  - The You tab: One place for everything about you
  - 11.1 · P0: Profile: name, avatar, bio, favourite genres, badges
  - 11.2 · P0: Settings: reading defaults, notifications, theme, privacy, delete account
  - 11.3 · P1: Reading history
  - Light and Dark: Key screens in every room
  - Classic style: The same screens in Classic
  - Android: The same screens on Android
- **Epic 12 - Course communities.dc.html** — Course communities
  - 12.1 · Lecturer: Create a course and invite the class
  - 12.2 · Lecturer: A reading list students open in one tap
  - 12.3 · Lecturer: Class progress, only as totals
  - 12.4 · Lecturer: Manage the class, and close at term end
  - Light and Dark: Key screens in every room
  - Classic style: The same screens in Classic
  - Android: The same screens on Android

## Large screens
Three canvases show the main screens from Epics 1 to 12 on large screens, all rendered by **AdaptiveScreen.dc.html**. Same components, tokens and copy as the phone; only layout changes. Frames are shown in Flip and Glass; Light, Dark and Classic follow the same tokens.

- **Large screens 1 - Tablet.dc.html**: iPad landscape (1180×820, full sidebar), iPad portrait (820×1180, icon rail), Split View and Slide Over, Android tablet landscape (1280×800).
- **Large screens 2 - Foldable.dc.html**: book-style foldables. Cover display (≈380×860 dp) runs the phone layout; inner display (≈860×920 dp) runs the rail layout and is treated as one flat surface. Unfolding keeps scroll position, open sheet and reading position.
- **Large screens 3 - iPhone Duo.dc.html**: follows Apple's iPhone Duo guide (iOS 27.1 SDK). Closed uses the phone layout; open uses the iPad layout, edge to edge on both displays, with the status bar on the right edge and the tab bar running vertically below it. Display sizes are proportional placeholders until Apple publishes specs.

**Layout rules** (by available window width, never by device, orientation or idiom; re-layout on every size change):
- Under 600: phone layout with the floating tab bar.
- 600 to 999: left icon rail.
- 1000 and up: full sidebar with your communities and Continue reading.
- Content reflows in wrapping cards, minimum 300 to 330 wide, so screens hold up mid-resize.
- **Reader** is always full-screen with no navigation. From 700 wide it becomes a two-page spread; margin reactions sit in the gutter beside their paragraph, and the progress bar sits under the right-hand page.
- **Sheets** become centred form sheets, 440 wide, on wide windows; compact windows keep bottom sheets.
- Covers always fit, never crop.

**AdaptiveScreen props:**
- `device` — `ipadL` | `ipadP` | `androidL` | `split` | `slide` | `foldCover` | `foldInner` | `duoOuter` | `duoInner`
- `screen` — `home`, `homeOffline`, `book`, `confirm`, `shelf`, `shelfEmpty`, `reader`, `readerThread`, `lobby`, `chat`, `session`, `plans`, `activity`, `you`, `course`, `invite`
- `theme` — `light` | `flip` | `dark`
- `look` — `glass` | `classic`

## Screen states (one per `screen` prop value)
- **ChatScreenGlass.dc.html** (21 states): `chat`, `mention`, `actions`, `reply`, `veiled`, `revealed`, `spoiler`, `caughtUp`, `recording`, `review`, `voicePlay`, `quote`, `quoteShare`, `hostActions`, `pinned`, `mute`, `report`, `notif`, `loading`, `offline`, `empty`
- **CommunityScreenGlass.dc.html** (36 states): `lobby`, `lobbyScrolled`, `lobbyHost`, `lobbyBetween`, `lobbyLoading`, `startPro`, `create`, `emblemCrop`, `createEmblem`, `createBook`, `created`, `setBook`, `edition`, `bookSet`, `notifCopy`, `getCopy`, `getCopyPro`, `inviteShare`, `invite`, `tools`, `members`, `member`, `capNote`, `capSheet`, `lapsed`, `takeover`, `takeoverSent`, `founding`, `reminder7`, `reminder1`, `legacyPick`, `upload`, `clubCopy`, `leave`, `leaveHost`, `left`
- **CourseScreenGlass.dc.html** (12 states): `create`, `invite`, `invited`, `list`, `addBook`, `sharePdf`, `student`, `progress`, `tools`, `students`, `elsewhere`, `closed`
- **DiscoverScreenGlass.dc.html** (27 states): `home`, `homeScrolled`, `homeNew`, `homeOffline`, `homeLoading`, `specials`, `bookPreview`, `bookGet`, `bookProDiscount`, `bookPro`, `bookClassic`, `bookIndie`, `bookPublisher`, `bookContinue`, `bookFinished`, `bookUnavailable`, `bands`, `bandsD`, `bandSheet`, `search`, `searchResults`, `searchFilter`, `searchNone`, `searchOffline`, `previewReader`, `previewEnd`, `previewGot`
- **GetBookScreenGlass.dc.html** (29 states): `confirm`, `opening`, `opened`, `storeSheet`, `webHandoff`, `webPage`, `webReturn`, `proConfirm`, `proIncluded`, `proOpened`, `failed`, `methods`, `shelf`, `shelfFinished`, `shelfExpired`, `shelfEmpty`, `shelfOffline`, `expiryPush`, `expiryShelf`, `expirySheet`, `expiredBook`, `takedownShelf`, `takedownLobby`, `giftPick`, `giftOwned`, `giftConfirm`, `giftSent`, `giftLink`, `giftReceived`
- **MarginScreenGlass.dc.html** (27 states): `hold`, `flying`, `reacted`, `compose`, `commented`, `reveal1`, `reveal2`, `quiet`, `ahead`, `live1`, `live2`, `liveReduced`, `thread`, `replying`, `notif`, `notifOpen`, `notifAhead`, `locked`, `switcher`, `switched`, `solo`, `authorMargin`, `author`, `reportMenu`, `reportSheet`, `reported`, `removed`
- **NotifyScreenGlass.dc.html** (8 states): `lock`, `activity`, `activityEmpty`, `settings`, `rhythm`, `rhythmNoGoal`, `rhythmQuiet`, `goalSheet`
- **OnboardScreenGlass.dc.html** (20 states): `invite`, `inviteWeb`, `inviteResume`, `signup`, `phone`, `otp`, `about`, `aboutConfirm`, `expired`, `closed`, `teenAdult`, `welcome`, `profile`, `genres`, `dob`, `teen`, `under13`, `new1`, `new2`, `new3`
- **ProScreenGlass.dc.html** (13 states): `specialPrompt`, `classicPrompt`, `youFree`, `youPro`, `youGrace`, `plans`, `subscribing`, `storeSub`, `welcome`, `manage`, `manageGrace`, `specialsFree`, `specialsPro`
- **ReadScreenGlass.dc.html** (34 states): `shelf`, `shelfReady`, `shelfPaused`, `shelfLow`, `shelfSkeleton`, `shelfMini`, `opening`, `reader`, `readerChrome`, `readerSynced`, `readerOffline`, `readerPartial`, `readerMini`, `display`, `displaySans`, `contents`, `highlights`, `scrub`, `jumped`, `select`, `highlighted`, `lastPage`, `finish1`, `finish2`, `finish`, `finishNext`, `finishSolo`, `player`, `playerPaused`, `playerLapsed`, `nonPro`, `onItsWay`, `textOnly`, `unavailable`
- **SessionScreenGlass.dc.html** (34 states): `list`, `listGoing`, `liveNow`, `offline`, `empty`, `loading`, `schedule`, `scheduleCovers`, `scheduleRec`, `scheduled`, `chatCard`, `notify`, `behind`, `recConsent`, `joining`, `live`, `liveReact`, `liveChat`, `handRaised`, `invited`, `invitedRec`, `weak`, `recLive`, `minimised`, `minimisedLobby`, `ended`, `hostLive`, `hands`, `hostPerson`, `endConfirm`, `handover`, `summary`, `summaryRec`, `teen`
- **YouScreenGlass.dc.html** (13 states): `hub`, `hubFree`, `hubGrace`, `profile`, `profileOther`, `edit`, `settings`, `readingDefaults`, `privacy`, `deleteInfo`, `deleteConfirm`, `deleted`, `history`

- **Cover.dc.html** draws the brand artwork covers (pp, persuasion, middlemarch, north, emma, stay). Other covers use DS BookCover with a tone (indigo, plum, gold, coral, aqua, ivory).

## Interactions & behaviour (highlights)
- **Get the book (3.1):**
  - Tap “Get it ₦X” → confirmation sheet (price, rental end date) → payment step (store sheet, or web hand-off → browser → return and confirm).
  - The book opens directly on the next chapter, with a toast as the receipt. While paying, the button shows a loading state labelled “Opening”.
  - Target: under 45s from tap to reading.
- **Payment failure (3.3):** an error Banner reading “Your bank didn't approve this one.”, then Try again, or Pay another way (web route only). The reader's place is kept.
- **Pro (9.x):**
  - Pro moments appear only in context: Specials, an included classic, audio, starting a community, the community cap.
  - One Pro entry lives in You; nothing appears on launch. Each moment shows once per session and always has a free path.
  - Subscribe → store sheet → welcome screen that names what the reader came for first.
  - Grace period: a warning Banner on You and Manage Pro.
- **Rental expiry (3.5):** a push 48h before the end, plus a card on Shelf, leading to the Keep reading sheet. Expired books stay on Shelf with “Read again”; place, highlights and reactions return.
- **Gifting (3.7):**
  - Pick from community members only. Owners are flagged before payment.
  - Optional note. Gift link alternative.
  - The recipient's screen reads “Ada got you a copy of …” with Open it.
- **Shelf (3.4):** Reading / Finished / Expired tabs. Rows show progress, time left, download state and a quick Read button; labels include “Club copy” and “Gift from Ada”.
- **Activity (10.2):** newest first, with UnreadDot (never counts). Every item deep-links to its target. Replies ahead of the reader are veiled.
- **Delete account (11.2):** what happens → confirm by typing DELETE → done. Reactions remain as “Former reader”. A warning says Pro must be cancelled in the store.
- **Courses (12.x):**
  - Email paste with validation, then a reading list (Required/Optional, weeks).
  - PDF sharing requires a rights checkbox; PDFs stay in the course and can't be downloaded.
  - Progress shows totals only. The course closes to new students at term end.
  - Manage has **no** grading or attendance entry by design.
- **States:** every list has skeleton, empty, offline and error states where the PRD asks for them (see each Epic). Focus is a 2px `--focus-ring` with a 2px gap.

## State management (suggested)
- **Session:** `user` (name, avatar, bio, genres, badges), `plan` (free | pro, period, renewsAt, graceUntil), `theme`, `style`, `readingDefaults` (typeface, size, margin on/off).
- **Library:** `rentals[]` (bookId, endsAt, source: bought|gift|club|pro, position {chapter, pct}, download state), `credits`.
- **Catalogue:** `book` (band A–D, special, chapters, readingTime, editionLock).
- **Social:** `communities[]` (role, cap 3 on Free), `activity[]` (type, target deep link, chapter, veiled, read), `notificationPrefs` per type.
- **Rhythm:** `daysRead` per week, optional `goal` (private).
- **Courses:** course (institution, code, term dates, closed), roster (invited/joined), `readingList[]` (required, weeks, pdf), and aggregate progress buckets, computed server-side.

## Assets
- `assets/flipbook-full-{light,flip,dark}-colored.svg`: the full logo lockup.
- `assets/flipbook-icon-flip-primary.svg`: the app icon, used in push notifications.
- **Icons:** Hugeicons free set, stroke-rounded, 1.5 stroke. The DS Icon component maps the Flipbook names (search, lock, bell, shelf, …) to their Hugeicons exports.
- **Book covers** are the only imagery. No photos and no illustration.

## Files
- `Epic 01 … Epic 12 - *.dc.html`: the story canvases, the entry points for review.
- `Large screens 1 … 3 - *.dc.html`: the tablet, foldable and iPhone Duo canvases.
- `*ScreenGlass.dc.html`, `AdaptiveScreen.dc.html` and `Cover.dc.html`: the screen sources. Copy and per-state data are in each file's logic class.
- `_ds/`: the Flipbook Design System tokens and component bundle.
- `Flipbook DS v2 - Glass update.md`: notes on the Glass style update.
- `PRD - Flipbook v2 Reader App.md`: the source PRD (draft 4).
- `support.js`: the runtime for previewing the HTML only. Don't port it.
