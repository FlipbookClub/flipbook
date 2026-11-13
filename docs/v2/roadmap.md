# Flipbook v2 — Sprint roadmap

Source: the Flipbook v2 Build Plan (12 Nov 2026). Two-week sprints. **Build only the current sprint's spec in `docs/v2/specs/`.** This file is for context: what comes next, so nothing is built ahead of its sprint and nothing is built in a way the next sprint has to undo. If a spec and this file disagree, the spec wins; flag it.

Three releases: **A** (the room, Pro and classics; after Sprint 16), **B** (the library; after Sprint 18), **C** (live sessions; after Sprint 20). Story numbers refer to `docs/v2/prd.md`.

| Sprint | Goal | Stories | Exit gate |
| --- | --- | --- | --- |
| 0 | Foundations you can build on safely | Repo audit, ADRs accepted, environments, CI, Sentry, PostHog, feature flags, a final v1 build with a minimum-version gate, analytics event plan | A v2 development build installs beside v1 on both platforms |
| 1 | The design system runs on a phone | Tokens to theme (Light, Flip, Dark × Glass), Manrope, Literata, Hugeicons, 12 core components, tab shell, Android blur spike | Components match the handoff in all three themes on the reference Android |
| 2 | Books can enter the system | 14.1 ingest (permanent paragraph IDs, chapter map, reading time, language, age rating), edition model, bands, covers, encrypted storage, 20 public-domain titles loaded | Any EPUB in, a clean edition out, in one command |
| 3 | Open a book and read it | 4.1 download and offline, 4.2 resume on any device, 4.3 display sheet, 4.4 contents and scrubber | Reader passes the device checklist |
| 4 | The reader is finished | 4.5 highlights (port v1), 4.6 finish moment, 2.4 preview mode, the 5.2 reading rule | Cold start under 3 s and instant page turns on the reference Android |
| 5 | Read together, spoiler-safe | Spoiler engine (ADR 003), 5.1 react and comment, 5.2 reveal, 5.3 ahead hint, 5.8 report, 5.9 block and word filter | Spoiler invariant suite green |
| 6 | The margin feels alive | Activity table and push plumbing (ADR 011), 5.4 live arrival, 5.5 threads and reply alerts, 5.6 margin switcher, 5.7 author badge | Live reactions under 0.5 s on 4G |
| 7 | Communities | 6.1 Lobby, 6.2 create, 6.3 set the book with edition lock, 6.4 invite and QR, 6.5 host tools, 6.6 cap, 6.9 v1 upload kept behind Pro | A host can run a room end to end |
| 8 | Chat | 7.1 text, replies, mentions, 7.2 veils, 7.4 quote cards, 7.5 moderation, 7.6 notification settings | No spoiler leaks in chat or push |
| 9 | Founders' console: ops | `web/` site with founders-only sign-in and audit log (ADR 013); 13.4 report and filter queue, 13.7 ingest status and publish, 13.1 bands, 13.5 Founding Host grants, 13.6 date-of-birth corrections | Every 13.x action here works and is logged |
| 10 | Voice notes and onboarding | 7.3 voice notes; 1.1 invite flow surviving the store, 1.2 sign-up, 1.3 age check, 1.4 v1 migration and what's new | Link to Lobby in three screens; v1 data intact after a rehearsed migration (needs a staging deployment — see `environments.md`) |
| 11 | Web front door I | On the same site: 15.1 book page, 15.2 invite page (join, no payment yet), 15.4 web sign-in, 15.6 open in the app; app and universal links | Invite link to web page to install to the community, on both platforms |
| 12 | Pro | RevenueCat, 9.1–9.5, 6.7 lapsed host and takeover, 6.8 Founding Host, 6.10 leave | Subscribe, unlock and lapse in store sandbox on both platforms |
| 13 | Find and get a book | 2.1 Home, 2.2 book page, 2.3 search, 2.5 bands and regional store prices; 3.1 confirm and buy, 3.2 Pro pricing, 3.4 Shelf, 3.5 expiry | Tap to reading under 45 s in sandbox |
| 14 | Notifications and You | 10.1 reminders, 10.2 Activity screen, 11.1 profile, 11.2 settings (blocked people, help, date-of-birth request, delete account) | Every push opens something real |
| 15 | Founders' dashboard | 13.8 overview, 13.9 growth, 13.10 retention cohorts, 13.11 Pro, 13.12 revenue and money owed; daily rollups (ADR 014), targets, naira/USD toggle, filters, CSV export | Every tile matches a hand count on development data |
| 16 | **Release A** hardening | Accessibility (200% text, screen reader in reader), Light and Dark sweep, every loading, empty, error and offline state, store review prep, closed beta | Beta crash-free sessions above 99.5%; store approval |
| 17 | Web front door II | 15.5 Paystack checkout with webhooks writing entitlements, region by card country, 15.2 join and rent, 15.3 web gifts and claim, 15.7 library page | A web rental appears on Shelf within seconds; duplicate webhooks change nothing |
| 18 | **Release B**: the library | Bands B and C, 3.3 failure, 3.6 takedown with 13.2, credits and refunds with 13.3, 3.7 gifting in the app, Specials shelf, 10.3 rhythm, 11.3 history | Licensed titles loaded |
| 19 | Live sessions I | LiveKit rooms (ADR 009), 8.1 schedule, 8.2 RSVP, 8.3 behind warning, 8.4 join, background audio | A 30-minute room holds on throttled 3G |
| 20 | **Release C**: live sessions II | 8.5 host controls, 8.6 summary and recording, 8.7 teen lane | Moderation runbook in place |
| Later | After C | 4.7 audio narration, re-ingest ID mapping, dashboard P1 views (13.13–13.16), Epic 12 course communities, tablet and foldable layouts, Classic style if it returns, Band D | Each starts from its own spec |

## Spikes (throwaway branches, answers go into an ADR)

| Sprint | Question |
| --- | --- |
| 1 | Does frosted glass hold 60 fps on the reference Android? If not, a solid frosted fallback on Android |
| 1 | Do Hugeicons render cleanly at 20 and 24 px? |
| 2 | Can ingest tag paragraphs in a 600-page EPUB and open it fast on a mid-range Android? |
| 3 | Can epub.js do a two-page spread with margin reactions beside paragraphs? |
| 10 | Does an invite survive installing from the store, on both platforms? |
| 12 | Do rental, gift and Pro purchases complete end to end in store sandbox, in naira? |
| 19 | Does a 30-person audio room hold on throttled 3G, in the background? |
