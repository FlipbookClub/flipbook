# Flipbook v2 — Reader App PRD

Design handoff · draft 4 · Oct 2, 2026 · Owner: @Victory Moks

## 1. The product

Flipbook is where you read together. You open a book and your friends are already in it: their reactions sit in the margin beside the paragraph that provoked them, revealed only once you reach it.

Around the book is a community: a Lobby showing everyone's progress, a chat for the banter, and live sessions to talk it through. v2 adds a library. Readers find, rent and gift books in the app, subscribe to Pro, and listen as well as read. The room is the product; the library feeds it.

**The feeling we're designing for:** you finish a chapter and it feels like you just talked about it with someone you like.

## 2. Who we're designing for

The Host and the Invitee carry the growth loop; design for them first.

| Persona | Who they are | What they're trying to do |
| --- | --- | --- |
| **The Host** | Runs a book club; the acquisition engine. Hosting requires Pro. | Get everyone on the same book and keep the conversation going without chasing people. |
| **The Invitee** | Arrived via a friend's link. Has never heard of Flipbook. | Be inside the community and reading in under a minute. |
| **The Browser** | Found the app alone. Reads regularly and is price-aware. | Find something worth reading tonight and trust it's worth the money. |
| **The Regular (Pro)** | Reads several books a month and listens on the commute. | Feel the library is open, and never hit a wall mid-book. |
| **Lecturer** (secondary) | Assigns reading to a class. | Get students reading the set text. Nothing more. |

## 3. Design principles

When two screens disagree, the earlier principle wins.

1. **The margin is the product.** Every surface — Lobby, chat, sessions — exists to get people into a shared book and leads back to it.
2. **Spoilers are sacred.** Nothing about a passage appears before the reader reaches it: margins, chat, voice notes, sessions, notifications, previews.
3. **Reading first, chrome second.** Inside a book, the interface steps out of the way.
4. **Warm, not loud.** No leaderboards, star ratings as primary UI, infinite feeds, shame or exclamation marks. Never show who hasn't paid or rank who is behind.
5. **Daily return, not session length.** Bring people back to their book, never back to the app for its own sake.
6. **Built for real conditions.** Mid-range Android, patchy 4G, offline in traffic, expensive data. Voice and live audio respect the data plan.
7. **One brand, three rooms.** Every screen is designed in Light, Flip and Dark. Flip — indigo ground, ivory text — is the signature.

## 4. App structure

Four tabs plus two full-screen spaces; "Continue reading" is always one tap away — from launch and from every community tab.

| Area | What lives there |
| --- | --- |
| **Home** | Discover: editorial shelves, friends reading, Specials. |
| **Shelf** | My books: reading, finished, expired, gifts. |
| **Communities** | My rooms. Each has three tabs: **Lobby** (default — current book, every member with soft progress markers, next session, pinned message), **Chat**, **Sessions**. |
| **You** | Profile, Pro, reading rhythm, settings, notifications. |
| **Reader** | Full-screen, outside the tabs. |
| **Live room** | Full-screen; minimises to a persistent bar. |

## 5. Core journeys

Journey 1 is the most important in the app: it is how every new reader arrives.

1. **Invited to read.** Link → community preview → sign up → age check → Lobby → start chapter one free → first reactions seen → get my copy at the chapter's end or from the Lobby.
2. **Find a book.** Home → book page → preview → get it → reading in seconds.
3. **Read together.** Open book → margin reveals as you read → react or reply → chat about the chapter → a notification brings you back to the paragraph.
4. **Host a room.** Go Pro → start a community → set the book → share to WhatsApp → watch the Lobby fill → schedule a session.
5. **Give a book.** Book page → gift a copy → choose a friend → they get a note and open it in one tap.
6. **Go Pro.** Hit a moment of value → compare plans → store purchase → immediate unlock.

## 6. User stories

Design order is locked: Epic 4 → 5 → 6 → 7 → 1 → 8, then the rest. P0 = launch; P1 = soon after. Bullets under each story are its acceptance criteria.

### Epic 1 — Arrive and onboard

**1.1 · P0 · Invitee** — As someone invited by a friend, I go from the link to reading the community's book in one flow.

- Before any form: who invited me, community name, book cover, how many are reading.
- Three screens or fewer from link to Lobby, sign-up included.
- From the Lobby I start the free first chapter, or open it if Pro includes it.
- Handles: app installed or not (context survives the store), expired link, closed community, teen invited to an adult community.

**1.2 · P0 · Browser** — I sign up with Apple, Google or phone and say what I like to read.

- Display name and 3 genres required; avatar optional.

**1.3 · P0 · All** — I'm asked my date of birth neutrally, and the app adapts without making me feel policed.

- Adults: normal. Teens (13–17): invited communities only, no stranger contact, filtered catalogue. Under-13: a kind stop screen.
- The answer can't be changed afterwards.

**1.4 · P0 · v1 user** — Everything I had is where I left it, and I'm shown once what's new.

- Clubs, books, highlights, reactions and progress intact. Up to 3 skippable "what's new" cards.

### Epic 2 — Discover

**2.1 · P0 · Browser** — Home shows a few curated shelves.

- Continue reading · Friends are reading · New this week · Specials · Classics · In your genres. Sideways scroll; no endless feed.
- Handles: brand-new user, offline (cached shelves with a banner).

**2.2 · P0 · Browser** — The book page tells me whether it's for me and who I'd read it with.

- Cover, author, description, genres, length as reading time, price or access state.
- "Ada and 2 others are reading this" only when true.
- Main action by state: Preview · Get it ₦X · Read (with Pro) · Continue · Read again · Not available.
- Secondary: Start a community around this book (Pro) · Gift a copy.

**2.3 · P0 · Browser** — I search by title, author or genre, then filter and sort.

- Filters: genre, price, classics vs new voices. Sort: newest, popular this month, A–Z.
- Handles: no results (near matches), offline (search my Shelf only).

**2.4 · P0 · All** — I read the first chapter free before committing.

- Opens in the real reader, marked as a preview. At its end, getting the book is one tap and continues where I stopped.
- P0 because the invitee journey depends on it.

### Epic 3 — Get the book

**3.1 · P0 · Browser** — Getting a book takes seconds and never feels like a checkout.

- Under 45 seconds from tap to reading for a returning user; the book opens straight after confirming, no receipt screen.
- **Payment route undecided (§8).** Design the confirmation sheet and hand-off now; keep the payment step at wireframe in two variants: native store sheet, or web hand-off and return.

**3.2 · P0 · Regular** — As a Pro member, classics and Specials just open, labelled "Included with Pro".

- Other books show 15% off with the original price struck through.

**3.3 · P1 · Browser** — If payment fails, I get a calm way to try again.

- "Your bank didn't approve this one." Another method or retry; my place is kept. Uses `Feedback/Error-surface` with an icon.

**3.4 · P0 · All** — Shelf shows everything I'm reading.

- Cover, progress (chapter + %), time left, download state, quick open. Sections: Reading · Finished · Expired.
- Labels: "Club copy" for v1 uploads, "Gift from Ada" for gifts.

**3.5 · P0 · All** — I get a heads-up before a rental ends and an easy way to keep going.

- Notice 48 hours before expiry. Expired books stay on Shelf with "Read again"; progress, highlights and reactions return.
- Pro rentals last 6 weeks; show it rather than make people work it out.

**3.6 · P0 · All** — If a book is taken down, I'm told plainly and given a credit.

- The community stays open with a banner explaining why.

**3.7 · P0 · All** — I can gift a copy to a specific friend, at full price.

- Choose a friend from my communities or send a gift link.
- They get a warm note — "Ada got you a copy of *Stay With Me*" — and open it in one tap.
- If they already have it, I'm told before paying. Sent confirmation for me; "Gift from Ada" on their Shelf.
- Shares 3.1's payment dependency.

### Epic 4 — Read

**4.1 · P0** — Books open fast and work without signal.

- Download starts automatically, with state visible. Handles: offline open, interrupted download, low storage.

**4.2 · P0** — I resume at the exact spot, on any device.

- Position always shows as chapter + %; page numbers never appear in social UI.

**4.3 · P0** — I make the page mine from one light sheet.

- Font size (5 steps); typeface **Literata** (default) or **Manrope**; theme Light, Flip or Dark. Live preview, remembered.
- Tokens: `Reader/Page`, `Reader/Text`, `Reader/Text-secondary`.

**4.4 · P0** — I move around with contents, chapter jumps and a scrubber.

- The scrubber never shows reaction markers beyond my furthest point.

**4.5 · P1** — Private highlights in 5 colours: Sand, Aqua, Rose, Mint, Lavender (`Highlight/*`), at parity with v1.

**4.6 · P0** — Finishing a book feels like something.

- A quiet finish moment (an animated moment).
- With a community: who else has finished, the whole-book conversation unlocked, the next session.
- Then what to read next.

**4.7 · P0 · Regular** — As a Pro member, I switch between reading and listening.

- Play/pause, chapter skip, 15-second skip, speed; a mini-player outside the reader.
- States: audio on its way, unavailable, author chose text only. Non-Pro: a tasteful Pro prompt.
- If Pro lapses mid-book, audio stops at the next chapter with a kind message.

### Epic 5 — Read together (the margin)

**5.1 · P0** — I react to a paragraph without leaving the page.

- Long-press → 6 curated emoji or a comment of up to 200 characters.
- Anchored to that paragraph, in the same place for everyone at any font size or device. Sending is an animated moment.

**5.2 · P0** — I only see reactions to text I've already read.

- They reveal as I reach each paragraph. Markers: `Margin/Reaction` (others), `Margin/Own` (mine).

**5.3 · P0** — I sense there's life ahead without being told anything.

- "The room is busy in Chapter 6" (`Margin/Ahead`). No content, names or plot-revealing counts.

**5.4 · P0** — New reactions arrive live and gently.

- Soft arrival; respects reduced motion; never moves the text.

**5.5 · P0** — I reply to a reaction and know when someone replies to mine.

- Replies one level deep, inline (`Margin/Thread`). A reply notification opens the paragraph only once I've reached it.

**5.6 · P0** — In two communities on the same book, I choose whose margin I see.

- Remembered per book. Reading solo shows a gentle "Read this with someone".

**5.7 · P1** — The author's reactions carry a small badge (`Badge/Author`).

**5.8 · P0** — I can report a reaction.

- Removed: "This comment was removed". Deleted users: "Former reader".

### Epic 6 — Communities

**6.1 · P0 · All** — The Lobby is the room's front door.

- Current book with my Continue reading; every member's position as soft markers, never ranked (`Progress/Track`, `Progress/Fill`).
- Members who haven't started show "Not started", never "hasn't bought". Next session and pinned message.
- Handles: a community of just the host; between books ("The next book is coming").

**6.2 · P0 · Host (Pro)** — I start a community in under a minute.

- Name, optional description, visibility, first book. Free users tapping Start get a Pro moment that leads with what hosting gives.

**6.3 · P0 · Host (Pro)** — I set the room's book from the catalogue.

- Edition locked for the whole read; the book page shows it.
- Members are notified "Get your copy". Each reader gets their own; Pro covers classics and Specials.
- Legacy communities also see silent upload (6.9).

**6.4 · P0 · Host** — Inviting is one tap to WhatsApp.

- Native share sheet with a rich preview (cover, community name). Code or QR for in-person clubs.

**6.5 · P0 · Host (Pro)** — Host tools.

- Set the next book, schedule sessions, pin messages, rename, remove or mute members, close, add co-hosts.

**6.6 · P0 · Free member** — I can be in up to 3 communities; Pro removes the cap. The limit is explained before I hit it.

**6.7 · P0 · Member** — If my host's Pro lapses, nothing I do breaks.

- Reading, reacting, chat and sessions continue. A quiet note says the host can set the next book with Pro.
- Any Pro member can ask to take over: host approves, or auto-approved after 14 days of host inactivity.

**6.8 · P0 · Founding Host** — As a v1 host, I'm thanked properly.

- 2 months of Pro free from first opening v2, with a welcome moment explaining why.
- Permanent Founding Host badge (`Badge/Founding-host-*`) on my profile, in the Lobby and in the margin.
- Reminders 7 days and 1 day before it ends, saying exactly what changes and that members keep reading.

**6.9 · P1 · Legacy host (silent)** — I can still upload a PDF or EPUB as the next book.

- Only from Set next book in v1 communities; never promoted; Pro-gated. Members read it as "Club copy".

**6.10 · P1** — Members can leave and keep their book, highlights and progress.

- Hosting passes to a co-host or the earliest member.

### Epic 7 — Community chat

**7.1 · P0** — Chronological chat with text and voice notes.

- Replies, emoji reactions on messages, @mentions.
- No images, GIFs, video or files; links show as plain text with no previews.

**7.2 · P0** — I never get spoiled in chat.

- Every message carries the sender's position, e.g. "Ada · Ch 7".
- Messages and voice notes from members ahead of me arrive veiled (`Overlay/Veil`): "Ada is in Chapter 9. Tap to reveal."
- Senders can also mark a message as a spoiler by hand. Veils lift once I catch up.

**7.3 · P0** — Voice notes work on a real data plan.

- Hold to record, up to 2 minutes; review, re-record or cancel before sending.
- Waveform, playback at 1× / 1.5× / 2×, offline once downloaded. Recording is an animated moment.

**7.4 · P0** — I share a passage from the book into chat as a quote card.

- Tapping it opens that paragraph if I've reached it; otherwise the card is veiled.

**7.5 · P0 · Host** — Hosts keep chat healthy.

- Pin one message (e.g. "This week: up to Chapter 8", or an in-person meetup), delete messages, mute members. Anyone can report a message.

**7.6 · P0** — Chat doesn't flood my phone.

- Notifications default to mentions and replies; per community: all, mentions or off.
- Unread chat shows as a quiet dot, never a count badge.

### Epic 8 — Live sessions

**8.1 · P0 · Host (Pro)** — I schedule an in-app session.

- Title, time, how far into the book it covers, co-hosts. It appears in Sessions, the Lobby and as a chat card.

**8.2 · P0** — I RSVP and get reminded.

- Reminders 24 hours and 15 minutes before; add to my calendar.
- If I'm behind the point it covers, the card tells me kindly how far to read.

**8.3 · P0** — Before joining, I'm warned if I'm behind.

- "This session covers up to Chapter 10. You're in Chapter 6." — Join anyway or Keep reading.

**8.4 · P0** — Joining is one tap.

- Stage with hosts and speakers (speaking indicator, `Status/Live`) and the audience.
- Raise hand, emoji reactions, live text chat. Audio-only, low-bandwidth.
- Keeps playing in the background or minimised to a bar. Going live is an animated moment.

**8.5 · P0 · Host** — I run the room.

- Invite to speak, move back to the audience, mute, remove, end for everyone. Hosting passes to a co-host if I drop.

**8.6 · P1** — When a session ends, a summary card goes to chat: who came, how long it ran, the next session.

- Recording is **off by default**. If a host turns it on: everyone is told before joining; `Status/Recording` with a "REC" label stays on screen; speakers are asked again when invited up; only members can play it.

**8.7 · P0 · Teen lane** — Teens join chat and sessions only in communities they were invited into.

### Epic 9 — Pro

**9.1 · P0** — I meet Pro where it helps, not through nagging.

- At Specials, audio, an included classic, starting a community, the community cap. One entry in You; nothing on launch.

**9.2 · P0** — I compare Monthly, Quarterly and Annual (effective monthly price shown) and subscribe through the store.

- Benefits: hosting, included classics and Specials, audio, 15% off, longer rentals, no community cap.
- Unlocks instantly with a warm welcome that names what I can now do.

**9.3 · P0** — I see my plan, renewal date and a manage-in-store link. A calm banner shows during a failed-renewal grace period.

**9.4 · P0** — Specials feel like a members' shelf; Free readers see "Included with Pro".

### Epic 10 — Rhythm and notifications

**10.1 · P0** — Reminders are about my book, e.g. "Ada left a note in Chapter 5, where you're headed next."

- Every type can be switched off. Banned: guilt, fake urgency, pushes with nothing to read behind them.

**10.2 · P0** — One place shows what happened while I was away: replies, sessions, new members, expiring rentals, gifts.

- Every item deep-links to the right place; spoiler rules apply.

**10.3 · P0** — I see my reading rhythm: days read this week and an optional personal goal.

- Private by default, never compared with anyone. A missed day is never framed as failure.

### Epic 11 — You

**11.1 · P0** — Profile: name, avatar, bio, favourite genres, badges. No follower counts.

**11.2 · P0** — Settings: reading defaults, notifications, theme, privacy, delete account.

- Deletion is honest about what stays: anonymous reading records; reactions shown as "Former reader".

**11.3 · P1** — Reading history of finished books, each with "Read again".

### Epic 12 — Course communities (P1 · Lecturer)

**12.1** — I create a course (institution, course code, term dates) and invite the class by pasting emails.

**12.2** — I set a reading list (required or optional) students open in one tap, and share PDFs after confirming I hold the rights.

**12.3** — I see class progress only as totals ("18 of 32 are on Chapter 3"), never by student.

**12.4** — The course closes to new students at term end. When a lecturer looks for grading, attendance or video: *"Use your classroom tool for that, and Flipbook for the reading."*

## 7. Foundations

Type, icons and colour tokens are fixed; layout, step count and copy are open.

| Area | Rule |
| --- | --- |
| **Type** | Manrope (variable, 200–800) for all UI. Literata is the default reading serif, Manrope the alternative. Naira glyph and Yoruba diacritics verified. |
| **Icons** | Lucide, static set. Animation only where it means something: sending a reaction, a reaction arriving, recording a voice note, going live, finishing a book. lucide-animated is the motion reference; engineering rebuilds natively. Every animated icon has a static fallback; reduced motion respected. |
| **Colour** | Flipbook token set v2: Brand palette plus a semantic layer in Light, Flip and Dark. All text pairs pass WCAG AA; UI elements pass 3:1. Covers reader, highlights, margin, spoiler veil, live and recording, badges, progress, focus ring and skeleton. |
| **Colour rules** | Errors always use their own surface plus an icon, never brand coral alone. Live is green; Recording is red with a "REC" label. Hover tokens are web-only. |
| **States** | Every screen: loading, empty, error and offline, in all three themes. |
| **Accessibility** | WCAG 2.1 AA; tap targets ≥ 44 pt; text scaling to 200%; reduced motion; screen-reader support in the reader and live room; voice notes announce their duration. |
| **Performance** | Design for a mid-range Android on 4G: cold start under 3 s, page turns feel instant, live reactions under half a second. |
| **Copy** | Warm, generous, lightly clever. Never cute. No exclamation marks. Never "platform". Headline and tagline are Sharon's. |
| **Never** | Stock photos of someone reading by a window, AI illustration, avatar grids or star ratings as primary UI, crowded screens. |

## 8. Open decisions

Only the payment route blocks any screen, and the designer can work around it.

| Decision | Blocks | Meanwhile |
| --- | --- | --- |
| How rentals and gifts are paid for (store purchase or web) | Payment step in 3.1 and 3.7 | Wireframe both variants; fully design everything around them |
| Scope of the first release | What ships first | Follow the locked design order |

**Settled:** one locked edition per community read · Pro to create and host, with lapsed hosts breaking nothing for members · Founding Host gets 2 months of Pro and a permanent badge · silent upload kept for legacy hosts behind Pro · every reader rents their own copy, and gifting is in · chat and live sessions in, meetings in-app only, recording off by default · Lobby is the default community tab · ahead-of-you hint and reading rhythm in · Manrope, Literata, Lucide and token set v2 locked.

## 9. Not in this handoff

Author portal, admin and editorial tools, payouts, web reader, under-13 experience, public community discovery, reviews and ratings, recommendations, media in chat.

## 10. Screen inventory

| Area | Screens |
| --- | --- |
| **Onboarding** | Invite landing · sign-up · age check · profile and genres · teen variant · under-13 stop · what's new |
| **Home** | Shelves · Specials · search and results · book page (all states) · preview end |
| **Get the book** | Confirmation · payment step (2 variants) · failure and retry · takedown notice · gift a copy · gift sent · gift received · already-owned |
| **Shelf** | Reading · finished · expired · club copy · gift · empty |
| **Reader** | Reading view · display sheet · contents and scrubber · highlights · margin and reaction composer · thread · ahead-of-you hint · community switcher · audio player and mini-player · finish moment |
| **Community** | Lobby (all states) · create · set the book (edition lock, silent upload) · invite · host tools · lapsed-host state · takeover request |
| **Chat** | Chat view · veiled, spoiler-marked and removed messages · voice recorder and player · quote card · pinned message · notification settings |
| **Sessions** | List · schedule · session card and RSVP · pre-join spoiler warning · live room · host controls · minimised bar · summary · recording consent and indicator |
| **Pro** | Plan picker · welcome and unlock · manage · grace banner · contextual prompts · Founding Host welcome and reminders |
| **You** | Profile and badges · reading rhythm · notifications centre · settings · delete account |
| **Course (P1)** | Create course · roster invite · reading list · class progress |
