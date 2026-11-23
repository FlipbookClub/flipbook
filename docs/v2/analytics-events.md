# Analytics event plan

**Task:** S0-8 (`docs/v2/specs/sprint-00-foundations.md`) · **Written:** 23 Nov 2026 · **Decisions:** Moks, 23 Nov 2026
**Feeds:** the founders' dashboard, PRD 13.8–13.12 (13.13–13.16 are P1 and out of scope here) · **Architecture:** ADR 014

Every tile and chart in PRD 13.8–13.12 is mapped below to the event or Convex table that fills it, with the sprint that makes the source real. The event names are declared in `AnalyticsEvent` (`src/lib/analytics.ts`). Apart from `book_opened` and `book_finished` (below), none of the v2 events fires yet; each is wired in the sprint named next to it.

## Rules

1. **Money never comes from analytics.** Revenue, MRR, churn, fees, refunds and author share come only from Flipbook's own ledger and subscription records (ADR 014). An event may say a rental happened; it never carries a price.
2. **Server records beat phone events** (decided 23 Nov). Anything Convex already records (reading, reactions, messages, sign-ups, rentals) is counted from Convex by the nightly rollup, because events from phones are lost offline and behind blockers. PostHog carries what has no server record (screens, attribution, exploration) and the cohorts and retention ADR 014 assigns to it.
3. **No content and no names.** Events carry ids and small enums only: never a book title, author, file name, reaction or chat text, or a person's name or email. Catalogue `book_id` and `edition_id` are fine; a club copy is identified by its id only. Users are identified to PostHog by their internal Convex id (S0-6).
4. **Every event carries `environment`** (development, preview, production), added automatically (S0-6). Dashboards exclude `development`.
5. **Naming:** `object_action` in snake_case, past tense. v1 names are kept as they are.

## Events

### v1 (kept unchanged)

| Event | Fires when | Properties | State |
| --- | --- | --- | --- |
| `sign_up` | A new account's first session is created | `method`: email, apple, google | Firing (S0-6). Gains `source` in Sprint 10, below |
| `sign_in` | An existing account signs in | `method`: password, password_reset, apple, google | Firing (S0-6) |
| `sign_out` | The reader signs out | — | Declared, not fired |
| `profile_completed` | Onboarding's genre step is saved | `genres`: count | Firing |
| `club_created` | A v1 club is created | `type`, `visibility` | Firing |
| `club_joined` | A v1 club is joined | `via`: code | Firing |
| `book_opened` | The reader screen opens a book or chapter, offline opens included | `book_id`, `content_kind`: book, chapter, `file_type`: pdf, epub | **Firing from the next v1 build** (S0-8). v2 adds `edition_id` |
| `book_finished` | The reader reaches the end, by the server's own rule (last PDF page, or EPUB at 98%); once per book per device, and not for a book the server already marks finished | Same as `book_opened` | **Firing from the next v1 build** (S0-8). v2 adds `edition_id` |
| `reaction_added` | A reaction or reply is sent | `type`: emoji, comment | Firing. v2 adds `book_id`, `edition_id`, `is_reply` |
| `chapter_published` | A creator-club chapter is published | `pages` | Firing; retires with v1 |

`book_opened` and `book_finished` were declared in v1 and never sent. Moks decided on 23 Nov to send them from the next v1 build, so reading data from v1 testers exists before v2. Ids only, never titles or text.

### v2 additions (declared, not fired yet)

| Event | Fires when | Properties | Fired by | Sprint |
| --- | --- | --- | --- | --- |
| `community_created` | A v2 community is created | `community_id`, `visibility` | App | 7 |
| `community_joined` | A v2 community is joined | `community_id`, `via`: invite_link, code, qr | App | 7 |
| `book_page_viewed` | A book page opens | `book_id`, `edition_id`, `from`: home, search, community, link, shelf | App | 13 |
| `preview_started` | The free first chapter opens in the reader | `book_id`, `edition_id` | App | 4 |
| `chapter_finished` | The reader's furthest point passes the end of a chapter | `book_id`, `edition_id`, `chapter_index` | App | 4 |
| `rental_started` | A rental's entitlement is confirmed | `book_id`, `edition_id`, `band`, `channel`: app_store, google_play, web, `with_pro` | Convex, at confirmation | 13 |
| `gift_sent` | A gift is paid for | `book_id`, `edition_id`, `channel` | Convex | 18 |
| `gift_claimed` | A gift is opened by its recipient | `book_id`, `edition_id` | Convex | 18 |
| `pro_prompt_viewed` | A Pro prompt is shown | `entry`: specials, audio, classic, community_create, community_cap, you | App | 12 |
| `pro_started` | A Pro subscription becomes active | `plan`: monthly, quarterly, annual, `channel` | Convex, from the RevenueCat webhook | 12 |
| `message_sent` | A chat message is sent | `community_id`, `kind`: text, quote_card | App | 8 |
| `voice_note_sent` | A voice note is sent | `community_id`, `duration_s` | App | 10 |
| `session_joined` | A live session is joined | `session_id`, `community_id`, `role`: listener, speaker | App | 19 |

Events "fired by Convex" are sent from a Convex action at the moment the server confirms the thing happened, so they can't be lost with the phone. They need a server-side PostHog key, added when the first one is wired.

### Sign-up source (Sprint 10)

`sign_up` gains `source`, one of: `invite`, `author_link`, `gift`, `web_book_page`, `direct_unknown` (decided 23 Nov).

- The source is taken from the link that first opened the app, kept on the device until sign-up, and attached to `sign_up`. An invite also attaches `invite_code`.
- **A sign-up with no link counts as `direct_unknown`, not "store search".** Store search can't be told apart from word of mouth or someone typing the name.
- **Until the Sprint 10 spike proves that an invite survives the app-store install, some invited sign-ups will land in `direct_unknown`.** Read invite numbers before that spike as a floor, not a total.
- Recommended alongside the event: write the same source to the reader's Convex record at sign-up, so the nightly rollup can count it without PostHog.

## Records the dashboard reads from Convex

The tables come from `docs/v2/architecture.md` → Data model unless marked as new here. The nightly job (ADR 014) writes daily totals to `metricsDaily`.

| Source | What it gives the dashboard | Exists from |
| --- | --- | --- |
| `users` | Sign-ups, Free vs Pro, Founding Host flag; country (proposed, below); sign-up source (proposed) | Today (fields added later) |
| `readingState` | Books started and finished, completion, first chapter reached | Sprint 3 |
| `rhythmDays` | Reading days per reader per week; part of "active" | Sprint 3–4 |
| `reactions`, `messages` | Reacted or posted (part of "active"), social activity per reader | Sprints 5, 8 |
| `entitlements`, `orders` | Rentals, gifts, preview, Pro grants; payment failures (orders that never confirm) | Sprints 12–13 |
| `ledger` | Gross, store or Paystack fee, net, author share, source, channel, region, currency, refunds | Sprint 13 |
| `subscriptions` | Pro plan, status (active, grace, billing retry, expired), store country; MRR and churn | Sprint 12 |
| `credits` | Credits issued | Sprint 18 |
| `sessions`, `rsvps` | Session attendance | Sprint 19 |
| `inviteOpens` (new) | Invite links opened, per invite code, logged by the website | Sprint 11 |
| `targets`, `fxRates`, `metricsDaily` | Targets from the model, the naira/USD toggle, daily totals | Sprint 15 |

## Definitions (PRD 13, "Definitions and data")

- **Active reader:** opened a book, reacted or posted in the period. Counted from Convex: a reader with a `rhythmDays` row, a reaction or a message dated in the period. ⚠️ This needs `rhythmDays` to be written when a book is *opened*, not only when a page counts as read (PRD 10.3 "days read"). If Sprint 3 records reading days only, add a separate daily-activity record so "opened a book" is countable.
- **Paying reader:** rented, gifted or held Pro in the period. From `ledger` and `subscriptions`.
- **Churn:** Pro readers whose plan ended without renewal, divided by Pro readers at the start of the month. From `subscriptions`.

## Tile-by-tile map

Source key: **CX** a Convex table through the nightly rollup · **PH** PostHog · **RC** RevenueCat, through its webhook into `subscriptions` · **PS** Paystack, through its webhook into `orders` and `ledger`.

### 13.8 Overview

Each tile shows the change against the previous period and a trend line, both from `metricsDaily`. Targets come from `targets` (Model Math).

| Tile | Source | Notes |
| --- | --- | --- |
| Sign-ups | CX `users` | |
| Active readers, daily / weekly / monthly | CX `rhythmDays` + `reactions` + `messages` | Distinct readers; see the definition above |
| Stickiness (daily ÷ monthly) | CX, from the line above | |
| Free and Pro readers | CX `users` + `subscriptions` | |
| Paying readers | CX `ledger` + `subscriptions` | |
| Revenue this month, gross and net | CX `ledger` | Net after store and Paystack fees |
| MRR | CX `subscriptions` (RC) | Each plan converted to a monthly amount |
| Pro churn | CX `subscriptions` (RC) | Definition above |
| Countries with readers | CX `users.country` (proposed) · PH location until then | See "Country" below |

### 13.9 Growth

| Item | Source | Notes |
| --- | --- | --- |
| Sign-ups over time by platform | CX `users` + PH `sign_up` (`$os`) | Platform is recorded on the Convex row from Sprint 10 |
| Sign-ups by source | PH `sign_up.source` · CX `users` source (recommended) | Five sources above; `direct_unknown` caveat applies |
| Invite funnel: link opened → signed up → first chapter → first rental | CX, counted **per invite code** (decided 23 Nov): `inviteOpens` → `users` with that invite code → `readingState` first chapter → `entitlements` first rental | A link opened on the website can't be tied to the person who later signs up in the app, so each step is a count per code, not a per-person funnel |
| Activation: new readers who finish a first chapter within 7 days | CX `users` + `readingState` | `chapter_finished` in PH is a cross-check |
| Countries and cities: readers, Pro and revenue per country | Readers: CX `users.country` (PH location until then). Pro: CX `subscriptions.storeCountry`. Revenue: CX `ledger` region and currency. Cities: PH location only | City is never stored in Convex |

### 13.10 Retention and engagement

| Item | Source | Notes |
| --- | --- | --- |
| Cohort table by sign-up week: active in week 1, 4, 8, 12 | PH retention: first `sign_up` → any of `book_opened`, `reaction_added`, `message_sent`, `voice_note_sent`, `session_joined` | ADR 014 assigns cohorts to PostHog. The same events as the "active" definition, so the two agree |
| Day-1, day-7, day-30 retention | PH retention, as above | |
| Reading days per active reader per week | CX `rhythmDays` | |
| Books started and finished; completion rate | CX `readingState` | `book_opened` / `book_finished` are the cross-check, and the only source for v1 testers before v2 |
| Social activity per active reader: reactions, chat messages, voice notes, session attendance | CX `reactions`, `messages`, `rsvps` / session attendance | Counts per reader, never content |

### 13.11 Pro

| Item | Source | Notes |
| --- | --- | --- |
| Pro readers by plan and region | CX `subscriptions` (RC) | Region from store country |
| Free-to-Pro conversion | CX `users` + `subscriptions` | PH `pro_prompt_viewed` → `pro_started` shows which prompt converts |
| Founding Host Pro due to expire | CX `users` Founding Host flag + their Pro `entitlements` | |
| MRR movement: new, churned, plan changes | CX `subscriptions` (RC) | Needs every webhook change kept, not only the latest state |
| Monthly churn, readers and revenue | CX `subscriptions` (RC) | |
| Renewals in grace period; failed renewals | CX `subscriptions.status` (RC) | |

### 13.12 Revenue and money owed

| Item | Source | Notes |
| --- | --- | --- |
| Gross and net by source (rentals, gifts, Pro) | CX `ledger` | |
| By channel (App Store, Google Play, web via Paystack) | CX `ledger` | |
| By region and currency | CX `ledger` + `fxRates` | |
| Fees paid to stores and Paystack | CX `ledger` | |
| Refunds and credits | CX `ledger` refunds + `credits` | |
| Payment failure rate | CX `orders` (pending that never confirm, failed) (PS, RC) | |
| Author share accrued this month; next payout total | CX `ledger` author share (70% of net) | |
| Revenue per active reader and per paying reader | CX `ledger` ÷ the 13.8 counts | |

## Gaps and proposals

1. **Country.** No reader's country is stored today. Proposal: record the store country on the reader's Convex record when Pro or a rental is bought (Sprints 12–13), since pricing needs it anyway. Until then, readers per country use PostHog's location lookup, which is approximate and stays out of Convex.
2. **The website has no PostHog.** The invite funnel's first step is logged by the website to Convex (`inviteOpens`, Sprint 11), not to PostHog.
3. **MRR movement needs history.** `subscriptions` must keep each RevenueCat change, not only the latest state, or new/churned/plan-change can't be computed (Sprint 12).
4. **"Opened a book" must be countable per day** (see "Active reader").
