# Flipbook v2 — Test strategy

Source: the "Testing" tab of the Flipbook v2 Build Plan (12 Nov 2026).

Spend testing where a bug costs trust or money: spoilers, access and payments get exhaustive automated tests, the reader gets real-device testing, and everything else gets a thin layer.

## Test layers

| Layer | Tool | Covers | Target |
| --- | --- | --- | --- |
| Backend | convex-test with Vitest | Every query and mutation in access, entitlements, margin, chat, notifications | 100% of access, spoiler and money functions; about 70% of the rest |
| Logic | Jest | Position maths, chapter + %, band, region and Pro pricing, rental end dates, currency formatting | Every function with a branch |
| Components | React Native Testing Library | Each design-system component in three themes; states; accessibility labels | Every component |
| Journeys | Maestro, on emulators and devices | The eight journeys below | All green before each release |
| Device | Manual checklist | Reader, margin, offline, voice notes, live audio | Every build touching them |
| Performance | Sentry traces and Android profiler on the reference device | Cold start under 3 s, instant page turns, live reactions under 0.5 s | Each release |
| Accessibility | Lint rules plus manual VoiceOver and TalkBack | Reader and live room especially; 200% text | Each release |
| Load | A script of simulated readers on the preview deployment | 200 members reacting and chatting in one community | Before Release A and C |
| Migration | Backfill run on a production copy | v1 clubs, books, highlights, reactions, progress | Counts match before going live |

## The spoiler invariant suite

These run on every pull request and block merging when they fail. Each is written as "reader at Chapter 4, content in Chapter 9".

1. The margin query never returns a reaction beyond the reader's furthest paragraph, in any community, from any author.
2. The ahead hint returns a chapter and a level only: no names, text or counts.
3. A reply to a paragraph ahead sends a veiled push, and its link opens nothing until the reader gets there.
4. A chat message from a reader ahead is veiled for me and unveils once I pass the sender's chapter.
5. A hand-marked spoiler stays veiled until I reveal it.
6. A quote card for a paragraph ahead is veiled; tapping it does not open the paragraph.
7. Scrubber markers stop at the furthest paragraph.
8. The furthest paragraph never moves backwards; a page only counts after a few seconds on screen, and a jump of more than a chapter counts only if the reader says yes to "Count this as read?".
9. A session covering Chapter 10 warns a reader in Chapter 6 before joining.
10. Activity items behind a paragraph ahead are veiled.
11. Reactions on one edition never appear on another.

## Money and access cases

Run in store sandbox, and replay every store and Paystack webhook twice to prove nothing doubles.

| Case | Expected |
| --- | --- |
| Purchase confirmed in the app before the webhook | Book opens; the late webhook changes nothing |
| Webhook arrives twice | One entitlement, one ledger row |
| Rental reaches its end date, online and offline | Locked at the end time; place, highlights and reactions return on "Read again" |
| Pro member rents a Band B book | Pro price, 6 weeks |
| Book changes band during a rental | Reader keeps the price paid |
| Gift to someone who owns the book | Warned before paying |
| Refund | Access removed; ledger reversed |
| Book taken down | Credit issued; community stays open with a banner |
| Founding Host Pro ends | Lapsed-host state; members keep reading |
| Free member joins a fourth community | Cap explained before it is hit |
| Teen opens an adult community link | Blocked kindly; catalogue filtered |
| Deleted account | Reactions show "Former reader"; Pro cancellation warning shown |
| Pro lapses mid-book | Paid rentals keep their full 6 weeks; included classics and Specials lock with progress kept; one notice lists what changed |
| I block someone | Neither sees the other's reactions, messages or voice notes; no mentions, invites or takeover requests; they aren't notified |
| A host blocks a member | Member removed from that community |
| A message contains a listed word | Shows "Hidden by filter" to others, normal to the sender, and lands in the ops queue |
| Date-of-birth correction | Younger lane applies at once; teen to adult refused until verification is recorded; a second request is refused |
| Non-admin calls an ops function | Refused; every admin action writes one audit row |
| Rental paid on useflipbook.com | Appears on Shelf in the app within seconds; a duplicate Paystack webhook changes nothing |
| Nigerian card used abroad on the web | Charged the Home (naira) price |
| Same book, same region, app and web | Same price |
| Store rules check before each submission | No link, button, copy or embedded browser in the app points to web payment |
| Book without world rights | No rent button outside its licensed regions, in the app or on the web |

## Device matrix and journeys

v1's reader regressions were missed by both the simulator and backend tests, so device testing is mandatory.

| Device | Why | Used for |
| --- | --- | --- |
| Mid-range Android, 3–4 GB RAM | The reference device | Every reader build; performance budgets |
| Low-end Android, 2–3 GB RAM | The floor | Smoke test each release |
| Older small iPhone | Smallest screen, oldest supported iOS | Layout and performance |
| Recent iPhone | Main iOS path | Every build |
| An iPad or Android tablet | Phone layout must not break | Smoke test only |

Run every journey online, offline and on throttled 3G.

**Eight end-to-end journeys (Maestro):**

1. Invited to read: link, sign-up, age check, Lobby, free chapter
2. Find a book: Home, book page, preview, get it, reading
3. Read together: react, reply, return from a notification
4. Host a room: Pro, start, set the book, invite
5. Give a book: gift, recipient opens it
6. Go Pro: prompt, plans, store, unlock
7. v1 user upgrades: clubs, books and reactions intact
8. Read offline: download, airplane mode, resume, sync on reconnect

**Before each release:** two to three weeks of closed beta (TestFlight and a Play closed track) with Founding Hosts.
