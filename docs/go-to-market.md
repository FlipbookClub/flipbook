# Flipbook — Go-to-Market & Launch Plan (v2)

**Owner:** Moks + Ayodeji
**Status:** v2.1, August 15 2026

> **Reality-check addendum (Aug 15, 2026).** One month into the 90-day window, actuals vs. plan:
> - **Real beta base: 163 users/downloads/signups — 88 Android, 75 iOS.** Android is the majority platform (the roadmap and build plan now reflect this — see `execution-prd-next-batch.md`). The larger waitlist figures assumed in § 3 and § 9 predate this count; **re-baseline all waitlist/user targets at the next Sunday review** against real numbers rather than the July projections.
> - **Masobe App has launched** (single-publisher subscription reading, ₦1,999–₦5,999/mo, physical-paperback ordering). Market validation + supply-side urgency lever. See § 2 wedge below and `product-vision.md` § 4 competitive narrative. Collaboration-first, compete-if-declined.
> - **Flagship beta user identified:** Oyinadé Balógun (Lumee Book Club) — most engaged tester, active feedback loop, founding-partner treatment. First design-partner candidate for the v2 catalog beta.
> - The week-by-week plan in § 7 (written Jul 15) is partially elapsed; treat the remaining weeks as directional and re-baseline dates at the Sunday review. The Oct 13 launch target stands until explicitly moved.
**Companion docs:** `product-vision.md` v2.0, `prd.md` v2.0, `product-roadmap.md` v2.0, `model-math.md`, `docs/supply/*`, `landing-page-copy.md`.
**Window covered:** July 15 → October 13, 2026 (90-day supply + build + public-launch sprint) plus the first 30 days post-cutover.
**North-star outcome by October 13:** first paying reader on v2, 30 signed indie authors, 500+ public-domain titles ingested, 5,000+ pre-launch waitlist converted at 30%+, and a coordinated public launch across X, Instagram, LinkedIn, WhatsApp, and the founding-author network.

---

## 0. How to read this doc

This replaces the v1 pre-launch campaign in full. v1's positioning (*"share a book, see friends' reactions in the margins"*) was built around user-uploaded PDFs and free creator publishing — both retired in v2. The v2 story is different: a **curated rental library** with community, priced for the Nigerian reader, paying African indie authors 70/30, with a campus surface as a bounded extension.

The plan is built around what a two-cofounder team can sustain: Moks on product, catalog editorial, and frontend build; Ayodeji on supply-side pitching, small-publisher relationships, campus expansion, and operational ownership of the founding-30 cohort.

Sections 1-6 are strategy (read once, refer back). Section 7 is the week-by-week you'll live in. Sections 8-14 are playbooks. Section 15 is this-week's punch list.

---

## 1. The frame — three tracks, one launch

v2 GTM has three tracks running in parallel:

1. **Reader acquisition (Moks).** Ride on the v1 community app's existing waitlist and beta clubs. Convert them into v2 rental readers. Build-in-public content becomes the primary demand engine. Zero paid spend.
2. **Supply-side outreach (Ayodeji, lead).** The founding-30 African indie authors + first small-publisher deals. This is the whole game — without books, v2 doesn't ship. Playbook lives in `docs/supply/`.
3. **Campus pilot (Ayodeji, supporting Moks's parents).** Two university course communities live before public launch. Silent — no marketing yet. Signal-testing.

**Why this shape:** Reader acquisition is the demand story we can tell today. Supply-side is the story we can only tell after we've signed authors. Campus is the story we only tell after we've proven the extension holds without breaking the North Star. The three converge at public launch (~October 13).

---

## 2. Positioning

### One-liner

**Flipbook is a book-rental app for African readers — a curated library of world classics and African indie voices, rented affordably and read together.**

Use this everywhere: X bio, IG bio, LinkedIn page, App Store description, landing-page H2, WhatsApp pitch to friends.

### Shorter variants

- **App Store one-liner:** *"The library African readers deserve."*
- **TikTok / Reels caption:** *"Rent your next book for ₦1,500. Read it with your friends."*
- **LinkedIn / press:** *"Flipbook is a licensed rental library for African readers, paying indie authors 70% of every rental."*
- **WhatsApp pitch:** *"I built an app where you can rent Nigerian and classic books for ₦500-₦2,500 for four weeks. Come read with me."*

### Three messaging pillars

| Pillar | What it claims | Proof points | Where it lives |
|---|---|---|---|
| **Books at prices that make sense** | Rentals from ₦500-₦2,500, matched to Nigerian discretionary spend | Rental band structure; unlimited Band A on Pro; PD classics always free with Pro | Landing page, X, Instagram, WhatsApp |
| **A community around every book** | Rent a book, join the community reading it, see reactions bloom in the margins | Real-time in-margin reactions; friend-clubs; live progress visibility | TikTok, Reels — visual demos; landing page hero |
| **Authors get paid what they're worth** | 70% of every rental to the author; monthly statements; on-time payouts | Author term sheet public; founding-30 cohort real names visible; monthly payout log (aggregate) | LinkedIn, X threads, author communities |

### Wedge vs. competitors

- **vs. Amazon Kindle:** *"Kindle prices in dollars and its Nigerian catalog is thin. We price in naira and lead with African voices."*
- **vs. Okada Books / Selar:** *"They sell books one-by-one. We rent and read together — a different economic and social product."*
- **vs. Goodreads:** *"Goodreads is for the books you've finished. Flipbook is for the book you're reading right now."*
- **vs. Fable:** *"Fable centers celebrity book clubs. We center friend-clubs and African authors."*
- **vs. WhatsApp + piracy PDFs (the real competitor):** *"Same friends, same book, but the book is licensed, the author is paid, and the reader has a proper EPUB experience with reactions in the margins."*
- **vs. Masobe App (added Aug 15):** *"Masobe App is one publisher's bookshelf. Flipbook is the library — every publisher, every indie voice, rentals from ₦500, and the community layer no storefront has."* (Externally, stay gracious: they validated the market. The sharp version is for internal positioning and publisher pitches, not public sniping.)

---

## 3. Goals & KPIs for the 90-day sprint

| Metric | 30-day (Aug 15) | 60-day (Sep 15) | 90-day (Oct 13) | How we measure |
|---|---|---|---|---|
| **Signed indie authors** | 8-10 | 20-25 | 30 | `authorAccounts` table + spreadsheet |
| **Small-publisher meetings** | 2 | 5 | 8 | Ayodeji's tracker |
| **PD titles ingested** | 100 | 300 | 500+ | Convex catalog count |
| **Indie titles published** | 3 | 12 | 25+ | Catalog count where source == indie_author |
| **v2 waitlist (net new + carried over)** | 5,500 | 7,000 | 8,000 | `waitlist` count |
| **v1 → v2 waitlist conversion (day of launch)** | — | — | 30%+ (~2,400) | `users` created within 48h of launch |
| **Course communities live (founding-educator)** | 2 (parents) | 3-5 | 5-8 | `communities` where type == course |
| **First paying reader** | — | — | Oct 13 | first `rentals` row with `paymentSource: "paystack"` |
| **Build-in-public posts shipped** | 24 (3/wk × 8) | 48 (avg 6/wk) | 72 (avg 8/wk) | Buffer / manual log |
| **Waitlist → active-reader conversion (Oct)** | — | — | 30%+ | app analytics |
| **Pro conversion (first 7 days post-launch)** | — | — | 3-5% | RevenueCat |

The **single number** to fixate on: **signed indie authors.** Everything else is a proxy for this. If we're at 12 by day 30, we push harder; if we're at 25 by day 60, we're on track; if we're at 30 by day 90, launch is real. Below 20 by day 90 is a launch-slip signal.

### Quality bars

- A **signed indie author** means term-sheet executed and at least one book uploaded — not just a verbal yes.
- A **small-publisher meeting** means a real 30-min conversation with someone who can green-light a deal (not just interest from an acquiring editor).
- A **PD title ingested** means EPUB uploaded, cover set, description written, band assigned, `isPublished: true` — not just imported metadata.

---

## 4. Audience segments (v2)

Three primary segments, each with a distinct hook.

### Segment A — Nigerian readers 20-40 (primary, 70% of effort)

**Who they are.** Ada from `product-vision.md`. Lagos, Ibadan, Abuja, Port Harcourt, and diaspora. Buys books faster than she finishes them. Watches BookTok. Spends ₦2,900/mo on Netflix, ₦900/mo on Spotify.

**Hook.** *"Rent your next book for the price of a coffee. Read it with your friends."*

**Where to reach them.** Instagram (Bookstagram Nigeria, book creators, lifestyle accounts), WhatsApp (via warm groups), X / Twitter (Nigerian tech + book-adjacent), TikTok BookTok Nigeria, Substack.

**What converts them.** (1) A catalog page they recognize — Nigerian names, not just Western classics. (2) A price that doesn't require justification. (3) A friend already using it.

### Segment B — African indie authors (supply-side primary, 20% of effort)

**Who they are.** Ifeoma from `product-vision.md`. Publishing on Okada, Selar, KDP. Earns pennies on KU. Wants a real economics.

**Hook.** *"70% of every rental. Non-exclusive. First 30 authors get founding-cohort placement."*

**Where to reach them.** Direct DMs (X, Instagram, LinkedIn), warm intros via existing indie networks, Okada Books author profiles, Substack Africa.

**What converts them.** The term sheet reads like a founder wrote it (which it does — see `docs/supply/author-term-sheet.md`). The rev-share beats their current channel by an order of magnitude. Founding-30 status feels real.

### Segment C — Diaspora readers (secondary, 5% of effort at launch)

**Who they are.** Chidi from `product-vision.md`. Nigerian in London/NYC/Toronto. Reads Kindle for the US catalog, misses Nigerian voices. Willing to pay in USD.

**Hook.** *"The Nigerian catalog Kindle doesn't have. On your phone, wherever you are."*

**Where to reach them.** Nigerian diaspora Facebook groups, WhatsApp diaspora chats, Twitter Nigerian-abroad hashtags, LinkedIn (diaspora professionals).

**What converts them.** Availability of specific Nigerian titles they've been trying to get. Ability to pay in USD (deferred to Year 2; interim: gift-a-Pro-sub campaign for USD-paying diaspora giving to Nigerian friends).

### Segment D — University educators (campus surface, 5% of effort at launch)

**Who they are.** Femi from `product-vision.md`. University lecturers who want to distribute course materials and reading lists to their students.

**Hook.** *"The reading space for your course. Bring your class. We handle the reading. Google Classroom handles the rest."*

**Where to reach them.** Warm intros only (never cold). Founding-educator cohort starts with Moks's parents; each new lecturer is warm-introduced by an existing one. Zero public campus marketing pre-launch.

**What converts them.** A functioning demo of Moks's parents' courses. A 15-minute call. A promise that we will never build LMS features.

---

## 5. Channel strategy — two cofounders, ~50-60 hours/week combined

The channel plan is split between the two cofounders by aptitude.

### Moks — Product-adjacent, content-heavy channels (~30 hrs/wk between build, editorial, and marketing)

**X / Twitter — build-in-public.** Design decisions, catalog choices, product screenshots, author announcements. 1 thoughtful post/day Mon-Fri, 1 deep thread/week.

**Instagram / Threads — visual brand.** Book covers, three-mode theme showcases, Nigerian indie author features. 3 IG posts/wk (1 carousel, 1 reel, 1 aesthetic post), 1 Threads post/day.

**LinkedIn — founder narrative.** Long-form essays about the pivot, the model math, and building consumer subscription in Nigeria. 2 posts/wk.

**TikTok / Reels *(stretch)*.** Cross-post Reels. Only invest more if Reels perform above baseline in first 6 weeks.

### Ayodeji — Relationship-heavy channels (~20-25 hrs/wk between supply outreach, campus, ops)

**Direct outreach — the founding-30 pitches.** Structured per `docs/supply/target-list.md`. Weekly cadence: 5-10 new pitches out, 5-10 follow-ups, 3-5 signing calls.

**Small-publisher relationships.** Cassava Republic, Farafina, Ouida, Masobe, NLP, Parrésia. Warm-intro-first, in-person when possible (Lagos-based advantage). Meeting cadence: 1-2 publisher meetings per week.

**Campus expansion.** Moks's parents onboarded first (founding pilot). Ayodeji owns the operational relationship — helping them run their courses, gathering feedback, capturing the *"and here's another lecturer who'd try it"* referrals.

**WhatsApp — network activation.** Announcements to warm groups; recruiting the first 100 beta v2 readers from existing friend + family networks.

### Weekly time budget summary

| Owner | Channel | Hours/wk |
|---|---|---|
| **Moks** | X build-in-public | 5 |
| Moks | IG / Threads | 4 |
| Moks | LinkedIn | 2 |
| Moks | TikTok *(stretch)* | 2 |
| Moks | Product build | 12-15 |
| Moks | Catalog editorial | 3-5 |
| **Ayodeji** | Founding-30 outreach | 8-10 |
| Ayodeji | Publisher meetings | 4-6 |
| Ayodeji | Campus pilot ops | 3-4 |
| Ayodeji | WhatsApp / warm networks | 2 |
| Ayodeji | Author ops (statements, payouts prep) | 3-4 |

Total: ~50-60 hrs/wk across both cofounders combined, part-time around day jobs.

---

## 6. Content pillars

Five pillars, rotating.

1. **The catalog** (40%) — every new title published gets a post. Cover, one-line hook, band price, "rent now" link. Anchors reader-facing marketing.
2. **The build** (25%) — build-in-public. Design decisions, technical wins, honest failures. Signals founder trust and product craft.
3. **The economics** (15%) — author rev-share transparency, monthly aggregate author payout numbers (after the first month), model math snapshots. Signals fairness and seriousness.
4. **Author stories** (15%) — founding-30 authors in their own words: why they signed, what they're reading, what they're writing next. Human, warm, share-driven.
5. **Reading culture** (5%) — Bookstagram-style aesthetic posts. Reading nooks. Coffee-and-a-book. Light lift, brand oxygen.

---

## 7. The 90 days — week by week

Working backward from October 13 (public launch, first paying reader). Compressed for the two-cofounder team.

### Weeks 1-2 (Jul 15 - Jul 28) — Foundation & first pitches

**Moks:**
- Schema migration (v1 → v2) in Convex — TASK-122–124.
- EPUB reader library decision + prototype — TASK-125.
- Ingest first 50 PD titles from Standard Ebooks — TASK-128 (partial).
- Ship 2-3 build-in-public posts about the pivot.

**Ayodeji:**
- Verify contact vectors for target list entries #1-10 (`docs/supply/target-list.md`).
- Set up `moks@getflipbook.com` and `ayodeji@getflipbook.com`.
- Set up Cal.com booking link.
- Send first 8-12 pitch emails: entries #3, #4, #5 (publishers) + #9, #10, #17, #18 (indie authors).
- Onboard Moks's parents as founding-educator cohort — first course communities set up manually.

**Sunday review (Jul 28):** how many pitches sent, how many replies, catalog count, migration status.

### Weeks 3-4 (Jul 29 - Aug 11) — Ingestion & sign-ups

**Moks:**
- Catalog browse UI + book detail — TASK-129, TASK-130.
- Search + filter — TASK-131.
- Continue PD ingestion — 200 titles by Aug 11.
- Ship 4-6 build-in-public posts.

**Ayodeji:**
- Follow up on Week 1-2 sends.
- Send next 10-12 pitches (entries #11-22).
- First 3-5 signing calls with authors who said yes.
- First publisher meeting (target: Ouida, Masobe, or NLP).
- Start Okada Books author discovery for entries #21-30.

**Sunday review (Aug 11):** signed authors count (target: 8-10), catalog count (target: 200+ PD + 3+ indie).

### Weeks 5-6 (Aug 12 - Aug 25) — Rentals + Pro

**Moks:**
- Rentals mutation + expiry cron — TASK-132, TASK-133.
- Watermarking — TASK-134.
- RevenueCat integration + Pro upgrade screen — TASK-138, TASK-139.
- Pro entitlement webhook — TASK-140.
- Ship 6-8 build-in-public posts.

**Ayodeji:**
- Second publisher meeting.
- Author onboarding starts (as authors sign, they upload books via the new author flow — TASK-157–159).
- Follow-up sweep on Week 3-4 pitches.
- 10-15 new pitches to Okada-sourced romance/spec-fic authors.

**Sunday review (Aug 25):** signed authors (target: 15-20), Pro flow demo-able internally, first rental happy path end-to-end.

### Weeks 7-8 (Aug 26 - Sep 8) — Audio + Payment rails

**Moks:**
- TTS ingestion pipeline (OpenAI) — TASK-148, TASK-149.
- Audio playback UI in reader — TASK-151.
- Paystack Standard integration + webhook — TASK-181, TASK-182.
- Ship 6-8 build-in-public posts (including first audio demo — huge visual moment).

**Ayodeji:**
- Third publisher meeting.
- Continue signing to reach 25+ authors.
- Verify author payout vectors (Paystack Recipient Codes for NGN authors; Wise IDs for USD).
- Ramp campus pilot — 3-5 additional lecturers targeted via warm intros from Moks's parents.

**Sunday review (Sep 8):** signed authors (target: 25+), Paystack sandbox verified, audio playing end-to-end in dev.

### Weeks 9-10 (Sep 9 - Sep 22) — Author ops + Course communities

**Moks:**
- Editorial review admin surface — TASK-160.
- Monthly royalty statement cron + email — TASK-162, TASK-163.
- Payout initiation (Paystack Transfers) — TASK-164.
- Rebill / dunning logic — TASK-183.
- Course community creation + roster invite — TASK-171–174.
- Reading list mode — TASK-175.
- Ship 6-8 build-in-public posts.

**Ayodeji:**
- Signing sprint — push to 30 authors.
- Statement dry-run against synthetic data with 5 test authors — TASK-170.
- 4-5 course communities live.

**Sunday review (Sep 22):** 30 signed authors, statement dry-run clean, publisher deal pipeline at 3+ live conversations.

### Weeks 11-12 (Sep 23 - Oct 6) — Polish + Launch prep

**Moks:**
- Age gate + minor-safe defaults if not already shipped — TASK-108–113.
- Watermark verification on real EPUB — TASK-198.
- App Store + Play Store v2 submission — TASK-193.
- Landing page rewrite deployed — TASK-194 (uses `docs/landing-page-copy.md` v2).
- Bug bash across happy paths.

**Ayodeji:**
- Waitlist reactivation email — announce v2 opening on Oct 13; ask for share.
- Founding-30 author launch coordination — each author gets a launch pack (cover graphics, X/IG copy, launch-day plan).
- Press email drafts — Brittle Paper, Olongo Africa, Isele, Doek!, Aké Festival.

**Sunday review (Oct 6):** all P0 FRs green; App Store approved; 15+ indie titles published; waitlist reactivated.

### Week 13 (Oct 7 - Oct 13) — Launch week

Day-by-day playbook in § 11 below.

---

## 8. Build-in-public playbook (v2)

The v2 story is fundamentally different from v1's story — you're now building a **company** (with a catalog, a payment system, a payout obligation to real authors) rather than just a **community app**. Adjust the voice accordingly:

- **v1 tone:** designer's Twitter, personal, intimate, "I'm building this for me."
- **v2 tone:** founder's Twitter, still personal, but with real stakes — real authors depending on real payouts, real catalog choices with real editorial consequences, real Nigerian consumer subscription math. Grown up without being formal.

### Post templates (reusable)

**Template A — Today I shipped:**
> Today: [screenshot of a real screen or a diff].
>
> Why it matters: [one sentence tying the change to a reader or an author's experience].
>
> Next: [one specific next].

**Template B — Design decision:**
> A choice I made this week: [decision — e.g., 4-week rentals, 15% Pro discount, tiered bands].
>
> The three options I considered: [A / B / C].
>
> Why I went with [X]: [one paragraph — usually reader-first or author-first reasoning].

**Template C — Author story:**
> Meet [Author]. She [one line about her work]. Her book *[Title]* opens in the Flipbook catalog on [date]. She's a founding-30 author.
>
> Why she signed: [one line quote or paraphrase].
>
> Rent her book on Flipbook for [₦ band] and 70% goes to her.

**Template D — Model math snapshot:**
> Numbers from this week:
> — [N] signed authors
> — [N] PD titles ingested
> — [N] on the waitlist
> — [N] course communities live
> — [$] estimated month-12 monthly contribution at current curve
>
> Full math: [link to public model math summary — later, when we're ready].

### Cadence

Both cofounders should be visible in the build-in-public thread — different voices, complementary angles. Moks posts product + design + build. Ayodeji posts publisher meetings + author signings + campus stories.

---

## 9. Landing page & waitlist (v2)

The landing page rewrite is a dedicated deliverable — see `docs/landing-page-copy.md` v2.

### High-level structure

- **Hero:** *"The library African readers deserve. Rent smart. Read together."* + one-tap waitlist join.
- **Below the fold:** three pillars (access / community / author economics), Nigerian indie catalog preview, founding-author names, brand-native Flip-mode visual.
- **Founder section:** two-cofounder note.
- **FAQ:** rentals, pricing, catalog, when the beta opens, how authors are paid.
- **Footer:** links to X, IG, LinkedIn, hello@getflipbook.com.

### Stack (unchanged from v1 landing)

Single-file HTML + Tailwind, hosted on Vercel, form wired to the existing Convex `/waitlist` endpoint. Domain: getflipbook.com.

### Waitlist mechanics

- Existing v1 waitlist carries over. New v2 waitlist signups are appended to the same `waitlist` table (same audience field).
- Confirmation email (send via existing `internal.email.sendWelcomeEmail`) is rewritten to v2 voice: *"You're on the list. When we open in October, you'll be among the first."*
- **v2 launch-day email:** sent to the full waitlist on Oct 13, 9am Lagos. Invite + first-book recommendation from the founding-30 catalog.

---

## 10. The supply community — the founding-30 authors + first small publishers

The most important non-build work in the 90 days. Detailed playbook in `docs/supply/`:

- `docs/supply/target-list.md` — 30+ named authors and small publishers with contact vectors, warmth signals, and hooks.
- `docs/supply/author-pitch-email.md` — 150-word pitch email + subject-line variants + follow-up cadence.
- `docs/supply/author-term-sheet.md` — one-page plain-English term sheet.

**Ayodeji owns.** Weekly progress reviewed at the Sunday cadence.

### The founding-30 promise (public + to authors)

- First 30 authors featured in launch marketing.
- Guaranteed placement in launch shelf.
- Band review at every subscriber milestone (500 Pro, 2,000 Pro, 10,000 Pro).
- Consider offering an **80/20 founding-cohort split for the first 6 months** (case-by-case in signing negotiation — see term sheet internal notes).

---

## 11. Launch week (Oct 7 - Oct 13) — day by day

| Day | Owner | Channels | What goes out |
|---|---|---|---|
| **Mon Oct 7** | Moks + Ayodeji | X, IG, LinkedIn, Threads | Teaser: *"Something we've been building for the last 90 days opens next Monday."* + a screenshot of the catalog. |
| **Tue Oct 8** | Moks | X, IG Reel | Behind-the-scenes: 60s Reel of the pivot journey — the old app, the new catalog, a founding author's book being uploaded. |
| **Wed Oct 9** | Ayodeji | LinkedIn, X | Founding-author feature post — first 3 authors named with covers. |
| **Thu Oct 10** | Moks | Instagram, TikTok | The 15-second audio-reader demo — a chapter narrated in Flip mode. Visually striking. |
| **Fri Oct 11** | Ayodeji | Warm networks | WhatsApp broadcast to the founding-partner clubs + first 100 warm-network readers: *"Beta opens Monday 9am Lagos."* |
| **Sat Oct 12** | Both | Quiet | Rest day. Final QA. |
| **Sun Oct 13** | Both | All channels + waitlist email + press | **v2 launch.** |

### Launch day (Oct 13) — hour by hour (Lagos time)

- **6am** — final smoke test of the happy path with cofounders' accounts on live keys.
- **8am** — waitlist launch email sent (full waitlist ~8k).
- **9am** — founding-30 authors receive their launch pack + a personal thank-you message from Moks + Ayodeji.
- **10am** — first public X post: *"Flipbook v2 is live. Rent your first book from ₦500."* + landing-page link + one-line pitch.
- **11am** — Instagram post + Reel (audio demo).
- **12pm (Lagos) / 1pm (Cairo) / 8am (New York)** — LinkedIn long-form post from Moks + Ayodeji, framed as "what we spent 90 days building."
- **2pm** — Threads post + TikTok upload.
- **3pm** — press sends to Brittle Paper, Olongo Africa, Isele Magazine, Doek! Magazine, Aké Festival network.
- **6pm** — pinned tweet: aggregate launch-day numbers (waitlist opens, first rentals, first Pro subs).
- **9pm** — a short evening reflection from Moks — *"Day 1 done. Here's what we saw."*

### Launch-week press list

- **African literary outlets:** Brittle Paper, Olongo Africa, Africa in Dialogue, Isele Magazine, Doek! Magazine, Bakwa Magazine.
- **Nigerian tech press:** TechCabal, Benjamindada.com, Techpoint Africa.
- **Bookstagram + BookTok:** the amplifier list from `docs/supply/target-list.md` Tier 3.

Send one short email each. 3 sentences. Link to landing page. No press release.

---

## 12. First 30 days post-launch

**Goals:**

- **First paying reader by day 1** (Oct 13).
- **First author payout by Nov 15** (first monthly statement for October rentals).
- **20+ rentals by day 3.**
- **200+ active users by day 30.**
- **10+ Pro subscribers by day 30.**
- **5+ course communities live by day 30.**
- **Public author-payout headline moment** — post the aggregate first-month payout amount at day 45 (once we're through the first monthly cycle).

### Content shift

Pre-launch was mostly promise ("here's what we're building"). Post-launch is proof ("here's what happened").

- **Daily** — one specific number, one specific delight (a real reader reaction quote with permission, a real author message).
- **Weekly Sunday** — a retrospective post: what worked, what didn't, what shipped, what's next.
- **Monthly** — aggregate numbers post: rentals, active users, Pro subs, author payouts.

---

## 13. Metrics dashboard & sanity checks

Track weekly in a Notion or Airtable page. Reviewed at the Sunday cadence.

| Metric | Weeks 1-4 | Weeks 5-8 | Weeks 9-12 | Post-launch |
|---|---|---|---|---|
| Signed indie authors | 5-10 | 15-20 | 25-30 | 30 → 40+ |
| Publisher meetings | 1-2 | 3-4 | 5-8 | 8+ |
| PD titles ingested | 50-100 | 200-300 | 400-500 | 500-1000 |
| Indie titles published | 0-3 | 5-12 | 20-25+ | 25 → 60+ |
| Waitlist total | 5,200 | 6,000 | 7,500 | 8,000+ |
| Active users | — | — | — | 200+ by day 30 |
| Pro conversion | — | — | — | 3-5% by day 30 |
| First paying reader | — | — | Oct 13 | ✅ |

### Sanity checks

- **If signed indie authors < 15 by day 45** — supply pitch or terms are wrong. Emergency review of `docs/supply/`. Consider a 90/10 or 80/20 founding-cohort split as a short-term unlock.
- **If PD titles ingested < 200 by day 30** — ingestion pipeline is broken or too manual. Refactor.
- **If waitlist growth stalls before day 60** — landing page is not landing. A/B a new hero or add a specific catalog title as social proof.
- **If Pro conversion < 2% by day 30 post-launch** — Pro benefits aren't visible enough. Ship the audio-reader promo more aggressively.

---

## 14. Budget

Same discipline as v1 — under $100/mo for the first year, growing only as revenue justifies.

| Line | Cost | Notes |
|---|---|---|
| Domain | ~₦1,500/mo | Namecheap or similar |
| Vercel (landing) | $0-20/mo | Free tier probably enough |
| Convex Pro | ~$25/mo | Bumping from free tier for real usage |
| Buttondown OR Resend | $0-10/mo | Author statement emails + waitlist |
| Cal.com | $0-15/mo | Author + lecturer booking |
| Sentry free tier | $0 | Error tracking |
| Canva Pro *(optional)* | $12/mo | Social + author launch packs |
| CapCut Pro *(optional)* | Free | Video for TikTok/Reels |
| Buffer *(optional)* | $6/mo | Scheduling |
| **Fixed subtotal** | **~$50-90/mo** | |
| OpenAI TTS ingestion | ~$6/book × ingestion rate | Real spend at ingestion cadence |
| ElevenLabs (Specials) | ~$50/book | 5 titles at launch = ~$250 one-time |
| Paystack fees | 1.5% of rentals | Cost-of-revenue |
| Wise / PayPal fees | ~1-2% of USD payouts | Cost-of-payout |

Total Year-1 fixed run rate: ~$50-100/mo. Content ingestion + payment fees scale with revenue.

---

## 15. Risks & mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Founding-30 cohort under-fills (< 20 signed by day 60) | High — catalog is thin at launch | Medium | Over-pitch (35-40 targets); consider 80/20 bonus for founding cohort |
| Paystack payment failure rate > 20% | Medium — kills first-week conversion | Medium | Rebill logic prioritized in Phase 16 (TASK-183) |
| NGN depreciates 15%+ between now and launch | Medium — USD cost lines compress margin | High (structural) | Model FX conservatively; ready to raise Pro prices if NGN falls > 20% |
| App Store or Play Store rejection | High — blocks launch date | Low-medium | Submit 3 weeks early; use existing v1 approval as reference |
| Cofounder unavailability during launch week | High | Low | Confirm both cofounders are Lagos-based and available Oct 7-14; no travel |
| Catalog copyright challenge (author dispute or publisher C&D) | Medium | Low | Non-exclusive terms + 30-day pullout right + DMCA takedown ready |
| Two-cofounder capacity exhaustion | High | Medium | Ruthless scope; explicit "if we only ship one thing this week" prioritization |
| Waitlist conversion < 15% at launch | Medium — hits day-1 numbers | Low-medium | Landing page A/B; personal reactivation from Ayodeji to top-100 warm signups |

---

## 16. This-week punch list (Jul 15-21)

Written to be actioned on Monday morning by both cofounders.

**Moks:**
- [ ] Ship schema migration (TASK-122–124) to staging.
- [ ] EPUB reader library decision (TASK-125) — evaluate 3 options, pick one by Friday.
- [ ] Ingest first 25 PD titles from Standard Ebooks manually.
- [ ] Ship 3 build-in-public posts about the pivot.
- [ ] Publish updated landing page copy (`docs/landing-page-copy.md` v2 → live at getflipbook.com).

**Ayodeji:**
- [ ] Set up `moks@getflipbook.com` and `ayodeji@getflipbook.com`.
- [ ] Set up Cal.com booking link.
- [ ] Verify contact vectors for target list entries #1-10.
- [ ] Send first 8-12 pitch emails.
- [ ] Onboard Moks's parents' two course communities (do it in the v1 UI if v2 course type isn't shipped yet — use `type: "private"` as a temporary shim; migrate to `type: "course"` when Phase 15 ships).
- [ ] Draft the v2 waitlist reactivation email (send in Week 11).

**Both, Sunday evening (Jul 20):**
- [ ] 45-min review: what shipped, what's blocked, next week's punch list.

---

## Appendix A — Cross-references

- Product context: `product-vision.md` v2.0, `prd.md` v2.0.
- Build sequence: `product-roadmap.md` v2.0.
- Model math: `model-math.md`, `flipbook-model.xlsx`.
- Supply playbooks: `docs/supply/author-pitch-email.md`, `docs/supply/author-term-sheet.md`, `docs/supply/target-list.md`.
- Marketing site copy: `landing-page-copy.md` v2.

## Appendix B — Note on the two-cofounder structure

The plan above assumes both cofounders are available part-time (~50-60 hrs/wk combined) through the 90 days. If Ayodeji is unavailable for a week (day job, family, illness), the supply-side pitching slows but the build continues — Moks holds the product line, and Ayodeji catches up on return. Similarly if Moks is unavailable, supply-side and campus ops continue via Ayodeji while build pauses. **This resilience is the primary reason the two-cofounder split de-risks the plan** compared to a solo-founder equivalent.

---

**End of GTM v2.0.** Update the version header and the numbers in § 3 as the campaign runs.
