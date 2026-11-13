# Flipbook v2 — Architecture

Source: the "Architecture" tab of the Flipbook v2 Build Plan (12 Nov 2026). If this file and the plan disagree, stop and flag it.

Keep the stack and evolve the v1 codebase. Three rules live in the backend: the server decides access, the server enforces spoilers, and every anchor points at a stable paragraph ID.

## The shape

- **Phone app (Expo, iOS and Android):** screens on design-system tokens (Light, Flip, Dark; Glass style); reader (epub.js in a WebView for EPUB, the native module in `modules/native-highlight-pdf/` for PDF club copies); offline store (encrypted books, queued reactions); service SDKs (RevenueCat, Clerk, LiveKit).
- **Convex backend, one folder per domain:** an `access` module every other module calls ("who can read this, and how far have they read"), then catalogue, reading and margin, communities and chat, billing, activity, sessions.
- **Outside services:** Clerk (sign-in), App Store and Google Play via RevenueCat, Paystack (web only), LiveKit Cloud (audio rooms), Expo Push, Sentry and PostHog.
- **Web (useflipbook.com):** one Next.js site for the web front door (PRD Epic 15) and the founders' console (Epic 13), both on Convex and Clerk.

The app talks to outside services through their SDKs for sign-in, payment sheets and audio, but only Convex decides what a reader may open or see.

## Architecture decisions

Fourteen decisions. Each will also get its own file in `docs/v2/adr/`.

| ADR | Decision | Why | Rejected | Revisit when |
| --- | --- | --- | --- | --- |
| 001 | Evolve the v1 repo and Convex deployment; v2 UI is a new navigation tree behind a flag | v1 users' clubs, books and reactions must survive (PRD 1.4); the native highlight module and EPUB reader are hard-won | A fresh app | Never for v2 |
| 002 | Stay on Convex as one modular backend, one folder per domain | Live queries already power margin, Lobby and chat; one system is easier for one builder | Separate realtime service; microservices | Monthly Convex bill passes what a hire would cost |
| 003 | One `access` module answers "can this user read this?" and "can they see this paragraph?"; every query calls it | Spoilers and paywalls fail when each screen decides for itself | Client-side checks | Never |
| 004 | Convex holds entitlements; store and Paystack webhooks only write to it | One truth across iOS, Android, web, gifts, Pro and credits; consumables can't be restored from the store anyway | Trusting the store SDK on the device | — |
| 005 | In the app, rentals, gifts and Pro are sold through the stores via RevenueCat; on useflipbook.com, rentals and gifts are sold through Paystack, whose webhooks write the same entitlements in Convex | Compliant in every market (see the five store rules in PRD Epic 15) | Web hand-off from the app | Store rules change in your markets |
| 006 | Catalogue books get stable paragraph IDs at ingest; reactions anchor to edition + paragraph | Same place on every device and font size (5.1); the edition lock guarantees one text | EPUB CFI positions | A publisher ships a revised edition |
| 007 | Keep epub.js in a WebView for EPUB and the native module for PDF club copies | Both work in v1; rewriting the reader is the highest-risk move available | A new reader engine | Two-page spread or performance fails the Sprint 3 spike |
| 008 | Book files encrypted at rest, fetched by short-lived links, readable offline until the rental ends | Deters copying without paying for DRM | Readium LCP DRM; no protection | A publisher contract requires real DRM |
| 009 | Live sessions on LiveKit Cloud, audio only, tokens issued by Convex | Expo plugin, recording and low-bitrate audio; no media servers to run (needs development builds, not Expo Go) | Agora; self-hosted | Session minutes cost more than self-hosting |
| 010 | Voice notes recorded as low-bitrate mono, about 0.5 MB for 2 minutes, stored in Convex storage | Data plans (7.3); simple | Third-party media hosting | Storage costs climb |
| 011 | The Activity table is the source of every notification; push is a copy of it with spoilers veiled on the server | Every push has something behind it (10.1); one place to enforce rules | Push sent directly from features | Never |
| 012 | Design tokens are generated, never hand-copied; layout by window width from day one | No stray hex values; tablets don't break later | Hand-written theme; fixed 390 px layouts | Never |
| 013 | The existing Next.js site in `web/` (useflipbook.com) is extended to serve the web front door and the founders' console; only a Clerk admin role reaches the console, and every admin action writes an audit log row | Keeps admin code out of the reader app | Admin screens in the app; the Convex dashboard alone | Someone other than the founders needs access |
| 014 | The founders' dashboard reads daily rollup tables filled by a nightly Convex job: money and counts from Flipbook's own ledger and entitlements; funnels and cohorts from PostHog's query API; a daily FX rate drives the USD toggle | Fast pages on a phone; never scans every reader's records live; the ledger stays the single source for money | Live queries over raw tables; a separate BI tool | Questions need same-day data or joins PostHog can't answer |

**Design tokens (ADR 012):** colour values come from the Tokens Studio exports at the repo root (`Brand`, `Light`, `Dark`, `Flipbook` = Flip). Glass materials, style tokens (Glass/Classic), radius and spacing come from `docs/v2/design-handoff/_ds/tokens/*.css`. Ship Glass only; keep tokens style-scoped so Classic can return. Icons: Hugeicons (stroke-rounded, 1.5). If the two token sources disagree on a value, stop and flag it.

## The three hard parts

These decide whether v2 feels world-class. Each gets a spike before building and an extra review after.

### 1. The spoiler engine

The server stores each reader's furthest paragraph per edition, and it only ever moves forward. A page counts as read once it has stayed on screen for a few seconds; a jump of more than a chapter counts only if the reader says yes to "Count this as read?" (PRD 5.2). Every query that returns book-linked content filters by the furthest paragraph before anything leaves the server.

- **Margin:** reactions beyond the furthest paragraph are never sent. The ahead hint returns a chapter and a busy or quiet level only, with no names, text or counts.
- **Chat:** every message stores the sender's chapter. Messages from readers ahead arrive veiled and lift when you catch up. Push text is veiled on the server.
- **Quote cards, scrubber markers, Activity and session warnings** all use the same check.

A filter in the app alone would leak spoilers to anyone who inspects network traffic, and to every notification.

### 2. Paragraph anchoring

The ingest script (PRD 14.1) tags every block in a catalogue EPUB with a stable ID and writes a chapter map. Reactions anchor to edition + paragraph; highlights add character offsets within it. Chapter + percent positions come from the same map, so social UI never shows page numbers. Paragraph IDs never change after publish.

The edition lock (6.3) is what makes this safe: a new edition is a new set of anchors. v1 club copies keep whatever anchors v1 uses.

### 3. Entitlements and payments

The app never decides access. The flow for an in-app rental:

1. Reader taps "Get it ₦1,500"; Convex records a pending order (book, band, region price, recipient if a gift).
2. The store sheet takes payment through RevenueCat.
3. The app asks Convex to confirm; Convex verifies with RevenueCat and writes the entitlement (4 or 6 weeks, price paid).
4. The book opens. The store webhook arrives later and is ignored if the order is already confirmed.

Step 3 keeps "tap to reading" under 45 seconds without waiting for a webhook. Every sale also writes an append-only ledger row (gross, store or Paystack fee, author share at 70% of net), because royalty statements depend on it from the first sale. Web purchases follow the same shape with Paystack webhooks.

Products: a rental per band at standard and Pro price, a gift per band, and three Pro subscriptions, priced per region in each store. Confirm in the Sprint 12 spike whether rentals are consumables or non-renewing subscriptions.

## Data model

About 30 tables in nine domain folders. All new tables are additions; no v1 table changes shape.

| Domain | Tables | Notes |
| --- | --- | --- |
| Users | users, pushTokens, notificationPrefs, blocks | Date of birth stored once, locked; teen rules read from here |
| Catalogue | books, editions, bandHistory | Edition holds format, band, Special flag, chapter map, paragraph count, reading time, language, age rating, status |
| Access | entitlements, orders, ledger, credits, subscriptions | One entitlement row per grant: rental, Pro, gift, club copy, preview |
| Reading | readingState, highlights, rhythmDays | readingState holds current position and the furthest paragraph |
| Margin | reactions, reports | One reply level: a reaction has an optional parent |
| Communities | communities, memberships, communityBooks, invites, takeoverRequests | communityBooks holds the edition lock per read |
| Chat | messages, pins | Each message stores the sender's chapter at sending |
| Sessions | sessions, rsvps, recordings | Built in Release C |
| System | activity, flags, appConfig, moderationActions, auditLog, filterWords, dobCorrections, metricsDaily, fxRates, targets | appConfig holds the minimum app version |

Courses (Epic 12) add four tables later and need nothing here to change.

## Moving v1 users across

v1 and v2 apps will talk to the same backend for weeks, so the v1 rule holds: add, never change.

1. Ship a final v1 build with a minimum-version check, so the update can be required at Release A.
2. Write backfill migrations: v1 uploads become editions marked "Club copy" with matching entitlements; v1 hosts get the Founding Host flag; v1 reactions keep their anchors.
3. Rehearse each migration on a copy of production data in the preview deployment and compare counts before running it for real.
4. Turn v2 on by cohort with flags: Moks, then Founding Hosts, then everyone.
5. Retire v1-only functions only after the minimum version passes every active install.
