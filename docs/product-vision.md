# Product Vision — Flipbook

**Version:** v2.1 (August 15, 2026)
**Companion docs:** `prd.md`, `product-roadmap.md`, `go-to-market.md`, `model-math.md`, `vision.json`, `design-tokens.json`, `synthesis-aug-2026.md`
**Change note:** v2.0 (Jul 15) was the business-model pivot to a licensed rental library with community. v2.1 (Aug 15) implements the growth-ideology revision agreed in `synthesis-aug-2026.md` Theme D — daily-return optimization, habit mechanics permitted (marked "Revised Aug 15" inline) — and adds Masobe App to the competitive narrative.

## 1. Vision & Mission

### Vision Statement

A world where the best books ever written are within reach of every African reader, and where the reading of them is a shared act — where a young person in Lagos, Accra, or Nairobi opens a book on their phone and steps into a room already reading it with them.

### Mission Statement

Flipbook is the reading library African readers deserve. We license and curate a catalog of world classics and African indie voices, rent them at prices matched to local income, and wrap every book in a community — so reading becomes affordable, social, and the most consistent cultural ritual of the week.

### Founder's Why

Moks is a product designer with five years inside healthcare — a domain where every interaction has to earn trust, reduce friction, and respect attention. Those are the same disciplines a reading, payments, and community product needs, and they're mostly missing from the reading apps that exist. Kindle is Western in catalog and USD in pricing. Local ebook platforms are fragmented and thin on curation. Goodreads is a graveyard. Fable is content-feed dressed up as community. None of them feel *made for* a Lagos reader who has ₦3,000 in discretionary spend on a good week.

But the deeper reason Moks is the right person to build this isn't design background — it's proximity. He lives in the market. He is the reader Flipbook is for. He knows what every existing reading app gets wrong because he's abandoned each of them, and he knows what a great book club moment feels like because he's lived inside several. Being based in Lagos is not incidental — it's the structural advantage. He can sign African indie publishers over coffee that no US or UK reading app can reach.

Flipbook is the collision of two things: serious product craft applied to a category that hasn't seen it, and a market that no incumbent is close enough to understand. Five years of healthcare taught him how to ship with restraint. Years of being a reader taught him what restraint should be in service of. This is the app he wished existed, finally being built by someone qualified — and located — to build it well.

### Founding Team

Flipbook is a **two-cofounder company**.

**Moks** (designer-founder) owns product direction, vision, design, frontend build, growth, and hands-on supply-side outreach with individual authors. Five years of product design in healthcare, based in Lagos. Ships alongside AI coding agents (Claude Code) and managed services (Convex, Clerk, RevenueCat) — the tech stack is picked so a designer-led team can move fast without hiring a backend engineer prematurely.

**Ayodeji** (operations cofounder) runs operations and process, and is the team's relationship engine — business development, partnerships, and the pitching that unlocks doors a heads-down designer can't. Former Programs Manager at a gaming company with a deep network, a gift for pitching, and hands-on operational exposure to age-gating, parental controls, and child-safety compliance that directly de-risks the minors-safety work on the roadmap.

The two-cofounder split is deliberate and structural: an introverted product-and-vision founder paired with an extroverted operations-and-network founder. In the v2 (rentals + catalog + community) model, Ayodeji's role is even more strategically valuable than in v1 — small-publisher licensing conversations (Cassava Republic, Farafina, Masobe, etc.) are relationship work, the founding-30 author cohort onboarding and monthly statement/payout operations are ops work, and campus-surface expansion is warm-intro work. All three land on his side of the split. Moks focuses on product, catalog editorial, and frontend velocity.

For planning purposes: assume ~50-60 hours/week combined across both cofounders, part-time around day jobs. That number is real, not aspirational — it's what the model math assumes and the 90-day plan is scoped against.

**Near-term hiring plan.** The team is deliberately capped at two cofounders through Year 1 to preserve unit economics. First hire triggers on either (a) first fund raise, or (b) sustained monthly cash breakeven, whichever comes first — not before. The first hire is likely a backend engineer (to lift Convex and payment-rails build load off Moks) or a community/author-success lead (to scale the founding-cohort operations Ayodeji currently runs). Priority is decided by the bottleneck of the moment.

### Core Values

**Reading should be within reach.** Every product decision has to make books more accessible to the reader Flipbook is built for — pricing, curation, discovery, community. If a decision makes reading feel like a luxury, we reconsider.

**Read alongside, not at each other.** Community exists to make reading more consistent, not to turn reading into a status game against other people. No public leaderboards, no public follower counts, no ranking readers against each other. Personal and club-level progress mechanics (streaks, goals, milestones) are welcome — they compete with your own past, never with your friends.

**Build the daily reading habit.** *(Revised Aug 15, 2026 — supersedes the old "we don't optimize for time-in-app" stance.)* Flipbook optimizes for **daily return, not session length**. The goal is that opening Flipbook and reading becomes a daily ritual. Mechanics that build that habit — reading streaks, contextual nudges, re-engagement emails, progress celebration, gentle reminders — are in-bounds and encouraged. Mechanics that inflate time-in-app without serving reading — infinite scroll, engagement-bait feeds, notification spam — remain out. The test for any growth mechanic: *does this get someone reading today?* If yes, build it. If it only gets them scrolling, don't.

**Conversations are tied to the page, not the timeline.** Reading isn't a feed. The home screen is a place — a library, a club, a nightstand — not an algorithmic stream. We resist infinite scroll the same way we resist all behaviors the user didn't ask for.

**Authors get an economics that matters.** When a reader rents a book, 70% goes to the author. When Kindle Unlimited pays pennies per page read, we pay a real chunk per rental. Author economics is a first-class product value, not a footnote.

**Ship the smallest thing that delivers the magic.** The MVP exists to test whether a reader who opens the app, rents a book, and reads it inside a community experiences the magic. Everything else is later. Healthcare taught us that polish without value is theater; we ship the value first.

**Respect the reader's attention.** *(Revised Aug 15, 2026.)* Every notification serves the reading. Contextual pings are always fair game (someone replied to your reaction; a new book landed in your club; your rental is expiring). Reading reminders are allowed and encouraged — user-controllable, warm-toned, anchored to the actual book they're reading ("Chapter 5 of *Thirteen* is waiting"). What stays banned: shame framing ("you're falling behind"), fake urgency, and notifications with no reading-shaped payload behind them.

### Strategic Pillars

1. **African-indie beachhead, world-catalog compounding.** The opening move is public-domain classics + African indie authors + small African publishers. It's the wedge nobody can contest and the founder can execute on from Lagos. The catalog widens outward from there — never abandoning the beachhead voice.
2. **Rental, not sale.** Every book is a rental, not a purchase. This is a legal and economic choice: it sidesteps the ISBN / consumer-sale apparatus, keeps us close to library-licensing conventions that publishers already understand, and gives readers subscription-shaped intuitions (Spotify, Netflix) they already have.
3. **Community is the retention engine.** Rentals bring readers in; communities keep them. Every reader who rents alongside a friend, a club, or a course community reads more, finishes more, and comes back for the next book. The rental and the community are one product, not two.
4. **Mobile is the only surface that matters at launch.** Reading, community, rentals, checkout — all mobile. The web companion (invite landing pages, creator dashboards) is deferred to Year 2.
5. **Live reactivity is the craft moat.** Reactions in the margin, real-time reading rooms, live chapter drops. Convex handles it natively. Every incumbent would have to rebuild to ship this.
6. **Reading extends. Workflow does not.** Flipbook accepts new content types (course notes, reading lists, indie novellas) and new communities (book clubs, courses, creator drops) freely — as long as the interaction is reading and reacting on the page. Flipbook never builds tools for grading, scheduling, video, or any workflow that could be described as *learning management*.

### Success Looks Like

**By March 2027 (6 months in):** Monthly cash breakeven achieved. ~2,000 active users. 130+ Pro subscribers. Catalog of 800+ titles (200 licensed + 600 public-domain). First ₦100k+ month in author payouts distributed. Two university course communities live. The product is defensibly better than any competitor for the Nigerian reader.

**By September 2027 (12 months in):** ~5,000 active users. ~400 Pro subscribers (8% conversion). Monthly net contribution ₦1.87M (~$1,248) — a livable founder income entirely from the product. Catalog widening from Nigerian indie into Kenyan, Ghanaian, and South African voices. First small publisher deal fully live. Campus surface spreading organically at 2–4 lecturers per new campus. Moks — the person we built this for — has read more in the last six months than in the previous two years.

-----

## 2. User Research

### Primary Persona

**Ada, 27, brand designer in Lagos.** Reads on her commute and before bed. Buys one book a month and finishes maybe every third. Has a WhatsApp group with three friends that used to be a book club and is now mostly memes. Owns a Kindle her cousin brought back from London — mostly reads on the phone now because the Kindle catalog she can afford is thin and Nigerian titles she wants aren't on it. Has a Goodreads account she opens twice a year to remember what she's read.

Tech comfort: high. Spends ₦2,900/mo on Netflix and ₦900/mo on Spotify Premium and considers both essential — subscription is a familiar shape. Uses Notion for personal projects. Follows five Nigerian and diaspora authors on Instagram. Discovered BookTok in 2023 and follows a handful of Nigerian and diaspora book creators. Buys books she keeps meaning to read.

Emotional state around reading: a low-grade ambient guilt overlaid on a real love for it. She *wants* to be the version of herself who finishes books and talks about them with people she likes. She'd happily pay for a well-designed African reading app — but has never seen one. She's used to reading tools that were made for someone in Brooklyn and priced for someone in San Francisco.

What would make her switch: (a) prices that match her local income — ₦500 to ₦2,500 rentals feel right, ₦35,000 hardcovers do not; (b) a catalog that starts with African voices and world classics she recognizes; (c) low-friction onboarding (under two minutes); (d) evidence in the first ten minutes that this app was built by someone who reads what she reads.

### Secondary Personas

**Ifeoma, 34, indie romance author, self-publishes on Okada Books and Amazon KDP.** Sells ~200 books a month across platforms. Her Amazon royalties are $0.005 per page read on Kindle Unlimited — pennies for a full read. She'd sign a 70/30 rev-share with a new platform in a heartbeat if it put her books in front of readers Amazon doesn't show her to. She writes and edits herself; a publisher relationship requires trust in a way a platform relationship doesn't. She's on Twitter and Instagram, moderately active. She has 3,500 followers who buy her books.

**Femi, 51, university lecturer in Comparative Literature, Ibadan.** Teaches two courses a semester. Distributes his lecture notes and required readings today via WhatsApp broadcast to his students — clumsy, no reading progress, no discussion. Discovered Flipbook because his son is friends with the founder. He'd use Flipbook to run a private course community if it took under 20 minutes to set up. He does not want a grade book, an assignment portal, or a video conference tool — those live in the school's Canvas. He wants a *reading space* for his class.

**Chidi, 30, Nigerian in London, diaspora reader.** Reads in USD-priced apps because he's paid in GBP. But every third book he wants to read is a Nigerian author whose UK/US edition doesn't exist yet. He'd pay for a Nigerian reading app that gives him rental access to Nigerian titles. He pays in card USD via Stripe. He'd tell his friends.

**Bibi, 42, editor at a small Lagos publishing house (Cassava Republic archetype).** Runs a catalog of 40 titles across five years. Distribution outside Nigeria is the perpetual bottleneck. She'd license non-exclusive digital rental rights to Flipbook if the split were fair, the DRM were credible, and the reporting were monthly. She's the person who unlocks 10–40 books in a single meeting.

**Guardians and educators running children's book clubs.** Parents, teachers, and librarians running reading clubs for minors. They provision children into specific moderated private clubs, give parental consent, and act as the vetted-adult moderator. Distinct from the university-educator surface because the core job is walled-garden supervision for under-18s.

### Jobs To Be Done

**Functional jobs.** Ada needs to: (1) discover a book she wants that fits her budget, (2) rent and open it in under a minute, (3) find people to read alongside, (4) finish more of what she starts, (5) trust that the money she spends goes to writers she wants to support.

**Emotional jobs.** Ada needs to: (1) feel like reading is affordable, not aspirational, (2) feel like the app was made for her, not translated for her, (3) reduce the guilt of unfinished stacks, (4) belong to a community where reading is celebrated.

**Social jobs.** Ada needs to: (1) be seen as someone who reads thoughtfully by people whose taste she trusts, (2) have things to talk about that aren't work, (3) belong to communities of readers who care about the stories she cares about.

**Author jobs (Ifeoma).** Ifeoma needs to: (1) earn a meaningful chunk per reader, not pennies, (2) build a direct relationship with readers, not compete against an algorithm, (3) not sign her rights away, (4) get paid on time, monthly, in a currency she can actually spend.

### Pain Points

Ranked by severity for the primary persona.

1. **Books she wants cost more than she can spend.** A ₦35,000 hardcover is a week's discretionary spend. Kindle prices in USD and skews Western. Frequency: every book she wants but can't rationalize buying. Severity: **high** — this is the access problem the product solves.
2. **No place to talk about a book *while* reading it.** When Ada hits Chapter 11 of a book she loves and wants to text someone, nobody she knows is reading it. Frequency: every interesting book. Severity: **high** — this is the community magic-moment problem.
3. **The reading apps that exist feel like they were made somewhere else.** Kindle's Nigerian catalog is thin; StoryGraph is beautiful but solo; Fable's recommendations skew celebrity book clubs from LA. Frequency: every time she opens one. Severity: **medium-high** — cultural fit gap is a slow bleed.
4. **Book clubs form on WhatsApp and die by Chapter 3.** The chat's fine for two friends, hopeless at eight. Frequency: every club she's joined. Severity: **medium** — she's resigned to the pattern but mourns it.
5. **Piracy is the local workaround, and it feels bad.** PDFs circulating in WhatsApp groups get the book into her hands but she can't support the authors she loves. Frequency: uncomfortably regular. Severity: **medium** — she wants a way to pay that isn't ₦35k.
6. **When she does buy, she doesn't finish.** Reading alone with a stack of half-finished books produces guilt, not more reading. Frequency: every physical book she owns. Severity: **medium**.

### Current Alternatives & Competitive Landscape

**Amazon Kindle.** The default global e-reader. Massive catalog, USD pricing, weak Nigerian catalog, no community layer. Where it falls short for Ada: prices are aspirational, catalog is Western-first, and there's no one to read *with*. Switching cost: low — most of her Kindle reading is books she'd rent on Flipbook anyway.

**Google Play Books / Kobo.** Same story as Kindle. Global catalogs, USD/EUR pricing, no community. Switching cost: low.

**Everand / Scribd.** Unlimited-subscription reading. Better than Kindle for high-volume readers, still Western-catalog and no community. Switching cost: low.

**Okada Books.** The Nigerian indie ebook platform. Direct sale of individual titles, no rental, no community. Beloved by Nigerian indie authors — the ecosystem we're recruiting from. Not a competitor for Flipbook so much as a complementary platform authors will keep using. Switching cost (for authors): zero, because we're non-exclusive.

**Selar.** Similar to Okada, broader (digital-product marketplace, not just books). Same non-exclusive coexistence.

**Bambooks.** Nigerian audiobook and ebook platform. Closest in market position, but audiobook-first and catalog-thin. Switching cost: low.

**Goodreads (Amazon).** The default reading log. Massive friend graph, 2008 forum UX. Where it falls short: the conversation, if any, lives in dead forums. Not a rental service; not a competitor for the transaction. Switching cost: low — she stopped using it years ago.

**StoryGraph.** Beautiful, indie-run, best-in-class personal tracker. Solo by design. Switching cost (for trackers): medium; loyal StoryGraph users have invested in their stats.

**Fable.** The closest social-reading competitor. Has clubs and in-app reading. Skews content-feed and celebrity-book-club. Where it falls short for Ada: doesn't feel made for her, doesn't have African catalog. Switching cost: low.

**WhatsApp + PDFs (the real competitor).** Same friends, same book, but the book is a piracy PDF and the discussion buries in group chat. Where it falls short: everything, but it's *there*. Switching cost: low if we make onboarding as easy as sending a WhatsApp invite.

**Doing nothing.** The most common alternative. Ada reads alone, abandons books, buys the next one anyway. The bar Flipbook needs to clear is not "better than Amazon" — it's "better than the mixture of habit and resignation she has now."

### Key Assumptions to Validate

1. **Readers will pay ₦500–₦2,500 to rent a book for 4 weeks.** Validate: closed beta rental conversion rate. Target: 30%+ of active users rent a paid book in month 1. If <15%, pricing or catalog fit is wrong.
2. **Pro conversion sits at 5–8% at scale.** Validate: track Pro conversion at 30 / 60 / 90 days into general availability. Target: 5% at day 60, walking to 8% by month 12. If <3% at day 60, Pro value story (audio, Specials, community creation) needs sharpening.
3. **Indie authors will accept 70/30 non-exclusive terms.** Validate: sign 30 founding-cohort authors by mid-August (target from the 90-day plan). If <15 by mid-August, terms or pitch or founder-network reach is wrong.
4. **A curated PD + African-indie catalog is enough to launch.** Validate: closed-beta rental depth. Target: median beta user rents 2+ paid books in month 1, plus 1+ Band A. If <1 paid book median, catalog isn't dense enough.
5. **In-margin reactions dramatically outperform book-level forum discussion.** Validate: in beta, count reactions-per-reading-session in-margin vs. an alt "chapter discussion thread" view. Target: 3x more interactions in-margin.
6. **Nigerian card payments succeed at 88%+ after rebill logic.** Validate: track first-attempt approval and post-rebill effective approval on Paystack. Target: 88%+ effective. If below, invest in dunning + payment engineering earlier.
7. **The audio reader materially moves Pro conversion.** Validate: A/B or before/after — Pro conversion in a cohort exposed to audio vs. a cohort not. Target: audio-exposed cohort converts 1.5–2× the non-exposed. If not, we've built expensive infrastructure for no lift.
8. **The African-indie beachhead pulls readers in — it isn't just a supply story.** Validate: in beta and launch, ask new users "how did you hear about Flipbook?" and "which book made you sign up?" Target: 40%+ cite an African indie title as the reason.
9. **Educators will use the campus feature and it stays reading-shaped.** Validate: onboard the founding-educator cohort (Moks's parents + 3 unrelated professors invited via them). Target: 8+ course communities live by month 6, none using it as an LMS.
10. **The v1 community app's waitlist and beta users convert to v2 rental readers.** Validate: measure conversion of the pre-pivot waitlist and beta clubs into paying v2 users. Target: 30%+ conversion. If <15%, the pivot narrative isn't landing with the existing audience.

### User Journey Map

**Awareness.** Ada sees a Reel from a Nigerian book creator she follows: a 45-second video about renting *Nearly All the Men in Lagos Are Mad* for ₦1,500 on this app called Flipbook, with reactions from friends showing up in the margins as they read. She thinks: that price is real; that catalog is mine. She taps the link.

**Consideration.** Lands on the App Store or Play Store page. Sees: one screenshot of the reading experience with in-margin reactions, one shot of the catalog showing three African covers and two classics, one line — *"Read together. Rent affordably. Talk on the page."* — and a rental price band that makes the pricing legible. She downloads.

**First use (signup → first rental).** Opens the app. Clean welcome, one CTA: "Browse the library." Signs up with Google or phone OTP in 30 seconds. Lands on a Flip-mode catalog view. Sees a shelf: **Nigerian indie**, **World classics**, **Flipbook Specials**. Taps into Damilare Kuku. Sees the ₦1,500 rental price, 4-week duration, one-tap rent. Pays via Paystack. Total time: under 3 minutes.

**Magic moment (first reading session, into first community).** She opens the book inside the reader. Sees a small "3 friends are reading this" badge → taps it → sees an active community. Joins. As she finishes a paragraph she loves, a soft reaction from another reader fades into the margin. She taps to expand. Drops her own reaction. Another reader replies within an hour. *That's the magic moment.* She closes the app smiling.

**Habit formation (weeks 1–4).** She rents her second book — a public-domain title free with a Pro trial the app offered. She upgrades to Pro on the annual tier (₦18,600) after using it two weeks. The audio reader plays her through Chapter 4 during her commute — she's now reading with her ears. She finishes the book, the first she's finished in months. She invites her cousin. Her cousin rents. Ada is now a two-time referrer.

**Advocacy.** Month 2, she posts an Instagram Story unprompted about Flipbook. Two of her friends join. She creates her first community — a private club for four friends reading a new indie release together. Every friend she pulls in is a rental into an author's pocket and one step closer to Flipbook working.

**Friction points at each stage:**
- *First use:* if the catalog opens on Western classics she doesn't recognize instead of African titles, she disengages. Onboarding sequence has to lead with African covers.
- *First rental:* if Paystack fails the first time and there's no recovery, she abandons. Rebill and retry logic must be visible and fast.
- *Magic moment:* if she rents a book and no one is reading it, the moment doesn't fire. Mitigation: for the first 6 months, every seeded title has at least 3 beta users pre-reacting on the first three chapters.
- *Pro upgrade:* if the Pro upsell surfaces before she's had one great reading session, she resists. Timing matters — offer after book completion or after a delightful audio session, not on signup.

-----

## 3. Product Strategy

### Product Principles

1. **The book is the hero.** Book covers, page content, and reader-generated marks (reactions, highlights) are the visual centerpiece. UI chrome stays restrained.
2. **Reading extends. Workflow does not.** Flipbook accepts new reading-shaped surfaces (course communities, creator drops, Specials) freely. It never builds LMS features (grading, attendance, video, scheduling). When users need those, we point them elsewhere.
3. **Curation over recommendation.** The catalog grows by editorial choice, not by algorithm. Every book we add is a book we can explain choosing. Discovery is human.
4. **Progress is visible, never weaponized against you.** Communities show median reading position and where a member sits against it. Streaks and goals celebrate your own consistency; they never rank you publicly against other readers, and missing a day never shames you. No public leaderboards.
5. **The page is the unit of conversation.** Reactions and comments are anchored to a specific paragraph on a specific page. Scrolling backwards scrolls the conversation with you; scrolling forward doesn't spoil what's ahead.
6. **Mobile is sacred.** The reading experience never crosses to web. Web (Year 2) is only invite landing pages, creator dashboards, and shareable previews.
7. **Author economics is a product value.** 70/30 in favor of the author is a first-class feature. Statements are monthly. Payouts are clean.
8. **Every screen earns its existence.** We delete more than we add. If a feature doesn't make the magic more reliable, the rental smoother, or the community more alive, we don't ship it.

### Market Differentiation

Flipbook's bet is that no incumbent is close enough to the market to serve it correctly, and the ones that are close are stuck on the wrong primitive.

**Against global reading apps (Kindle, Kobo, Everand):** we are priced in naira for a reader who lives in Lagos, curated for a taste that starts with African voices, and social where they are solo. A Kindle can't get to any of these without rebuilding.

**Against local ebook platforms (Okada, Selar, Bambooks):** we are a rental library, not a sales storefront — a fundamentally different economic and social product. We're additive to the ecosystem, not competitive: Okada/Selar authors keep those channels; Flipbook expands their addressable market.

**Against reading trackers (Goodreads, StoryGraph):** they log what you've finished; we're built around what you're reading right now, with people who are reading it with you.

**Against Fable:** they built book-club-as-content-feed with celebrity clubs on top. We're building member-led community from friend-clubs first, with the catalog serving them.

**Against Discord + WhatsApp + PDFs (the real competitor):** we make legal what people already do informally, at a price they can rationalize, with a reading experience the piracy version can't match.

The compounding advantage: **community makes the catalog stickier, the catalog makes community denser, and both drive Pro conversion.** Every reader who rents a book they later discuss in a community is a Pro candidate. Every Pro subscriber has better Specials, longer shelves, and audio — deeper reasons to keep the subscription. Every author on the catalog has a real economics reason to send their followers to Flipbook. The graph gets denser. The Pro base compounds. Goodreads can't ship this without rebuilding. Fable would have to gut its feed paradigm. Kindle would have to reinvent itself in Lagos. We start at the right primitive, in the right market.

### Magic Moment Design

**The magic moment (rental era):** A reader in Lagos rents *Nearly All the Men in Lagos Are Mad* for ₦1,500. Her sister in Abuja rents it the same day. They form a two-person community. As each reads Chapter 4, the other's reactions bloom in the margin — a wry ♥ next to the funniest paragraph, a "wait, what?" next to the twist. Two weeks later they've finished the first book they've ever finished together. The author has earned ₦2,100 across the two rentals. Both readers are shopping for what to rent next.

**For this to happen reliably at launch, we need:**

- **Catalog with at least one book two readers both want to read** — the beachhead of African indies + world classics has to be dense enough that any two friends can find a book they both want. Target: 200 titles at launch, 800 by month 6.
- **One-tap rental checkout.** Paystack for NGN, RevenueCat for Pro subscriptions, near-zero friction. Failed transactions must retry gracefully.
- **In-app EPUB reader with in-margin reactions.** Real-time, driven by Convex. When a friend reads Chapter 4 and reacts, your Chapter 4 lights up next time you open it.
- **Community discovery from a book you're renting.** "3 friends are reading this" → tap → join their community. One-tap community joining.
- **Audio reader for Pro.** Neural-TTS pre-generated at ingestion, streamed to Pro subscribers. Enables the commute-reading habit.

**Shortest path from install to magic moment:** ~7 minutes. Install (60s) → sign up (30s) → browse catalog and rent (2 min) → open book (10s) → read Chapter 1 (3 min) → see or drop first reaction (30s).

**Risk:** if a new reader rents a book and there's no active community on it yet, the community half of the magic doesn't fire in session one. **Mitigation:** for the first 6 months, every launch title has 3–5 beta readers pre-reacting on the first 3 chapters, so a first reader always sees reactions in the margin. This is a hand-seeding operation, not an algorithm.

**Supporting moments:**
- **The rental confirmation.** Paying ₦1,500 for a book you've been wanting for months and having it open in the app 8 seconds later is its own small delight. Design the checkout to earn that reaction.
- **The Pro audio moment.** A Pro subscriber presses play on a book's audio narration on their commute, hears a warm neural voice reading the chapter they read yesterday, and the "this is worth ₦2,000/mo" moment fires.
- **The author-message moment.** An author posts a note in their book's community — "hey, thanks for reading this one" — and readers see it, react, feel like they're inside the release, not on a mailing list.

### MVP Definition

The MVP is the smallest product that lets a reader rent a book, read it inside a community, and finish it. In scope, buildable across the 90-day plan alongside the supply-side outreach.

**Authentication.** Clerk-based signup — Apple, Google, phone OTP. Profile: display name, avatar, reading genres.

**Catalog browse and search.** Editorial shelves (Nigerian indie, World classics, Flipbook Specials). Search across title, author, genre. Filter by rental band. Book detail page: cover, description, band, one-tap rent.

**Rental checkout.** Paystack (NGN) for local card payments. One-tap rent. Rental appears on the reader's shelf immediately. Failed payments retry through a rebill flow.

**In-app EPUB reader with offline.** EPUB is the primary format at launch (Standard Ebooks is the PD source). Reader supports offline access — once opened, cached to device. Progress tracked page by page, synced when online.

**Page-keyed reactions and comments.** Long-press a paragraph, drop an emoji or short comment (≤200 chars). Reactions render in the margin next to the paragraph. Real-time via Convex. No spoilers ahead — reactions reveal as you reach the page.

**Communities.** Book clubs formed like WhatsApp groups — invite by link, moderator role, member cap defaults reasonable. Free tier: join up to 3 communities. Pro tier: create and join unlimited.

**Flipbook Pro subscription.** RevenueCat-managed. Three tiers (₦1,550 annual / ₦2,000 quarterly / ₦2,500 monthly). Pro unlocks: unlimited Band A rentals, 15% off B/C/D, Flipbook Specials, audio reader, 6-week shelf on rentals, community creation, unlimited community joins.

**Author onboarding and royalty statements.** Author signup form. Book upload flow (title, cover, EPUB file, band assignment). Monthly per-author statement generation (Convex cron): rental count, gross, 70% share, payout log. Monthly payout via Paystack Transfers (NGN) or Wise/PayPal (USD).

**Course communities (educator surface — v1 minimal).** A course community type with start/end dates. Roster invites via emailed link. Lecturer role with reading-progress-across-class visibility. Reading list mode pointing at catalog books. **Explicitly no** grade book, attendance, or assignment workflows.

**Audio reader (Pro-only).** OpenAI TTS at ingestion for general catalog, ElevenLabs for Specials. Streamed per-chapter to Pro subscribers only. Author opt-out honored per term sheet §4b.

**Push notifications.** Curated: new chapter in a community you're in, reply to your reaction, rental expiring in 48 hours, Pro trial ending. Never engagement-driven ("you haven't read in 3 days").

**Everything else is out.**

### Safety & Age Segmentation (required before public launch)

Flipbook intends to host children's book clubs — minors reading and discussing inside the app. The moment minors are present, onboarding stops being a growth funnel and becomes a **safety and compliance gate**.

**The legal floor** (not legal advice — counsel review required before public/minor launch). Global App Store distribution from a Nigeria base inherits multiple regimes: **US COPPA** (age 13, verifiable parental consent under the FTC amended rule effective April 2026), **UK Children's Code** (under 18, high-privacy defaults, no engagement nudges), **EU** 13–16 consent threshold. Defensible posture is structural containment, not moderation.

**The model.** A neutral date-of-birth gate forks new users into three lanes: under-13, 13–17, 18+. Adults flow through normal onboarding. **Every minor is adult-provisioned into a walled garden**: a vetted guardian/educator places the child into one specific private moderated club, and the child lives inside that boundary — no public discovery, no stranger contact, no open audio, display-name only, high-privacy defaults forced on.

**Sequencing.** The closed beta needs none of this. The 13+ age gate ships before public v2 launch. Under-13 + VPC + children's-club tooling stages behind a kids-safety vendor (KWS / k-ID) and legal review — timed alongside the children's book-club product surface, not before.

### Explicitly Out of Scope

**Big-5 / major publisher licensing.** Tempting because it's the world catalog. Why deferred: those deals require distribution numbers and legal infrastructure we don't have. **Reconsider:** Year 2, at 10,000+ Pro subscribers.

**Web reading experience.** Tempting because desktop reading is a real habit. Why deferred: 100% of MVP magic is mobile. Doubles engineering surface for marginal MVP benefit. **Reconsider:** Year 2.

**User-uploaded PDFs (from v1).** Tempting because it lowers supply-side friction. Why deferred: exactly the piracy exposure we redesigned the model to avoid. **Reconsider:** never as an open surface. Course communities allow lecturer PDF uploads for private, rights-certified educational use only.

**Public ratings and reviews.** Tempting because every reading app has them. Why deferred: ratings are the Goodreads paradigm we're rejecting. The conversation is the value, not the score. **Reconsider:** never, unless data shows explicit user demand — and even then, private.

**Public follower graph.** Tempting because it's standard social. Why deferred: communities are the social unit; a followers graph creates parallel loops that compete. **Reconsider:** Phase 3+, only if research shows a genuine gap.

**Algorithmic recommendation engine.** Tempting because scale. Why deferred: violates the curation principle. Discovery in MVP and Year 1 is human — active communities, editorial shelves. **Reconsider:** Year 2 if organic discovery caps growth.

**LMS-shaped features on the campus surface.** Quizzes, tests, grade books, attendance, video conferencing, calendars, deadlines, assignment submissions, certificates. **Never.** These live in Google Classroom, Canvas, or Moodle. When a lecturer asks for them, the answer is "great, use [X] for that, use Flipbook for the reading."

**Institutional (university-level) enterprise sales.** Tempting when the campus surface has traction. Why deferred: enterprise sales is a whole different motion that will suck oxygen from the consumer product. **Reconsider:** Year 2, once 20+ lecturers use the free campus tier organically.

**Human-narrated audiobooks.** Tempting because audio is a huge market. Why deferred: audiobook rights are a separate license class from text rights, and studio-recorded audio at scale is a business we haven't proven we can run. Neural TTS gives us 80% of the value at 5% of the cost. **Reconsider:** Year 2+, only after proven Pro demand for a premium audio tier.

**Ads or sponsored placements.** Tempting because scale. Why deferred: violates the "no algorithm" and "no engagement surface" principles. Publisher-sponsored placement in Specials would need to be labeled as such and would compete with editorial trust. **Reconsider:** never in the consumer app; possibly in a Year-2 B2B model.

### Feature Priority (MoSCoW)

**Must Have (P0 — MVP launch, September 2026):**

- Authentication (Clerk: Apple, Google, phone OTP)
- Profile and reading genres
- Catalog browse, search, filter, book detail
- Rental checkout (Paystack NGN)
- In-app EPUB reader with offline
- Page-by-page progress tracking
- Page-keyed reactions and short comments
- Communities (join, create if Pro, invite by link, moderator role)
- Push notifications (chapter drops, reaction replies, rental expiring)
- Flipbook Pro subscription (RevenueCat, three tiers)
- Pro discounts and unlimited Band A
- Audio reader (Pro-only, neural TTS pre-generated at ingestion)
- Author onboarding, book upload flow (band-assigned)
- Author monthly royalty statements + payouts (Paystack Transfers NGN + Wise/PayPal USD)
- Editorial shelves and Flipbook Specials

**Should Have (P1 — MVP launch if time permits, otherwise immediately post-launch):**

- 13+/18+ age gate — required before opening beyond closed beta
- Streamlined adult onboarding — display-name only, first-community matchmaking
- Highlight (text selection) + reaction
- Reactions reveal animation as user reaches the page
- Author badge in a community for the book's author
- Native share sheet for community invites
- Course communities (educator surface v1) — bounded dates, roster invite, lecturer role
- Reading-list mode (a community points at N titles from the catalog as required reading)
- Rebill / dunning logic for failed Nigerian card charges

**Could Have (P2 — Phase 2 or later):**

- Stripe (USD checkout for diaspora readers)
- Live review sessions (fast-follow — clubs schedule and hold real-time audio sessions)
- Children's book clubs + under-13 support (staged behind VPC vendor and legal review)
- Web companion (invite landing pages, author dashboards)
- System-theme auto-switching (mapping OS dark mode to Flip or Dark)
- Reading customization (more themes, more fonts)
- Private reader stats (books finished, pages read — no public rank)
- Reading goals (private, gentle)
- Diaspora / non-Nigerian market expansion
- Small publisher onboarding (Tier 3 in the supply plan)

**Won't Have (this product cycle):**

- Public book ratings or reviews
- Public follower graph
- Human-narrated audiobooks
- Algorithmic recommendation engine
- LMS features of any kind
- Big-5 licensed catalog
- Institutional enterprise sales motion
- Comments threading deeper than 1 level

### Core User Flows

**Flow 1: Reader browses the catalog and rents a book.**

Trigger: user opens the app for the first time or returns to look for a new book.

Steps: Home / catalog view → editorial shelves (Nigerian indie, Classics, Specials) → tap into a title → book detail page (cover, description, band price, "3 friends are reading this" if applicable) → tap "Rent" → Paystack checkout (saved card if returning) → confirmation → book appears on shelf, opens to page 1.

Outcome: reader has a rented book on their shelf, ready to read. Under 3 minutes for a first-time user; under 45 seconds for a returning user with a saved card.

Success criteria: 30%+ of active users rent at least one paid book in month 1; median 2+ paid rentals in month 1.

**Flow 2: Reader has the in-margin magic moment.**

Trigger: user is reading a rented book where 1+ other readers are also reading.

Steps: reader reads a paragraph → reaches a paragraph with pre-existing reactions → reactions render in margin → user taps to expand → sees the comments → drops their own → another reader replies in real time.

Outcome: reader experiences the social-reading moment. They feel they're inside the book with others.

Success criteria: 70% of active readers leave at least one reaction in their first session; 50% receive a reply within 24 hours.

**Flow 3: Author onboards and gets their first rental royalty.**

Trigger: an African indie author signs the term sheet.

Steps: author receives signup link → creates account → uploads EPUB, cover, title/description/band → editorial reviews and publishes → the book appears on the catalog → readers rent it → at end of month, a statement email is sent → payout is initiated via Paystack Transfers or Wise → author receives money.

Outcome: author has been paid on time, in a currency they can spend. Trust is built.

Success criteria: 100% of statement emails delivered by the 15th of the following month. 0% missed payouts. 3+ founding-cohort authors act as public testimonials by month 6.

**Flow 4: Lecturer runs a course community.**

Trigger: a lecturer wants to distribute course materials to their class.

Steps: lecturer signs up (free) → creates a course community with start/end dates → uploads course materials (private PDF, rights-certified) OR points at catalog titles as a reading list → invites roster by pasting student emails → students receive invite links → students join, rent required titles from the catalog if applicable, or read the private course PDFs → lecturer sees anonymized progress across the class.

Outcome: a functioning course reading space exists on Flipbook. Students who rented catalog titles have generated real revenue. Lecturer feels the tool is worth recommending to a colleague.

Success criteria: 8+ course communities live by month 6, none using it as an LMS.

### Success Metrics

**Primary metric:** *Monthly net contribution.* This is the number the business runs on. Target by month 12: ₦1.87M/mo (~$1,248). Target by month 6 (breakeven): ₦0+ (revenue ≥ costs).

**Financial secondary metrics:**
- *Pro conversion rate.* Target: 5% by day 60, walking to 8% by month 12.
- *Active users.* Target: 1,400 (breakeven) by month 4-5, 5,000 by month 12.
- *Rentals per Free user per month.* Target: 0.7.
- *Rentals per Pro user per month.* Target: 4.

**Product secondary metrics:**
- *Magic moment hit rate.* % of new users who leave at least one reaction in their first reading session. Good: 50%. Great: 70%.
- *Book completion rate.* % of rentals where the reader finishes the book within the rental window. Good: 30%. Great: 45%.
- *Community activity.* Active communities (1+ reactions in last 7 days) as % of total communities. Good: 60%. Great: 80%.
- *Author retention.* % of signed authors still on Flipbook 90 days after their first rental. Good: 85%. Great: 95%.

**Leading indicators:**
- *First-week rental conversion.* If <20% of signups rent a book in week one, checkout is broken or catalog isn't landing.
- *Payment failure rate.* Sustained >15% post-rebill is an existential issue.
- *Support ticket volume per 100 users.* Above 5 tickets per 100 users per month is a UX problem, not a support problem.

### Risks

**Supply risk: founding-30 author cohort under-fills.** If we sign 12 authors instead of 30 by mid-August, launch catalog is thin and rental depth suffers. Likelihood: medium. Impact: high. Mitigation: over-pitch (35–40 targets to yield 30); build the target list wide across genres; use small publisher deals as bulk-signing shortcuts (one publisher yes = 5–15 authors).

**Payment risk: Nigerian card processing failure eats revenue.** Nigerian card decline rates on subscriptions run 15–25% without smart rebill. Likelihood: high. Impact: medium-high. Mitigation: invest in rebill / dunning logic in month 2; use Paystack's failure retry patterns; fall back to card + bank transfer + USSD.

**Currency risk: NGN depreciation compresses margins.** USD-denominated costs (Convex, OpenAI TTS, ElevenLabs, Wise) don't depreciate; revenue is in NGN. Likelihood: high (structural). Impact: medium. Mitigation: model with conservative FX; consider USD-denominated Pro tier for diaspora readers to hedge.

**Product risk: catalog is thin and readers churn.** If a reader finishes their first rental and there's nothing else in the catalog they want, they churn immediately. Likelihood: medium in month 1-2; low once catalog crosses 300 titles. Mitigation: ingest PD fast to give catalog depth; over-index on Nigerian romance and popular fiction in month 1 for repeat-rental behavior.

**Execution risk: two-cofounder capacity.** ~50-60 hrs/wk combined, part-time, across build, supply, ops, and marketing is a stretch. Illness, unexpected weeks, day-job crunch, or accelerator commitments compress the model. Likelihood: medium. Impact: high. Mitigation: the two-cofounder split is the primary mitigation — Moks owns product/vision/design/build, Ayodeji owns ops/BD/partnerships, so neither carries the whole load and the extroverted networking work no longer falls on a designer. Also: ruthless scope; Convex + Claude Code reduce build load; supply-side outreach can pause without killing product velocity; explicit "if we only ship one thing this week" prioritization. Residual risk: a two-person team has no slack if one cofounder is unavailable — keep scope honest and timelines conservative. First hire (backend engineer or community/author-success lead) triggered by first fund raise or sustained monthly breakeven, whichever comes first.

**Legal risk: content moderation on user-uploaded course materials.** A lecturer uploading a scanned chapter of a textbook they don't hold rights to is the piracy exposure we designed the platform to avoid. Likelihood: low if managed well. Impact: high if a rights-holder complaint reaches public. Mitigation: private-community-only, rights certification at upload, DMCA-style takedown flow, active moderation of course-material uploads until we have a scaled process.

**Category risk: BookTok or Bookstagram doesn't convert into rentals.** Views are cheap; paying readers are not. Likelihood: medium. Impact: medium. Mitigation: track content-to-signup and signup-to-rental conversion by channel; kill under-performing channels quickly.

**Adjacent risk: campus surface pulls attention away from the consumer product.** Educators are demanding users. Two professors asking for grade-book features is a slippery slope. Likelihood: medium. Impact: high (kills the North Star). Mitigation: the "reading extends, workflow does not" principle in this doc + hard "no" muscle on non-reading requests.

**Category risk: a well-funded incumbent (Everand, Fable, a Nigerian aggregator) ships something similar.** Likelihood: low. Impact: medium if they enter the Nigerian market seriously. Mitigation: founder proximity + author-network trust + community craft — none of which capital can immediately buy.

-----

## 4. Brand Strategy

### Positioning Statement

For African readers in their 20s–40s who want a home for the book they're reading right now, **Flipbook** is the *reading library* that pairs a curated catalog of African indie voices and world classics with rental prices matched to local income and communities that make finishing a book feel shared. Unlike Kindle — Western catalog, USD pricing, no community — and unlike Goodreads — a graveyard of past reviews — Flipbook is priced for Lagos, curated by taste, and built around the book you're reading right now with the people reading it with you.

### Brand Personality

If Flipbook were a person: she's the friend from Lagos who ran two book clubs in university, works at an indie bookstore now, has impeccable taste but never makes you feel uncool for not having read what she's read, and sends you a chapter she loved with one sentence in the message: *"this part."* She's bookish-modern with a cozy undertone — refined and confident, but also warm, generous, and a little playful. She knows reading is having a moment again and acts like it. She'd never use the word *platform* in a sentence. She'd never tell you you're falling behind on anything.

She reads Damilare Kuku, Chimamanda, Ta-Nehisi Coates, Zadie Smith, and the Standard Ebooks edition of *Mrs Dalloway* with equal care. She'd never shame anyone for what they read or how slowly they read it. But she also has opinions, and she doesn't water them down.

The brand should feel like a quiet vote of confidence in the reader — that they are someone who reads, who has taste, who cares about ideas, who deserves a beautiful tool that was made *for them*, not translated for them.

### Voice & Tone Guide

The voice is constant: **warm, generous, lightly clever, never cute, never gamified. Speaks from Lagos, sounds like a well-read Nigerian friend, addresses a global reader from that vantage.**

The tone shifts slightly across contexts:

| Context | DO | DON'T |
|---|---|---|
| **Onboarding** | "Pick three genres you love. We'll build your first shelf." | "Welcome to your reading journey. Let's get started." |
| **Empty catalog shelf** | "Your shelf is empty. Rent your first book, or wait for a friend to invite you." | "You have no books yet. Tap here to browse." |
| **Empty community** | "No community for this book yet. Start one — or wait for one to find you." | "No communities available. Create one now." |
| **Empty state (no reactions on a page)** | "Be the first to react." | "No reactions yet. Be the first!" |
| **Rental confirmation** | "It's yours for four weeks. Take your time — the room's here whenever you are." | "Purchase successful. Your rental has been activated." |
| **Rental expiring** | "Two days left on *[Book]*. Finish, or renew — up to you." | "Your rental expires in 48 hours. Renew now to avoid losing access." |
| **Success — finished a book** | "That's a wrap. Add a thought before it fades?" | "Congratulations! You finished a book. Keep up the reading streak!" |
| **Payment failed** | "Your bank didn't approve the charge. Try again, or use a different card?" | "Error: Payment declined. Please try again." |
| **Push — chapter drop** | "*[Author] just dropped Chapter 4 of [Book]*. The room's filling up." | "New chapter alert. Don't miss out." |
| **Push — reply to reaction** | "Toby replied to your reaction in *[Book]*." | "You have a new notification. Open the app to see." |
| **Marketing — landing copy** | "The library African readers deserve. Rent smart, read together." | "The future of social reading, reimagined." |
| **Settings / billing** | "You're on the Pro plan. Cancel anytime — we won't make it weird." | "Manage your subscription. Premium membership active." |
| **Confirmation — leave a community** | "Leave *[Community Name]*? Your rental stays with you. You can always come back." | "Are you sure you want to leave this community? This action cannot be undone." |

### Messaging Framework

**Tagline (v2).** *Rent smart. Read together. Talk on the page.*

**Homepage / App Store headline (primary).** *The library African readers deserve.*

**Alternate H1s worth keeping for ads and social:**
- *Read with the people who are reading right now.* (still valid — from v1)
- *Great books, made affordable. Read them together.*
- *Your next book is here. So are the readers.*

**Homepage / App Store subheadline.** *A curated library of African indie voices and world classics. Rent affordably. Read inside a community. All from your phone.*

**Three value propositions (v2).**

1. **Books at prices that make sense.** Rent from a curated catalog for ₦500 to ₦2,500 — a coffee, not a week's spend. Public-domain classics come free with Pro. No ₦35,000 hardcovers to save up for.
2. **A community around every book.** Rent a book, join the community reading it, and see reactions bloom in the margins as your friends reach the same paragraphs you do. No spoilers ahead. No ghost-town Discord.
3. **Authors get paid what they're worth.** 70% of every rental goes to the author. If you love an indie writer, renting them on Flipbook is a real vote — not pennies-per-page-read like it is on Amazon.

**Feature descriptions (in brand voice).**

- *Curated library:* "A library built by taste. Nigerian indies. Ghanaian romance. The classics that earned their place. Nothing on the shelf that shouldn't be."
- *Rental:* "Rent a book for four weeks. Read it. Finish it. Rent the next. Your library shifts with what you're reading now."
- *Communities:* "Make a community like a group chat. Invite your people. Read together."
- *In-margin reactions:* "Long-press a paragraph. Drop a reaction. Watch the room reply."
- *Flipbook Pro:* "Unlimited classics, free. 15% off everything else. The audio reader. The Specials shelf. Community creation. All for less than Netflix."
- *Flipbook Specials:* "A private literary magazine that comes with your subscription. Curated titles you won't find on the everyday shelf. Free with Pro."
- *Audio reader:* "Every book, read aloud. Warm neural narration for the commute, the walk, the wind-down."
- *Course communities:* "For lecturers who want their students in one reading space. Not an LMS. Just the reading part, done properly."

**Objection handlers.**

- *"Why not just use Kindle?"* — "Kindle prices in dollars and its Nigerian catalog is thin. Flipbook prices in naira and starts with African voices."
- *"Why rent instead of buy?"* — "Because a ₦1,500 rental you finish is better than a ₦35,000 hardcover you don't. And when you rent, more of the money reaches the author."
- *"How is this different from Okada Books?"* — "Okada sells books. Flipbook rents them, and reads them together. Different economics, different reason to open the app."
- *"I already have a Goodreads account."* — "Goodreads is for the books you've finished. Flipbook is for the book you're reading right now."
- *"I prefer reading alone."* — "You still can. Solo reading works. The communities are there when you want them."
- *"I don't finish books."* — "Nobody does, when they read alone. That's the point of the room."

### Elevator Pitches

**5-second pitch.**
*"Flipbook is Netflix for books, with a community around every one."*

**30-second pitch.**
*"Flipbook is a book-rental app built for African readers. We license a curated catalog of African indie voices, world classics, and small-publisher titles, and we rent them for ₦500 to ₦2,500 per four weeks — a price a reader in Lagos can actually justify. Every book comes with an optional community: rent alongside your friends, drop reactions in the margins as you read, and finish more of what you start. Authors keep 70% of every rental. Pro subscribers ₦1,550/mo get unlimited access to the classics, audio narration, and our curated Specials shelf."*

**2-minute pitch.**

*Books are inaccessible for most African readers. A hardcover in Lagos costs ₦25,000–₦35,000 — a week's discretionary spend for a young professional. The digital alternatives — Kindle, Kobo, Google Play Books — price in dollars, skew Western in catalog, and have no community. Local ebook platforms exist but they're fragmented, thin on curation, and don't do rental. And even if a reader gets the book, they're reading it alone in a culture that's rediscovering reading as a shared act — book clubs form on WhatsApp and die by Chapter 3.*

*Flipbook is the reading library African readers deserve. We license and curate a catalog — starting with African indie authors and public-domain classics, expanding outward — and we rent every book at prices between ₦500 and ₦2,500 for four weeks. Readers rent inside an in-app EPUB reader with in-margin reactions from friends and communities reading the same book. A Pro subscription ₦1,550/mo unlocks unlimited public-domain classics, audio narration, our curated Specials shelf, and community creation.*

*The wedge is Nigerian and diaspora readers 20–40. The supply is African indie authors and small African publishers — a founder-network advantage no US or UK reading app can reach from Silicon Valley. Author economics are 70/30 in the author's favor, better than Kindle Unlimited by an order of magnitude, which makes the founding-30 supply cohort achievable. Course communities for university lecturers are an extension surface, not a separate product — the founder's parents are professors and the model has real early pull without pulling the product into LMS territory.*

*Convex for real-time reactions, Clerk for auth, RevenueCat + Paystack for payments, OpenAI TTS + ElevenLabs for audio, Expo for mobile. Two-cofounder team from Lagos — Moks (design + product + build) and Ayodeji (operations + BD + child-safety background) — shipping with AI coding agents. Monthly cash breakeven modeled at ~1,375 active users and 95 Pro subs — achievable in month 4-5 of the base case. 12-month projected net contribution ~₦1.87M/mo (~$1,248), a real founder income and a foundation to raise from.*

*Why now: African tech infrastructure (Paystack, RevenueCat, cheap Convex) finally makes a Nigerian consumer subscription product economically feasible. Neural TTS finally makes audio narration affordable at scale. And BookTok has pulled a generation of African readers into books without a home built for them. The market is real; nobody is building for it.*

*Why us: Moks brings five years of product design in healthcare — a domain that taught trust, retention, and behavior change are non-negotiable. Lagos-based, the reader Flipbook is for, has abandoned every reading app on the market, can sign African indie authors and small publishers over coffee that no incumbent can reach. Ayodeji brings ops chops, a deep relationship network, a gift for pitching, and hands-on child-safety operations experience from a gaming company. The introverted-designer plus extroverted-operator split is deliberate — each covers the other's blind spot.*

### Competitive Differentiation Narrative

The African reading market has been served by two categories of product: **global apps that don't fit** (Kindle, Kobo, Play Books — Western catalog, USD pricing, no community, no cultural anchor) and **local apps that under-invest** (Okada Books, Selar, Bambooks — great local ecosystem, but direct-sale one-off transactions, thin curation, no rental, no community). Both have real users; neither is what Ada actually wants.

Flipbook's bet is that the missing product is a **curated rental library with community, priced in naira, led by African voices, and paying its authors a real chunk.** That's four choices at once — catalog, pricing, taste, economics — and no incumbent can ship the combination without rebuilding.

**Kindle** would have to rebuild its pricing, its catalog acquisition, and its community layer. It won't.

**Masobe App** *(launched 2026 — added Aug 15)* is the closest new entrant: a Nigerian publisher's own subscription reading app (₦1,999/mo for 2 books up to ₦5,999/mo unlimited, offline reading, physical-paperback ordering). But it is structurally a *single-publisher storefront* — Masobe titles only, no community layer, no rental, no third-party authors. It validates the market ("affordable legal access to African literature" is now a proven consumer proposition) while leaving our ground open: multi-publisher catalog, per-book rental below their subscription floor, 70/30 indie-author economics, and the community primitive they'd have to rebuild their app to match. Strategy: collaboration-first (Masobe titles renting on Flipbook non-exclusive), compete-if-declined. Their launch is also an urgency lever in every other publisher conversation: *"Masobe built their moat. Build yours, or use ours."*

**Okada Books and Selar** would have to move from sales to rental — a different license, different economics, different social product. They've had years to and haven't.

**Fable** is the closest analog to the community piece but is US-based, has no African catalog, and skews celebrity-book-club rather than friend-first.

**Local piracy (WhatsApp + PDFs)** is the actual competitor. Beating it means being *nearly as easy* to share (invite-link communities) and *legibly better* on price (rental at coffee-money) and quality (a real EPUB reader with reactions in the margins).

The compounding advantage is the flywheel: **more African indie authors sign because the economics beat Kindle Unlimited; more readers join because the catalog is dense and priced for them; communities form around books that already have readers; Pro conversion rises because the community + Specials + audio combination gets stickier as the catalog grows.** The graph gets denser. Kindle can't ship this. Okada would have to reinvent itself in a different license class. We start at the right primitive, in a market with founder-proximity as a structural moat.

### Brand Anti-Patterns

**Never feel like Kindle.** No USD pricing anywhere in the reader UI. No Western-first catalog on the launch shelves. No "sync your Amazon library" — we don't want that library on our surface.

**Never feel like Goodreads (or any 2008 forum).** No flat threaded discussions, no review counts as primary UI, no avatar-and-text grid layouts, no average-rating-out-of-five as a primary surface. Book metadata (ISBN, edition codes, page counts in the abstract) never leads the experience.

**Gamify only in service of the reading habit.** *(Revised Aug 15, 2026 — supersedes the blanket "never gamify" rule.)* Streaks, reading goals, milestones, and progress celebration are allowed — warm-toned, personal or club-level, always resettable without shame. What stays banned: streaks-as-anxiety (a broken streak never guilts), owl shame, public leaderboards ranking readers against each other, "top 10% of readers" status badges, and any notification that guilts rather than invites. The line: gamification that gets someone *reading* is good; gamification that makes someone feel *bad about not reading* is not.

**Never feel like a content feed.** No infinite scroll on the home screen. Flipbook is a place — a library, a community, a nightstand — not a timeline. No algorithmic recommendations as primary discovery. No engagement-on-engagement surfaces (likes-on-likes, follower counts as status).

**Never feel like Substack-on-mobile.** No email-first flows. No newsletter aesthetic. The reading happens in the app, the conversation happens on the page, the creator-reader connection happens inside the community surface — not in an inbox.

**Never feel like an LMS.** No grade books. No attendance. No assignments. No video calls. No calendars. No certificates. Course communities are reading spaces, not classrooms — the moment a feature could be described as *learning management*, it's out.

**Never feel cheap.** No generic stock photography of a person reading by a window. No AI-generated illustrations. No auto-generated book covers. No emoji garlands in headers. No "Welcome to your reading journey" copy. No off-brand cover images at any resolution.

**Never use the word *platform* in user-facing copy.** Never use *leverage*, *synergy*, *solution*, *ecosystem*, *powered by*, or *reimagined*. Never end a sentence with an exclamation point in a notification.

**Never crowd a screen.** Every page earns its real estate. If you can't justify why something is on the screen, it isn't. White space is part of the brand.

**Never make the user feel behind.** No "you're falling behind" copy. No "your friends are reading more than you." If a community has moved past a member, the copy is gentle ("Toby is on chapter 4 — the room is just ahead of you") and the action is forward-leaning, not shame-driven.

**Never make the user feel poor.** Rental prices are shown proudly and legibly. The Pro tier is framed as *"you get more,"* not as *"you unlock what you were locked out of."* Pricing is a feature, not an apology.

-----

## 5. Design Direction

*Section 5 is preserved verbatim from v1 — the design system, brand colors, typography, spacing, components, iconography, accessibility, motion, and design tokens are unaffected by the business-model pivot. See `design-tokens.json` for the machine-readable source.*

### Design Philosophy

1. **The book is the hero.** Book covers, page content, and reader-generated marks (highlights, reactions) are the visual centerpiece of every screen they appear on. UI chrome is restrained — present where needed, invisible otherwise.
2. **Editorial calm over interface noise.** Generous whitespace, clear hierarchy, type-driven layouts. Buttons and interactive elements are clearly affordant but never compete with content. We aim for the visual feel of a well-edited literary magazine, not a B2B SaaS dashboard.
3. **Bold accent, restrained system.** The Vibrant Coral is used sparingly and intentionally — for primary CTAs, important social signals (live activity), and brand accents. The Deep Indigo is the workhorse. Restraint is what makes the coral feel meaningful when it appears.
4. **Motion confirms, never distracts.** Animations are short, purposeful, and tied to user action — a reaction expanding, a page turning, a club view loading. We never animate to entertain.

### Visual Mood

Flipbook's visual mood is **editorial-modern with a strong identity** — the design system already lives in Figma and is the source of truth. Imagine the cover treatment of a contemporary literary magazine (think *The Paris Review* meets *Letterboxd*) translated into a mobile app: deep, confident colors with one bold accent, generous whitespace, type as personality. The brand pairs Deep Indigo (`#3b3a6d`) as primary with Vibrant Coral (`#ff6b6b`) as accent, on warm and cool surfaces (Warm Ivory `#f7f3e3` for editorial moments, near-white Primary `#fdfdfd` for everyday reading), with Golden Sand and Muted Plum as accent highlights. The overall energy: confident, library-grade, made-for-readers — with a quietly bold coral signal that says "reading is alive here."

### Theme Modes

Flipbook ships **three theme modes at MVP** — Light, Flip, and Dark — all three already designed in Figma. This is a deliberate brand choice: reading is a deeply personal activity that happens across very different lighting contexts (morning commute, late-night bed, sunny park bench), and the theme system meets the reader where they are without compromising brand identity.

**Light mode (default).** Warm and editorial. Surface Primary `#fdfdfd` (near-white) and Warm Ivory `#f7f3e3` for special moments. Text in Deep Indigo `#3b3a6d`. The bookshop-meets-literary-magazine aesthetic. Default for first-time users; recommended for daytime reading.

**Flip mode.** The Flipbook-native theme — a brand-coded variant that's neither standard dark nor light. Surface is Deep Indigo `#3b3a6d` (the brand primary, repurposed as a background); text is Warm Ivory `#f7f3e3` and near-white `#fdfdfd`. The aesthetic is "candle-lit reading nook" — rich, intimate, library-after-hours. This is the most distinctive of the three modes and the one most likely to become the brand signature in marketing imagery.

**Dark mode.** Standard high-contrast dark for low-light reading. Surface is Charcoal `#121212` with Deep Indigo for elevated surfaces; text is Warm Ivory `#f7f3e3`. Designed for OLED-friendly night reading and accessibility for users who prefer dark interfaces system-wide.

**Three-mode design principles:**

1. **The component system is mode-agnostic.** Buttons, cards, inputs, tags, and chips look and behave the same in all three modes — only their surface and text token mappings change. We never build a different button for Flip mode.
2. **Coral accent is constant.** The Vibrant Coral CTA color stays `#ff6b6b/#f83b3b` across all modes — it's the brand's heartbeat. Coral on cream (Light), coral on indigo (Flip), and coral on charcoal (Dark) all read as "Flipbook."
3. **Mode follows the user, not the system.** Users explicitly pick a mode in Settings. We do NOT default to system theme — Flip mode is too specific to be auto-selected by an OS-level "dark mode" toggle. A "Match system" option may be added later (Phase 2 polish), mapping system-dark to either Flip or Dark.
4. **Token swap, not visual rebuild.** Theme implementation is a config swap at the token layer — `--color-surface-primary` resolves to `#fdfdfd` (Light), `#3b3a6d` (Flip), or `#121212` (Dark). All component styling references the token, never the raw hex.

### Color Palette

**Brand colors (primary identity).**

| Token | Hex | CSS variable | Tailwind name | Use |
|---|---|---|---|---|
| Deep Indigo 900 | `#3b3a6d` | `--color-brand-primary` | `brand-primary` | Primary brand color, primary buttons, primary text |
| Deep Indigo 800 | `#48448f` | `--color-brand-primary-hover` | `brand-primary-hover` | Hover state for primary buttons |
| Deep Indigo 700 | `#5752b0` | `--color-brand-primary-light` | `brand-primary-light` | Tertiary brand accents |
| Deep Indigo 300 | `#b4bfed` | `--color-brand-primary-muted` | `brand-primary-muted` | Muted/disabled primary, borders |
| Vibrant Coral 400 | `#ff6b6b` | `--color-accent` | `accent` | Brand accent, secondary CTAs hover |
| Vibrant Coral 500 | `#f83b3b` | `--color-accent-strong` | `accent-strong` | Secondary CTAs default |
| Vibrant Coral 600 | `#e51d1d` | `--color-accent-pressed` | `accent-pressed` | Secondary CTA pressed |
| Vibrant Coral 200 | `#ffc7c7` | `--color-accent-muted` | `accent-muted` | Muted accent surfaces |
| Golden Sand | `#e4b363` | `--color-highlight` | `highlight` | Author badges, highlight chips, special moments |
| Muted Plum | `#5d3a5a` | `--color-accent-deep` | `accent-deep` | Editorial accents (rarely used surface) |
| Warm Ivory | `#f7f3e3` | `--color-surface-warm` | `surface-warm` | Editorial sections, book detail surfaces |
| Charcoal | `#121212` | `--color-bg-dark` | `bg-dark` | Dark mode primary background |

**Surfaces.**

| Token | Hex | CSS variable | Use |
|---|---|---|---|
| Surface Primary | `#fdfdfd` | `--color-surface-primary` | App background, default screen |
| Surface Secondary | `#f1f4fc` | `--color-surface-secondary` | Cards, sections, modals |
| Surface Border | `#b4bfed` | `--color-border` | Hairline dividers, input borders |
| Surface Accent | `#5d3a5a` | `--color-surface-accent` | Reserved for very specific editorial moments |

**Text.**

| Token | Hex | CSS variable | Use |
|---|---|---|---|
| Text Primary | `#3b3a6d` | `--color-text-primary` | Headings, primary body text |
| Text Secondary | `#464646` | `--color-text-secondary` | Body text, paragraph copy |
| Text Muted | `#989898` | `--color-text-muted` | Captions, timestamps, helper text |
| Text Accent | `#5d3a5a` | `--color-text-accent` | Editorial accents, special copy |
| Text Alt | `#2f2f2f` | `--color-text-alt` | Alt text on warm surfaces |
| Text Inverse | `#fdfdfd` | `--color-text-inverse` | Text on dark backgrounds, button text |

**Neutrals (gray scale, 12 stops).** Full ramp from `#EFEFEF` (Gray 1) to `#000000` (Gray 12) — see `design-tokens.json` for full set. Use sparingly; the brand identity comes from the indigo/coral palette, not the grays.

**Semantic colors.**

| Token | Hex | CSS variable | Use |
|---|---|---|---|
| Success | `#3CAA6E` | `--color-success` | Confirmation states (saved, uploaded) |
| Warning | `#E4B363` | `--color-warning` | Aligned with Golden Sand for cohesion |
| Error | `#E51D1D` | `--color-error` | Destructive states; aligns with Coral 600 |
| Info | `#5752b0` | `--color-info` | Informational banners; aligns with Indigo 700 |

**Three-mode token mapping.** MVP ships all three modes (Light, Flip, Dark — see § Theme Modes above). Theme is a config swap at the token layer, not a visual rebuild. Define semantic tokens (`--color-surface-primary`, `--color-text-primary`, etc.) that resolve to different palette values in each mode — see § Design Tokens for the full mapping table. Components consume the semantic tokens via the theme context and re-render automatically on mode change.

### Typography

**Type system overview.** Two-family system: **Raleway** (primary — content, body, headlines) and **Inter** (secondary — UI labels, captions, overlines). **Font Awesome 6 Pro** for icons (with Lucide as a fallback if licensing is unavailable).

**Type scale (rem-style scale for design-doc clarity; React Native uses raw px).**

| Token | Family | Weight | Size | Line | Letter | Use |
|---|---|---|---|---|---|---|
| `display-lg` | Raleway | 700 | 32px | 1.2 | 0 | Marketing screens, splash |
| `display-md` | Raleway | 700 | 26px | 1.2 | 0 | Major screen titles |
| `heading-lg` | Raleway | 600 | 22px | 1.3 | 0 | Section headers |
| `heading-md` | Raleway | 600 | 18px | 1.3 | 0 | Card titles, community names |
| `body-lg` | Raleway | 500 | 16px | 1.3 | 0 | Body copy, paragraph reading text |
| `body-md` | Raleway | 500 | 14px | 1.3 | 0 | Secondary body |
| `body-sm` | Raleway | 500 | 12px | 1.3 | 0 | Tertiary body, captions |
| `body-caption` | Raleway | 500 | 10px | 1.3 | 0 | Smallest label |
| `paragraph-md` | Raleway | 500 | 16px/24px | — | 0 | Long-form paragraphs |
| `paragraph-sm` | Raleway | 500 | 14px/20px | — | 0 | Compact paragraphs |
| `paragraph-xs` | Raleway | 500 | 12px/20px | — | 0 | Smallest paragraph |
| `ui-label-md` | Inter | 500 | 12px/16px | — | 0 | Form labels, tab labels |
| `ui-label-rg` | Inter | 400 | 12px/16px | — | 0 | Caption-weight UI labels |
| `overline-lg` | Inter | 600 | 14px | 1.3 | 4 | All-caps overlines, small headers |
| `icon-sm` | FA 6 Pro | 400 | 12px | 1.0 | 0 | Inline icons |

**Headlines use Raleway exclusively.** UI elements (tab bars, form labels, secondary captions) use Inter. The clean separation gives the product a distinct editorial voice without competing for attention.

### Spacing & Layout

**Spacing scale (4px base).**

| Token | Value | Common use |
|---|---|---|
| `space-0` | 0 | No spacing |
| `space-1` | 4px | Hairline gaps, icon-text padding |
| `space-2` | 8px | Tight inline spacing |
| `space-3` | 12px | Compact card padding |
| `space-4` | 16px | Default screen padding, card internal padding |
| `space-5` | 24px | Section padding, between major UI groups |
| `space-6` | 32px | Between sections |
| `space-7` | 48px | Major vertical rhythm |
| `space-8` | 64px | Splash / hero spacing |
| `space-9` | 96px | Reserved for marketing screens |

**Layout rules.**

- **Default screen padding:** 16px horizontal, 24px top from safe area.
- **Card internal padding:** 16px on all sides, with 12px between content rows.
- **Section spacing:** 24px between cards in a list; 32px between sections.
- **Tab bar:** standard 56px height + safe-area inset; icons 24px, labels 12px Inter Medium.
- **Touch targets:** minimum 44x44px (iOS HIG), 48x48px preferred for primary CTAs.
- **Maximum content width on tablet:** 600px centered (Phase 2 polish — MVP is phone-only).

### Component Philosophy

**Buttons.** Pill-shaped or rounded-rectangle (8–12px radius). Three primary variants: **Primary** (Deep Indigo background, white text — for confirmations and main CTAs), **Secondary** (Vibrant Coral background, white text — for special social/community CTAs like "Join community" or "Rent this book"), and **Alt** (text-only, coral text on transparent — for tertiary actions). Each variant has default/hover/pressed/muted states.

Buttons feel substantial but not chunky — 44px height for default, 36px for compact, 52px for primary screen CTAs. No drop shadows on buttons; reserve shadows for elevated surfaces.

**Cards.** Rounded corners (12px), subtle shadow (soft, 0 2px 8px rgba(0,0,0,0.04)) on a near-white surface. Border treatment is rare — we lean on shadow and surface contrast instead. Cards for communities and books prioritize the cover image (hero), with title in `heading-md` Raleway and meta in `ui-label-md` Inter underneath.

**Inputs.** 1px border (Surface Border `#b4bfed`), 8px radius, 16px internal padding, default 48px height. Placeholder in Text Muted; entered text in Text Primary. Focus state: border thickens to 2px in Deep Indigo 700. No shadows on inputs.

**Tags / chips.** Pill-shaped (full radius), 24–28px height, 10–12px horizontal padding. Two variants: **filled** (Deep Indigo 300 background, Deep Indigo 900 text — for genre tags and metadata) and **outlined** (transparent background, 1px border, primary text — for filters).

**Modals / sheets.** Bottom sheets are the default on mobile; full-screen modals only when the content is the focus (e.g., reading view). Sheets have a 16px top radius, 24px internal padding, and a small top handle (4px tall, 32px wide, gray-2 fill).

**Border radius strategy.** 8px (inputs, small surfaces), 12px (cards, sheets), 16px (large surfaces, modal frames), full (pills, chips). No 4px or 6px — keep the radius system disciplined.

**Shadow philosophy.** Use sparingly. Two defined shadows: `shadow-sm` (0 1px 4px rgba(0,0,0,0.04)) for default cards and `shadow-md` (0 4px 16px rgba(0,0,0,0.08)) for elevated surfaces (modals, floating action buttons). Never use four-direction box shadows or colored shadows.

### Accessibility Commitments

**WCAG 2.1 Level AA compliance** is the floor for MVP, AAA for color contrast where feasible.

- **Color contrast.** All text meets WCAG AA. Body text never uses Vibrant Coral.
- **Focus indicators.** Every interactive element has a visible focus ring (2px Deep Indigo 700, 2px offset).
- **Touch targets.** Minimum 44x44px on all interactive elements.
- **Screen reader support.** All images have descriptive alt text. All interactive elements have accessible labels. Reading view: each page is announced with chapter and page number; reactions are announced as "reaction by [user] on paragraph [N]: [text]."
- **Motion.** Respect `prefers-reduced-motion`.
- **Type scaling.** Respect iOS Dynamic Type / Android font scale at 100–200% range.
- **Audio content.** Audio narration ships with visible text (the book itself) so the audio is always accompanied by transcribable content.

### Motion & Interaction

**Transition durations.** Default: 200ms. Quick (small UI feedback): 120ms. Slow (modal/sheet entry): 320ms. Never longer than 400ms.

**Easing.** Default: `cubic-bezier(0.4, 0.0, 0.2, 1)`. Entrance: `cubic-bezier(0.0, 0.0, 0.2, 1)`. Exit: `cubic-bezier(0.4, 0.0, 1, 1)`.

**What animates:** screen transitions, modal/sheet entry/exit, reaction appearance (subtle fade-and-scale, 200ms), button press states, pull-to-refresh, page turns in the reading view (subtle horizontal slide, 240ms).

**What never animates:** typography, colors on state change (instant), reading content during a normal scroll.

**Loading states.** Skeleton loaders for content-heavy screens (catalog, community lists). Spinners only for blocking operations (uploads, payments). Optimistic UI for reactions.

**Live reactivity.** When a reaction appears in the margin from another reader, it fades-in (160ms) with a subtle horizontal slide of 8px. Never bounces. Never pulses. The smallest possible motion that says "this is live."

### Design Tokens

Consolidated reference. Full structured set in `design-tokens.json`.

**Brand-constant tokens** (same across all three theme modes):

```css
--color-brand-primary: #3b3a6d;
--color-brand-primary-hover: #48448f;
--color-brand-primary-pressed: #252442;
--color-brand-primary-light: #5752b0;
--color-brand-primary-muted: #b4bfed;

--color-accent: #ff6b6b;
--color-accent-strong: #f83b3b;
--color-accent-pressed: #e51d1d;
--color-accent-muted: #ffc7c7;

--color-highlight: #e4b363;
--color-accent-deep: #5d3a5a;

--color-success: #3CAA6E;
--color-warning: #e4b363;
--color-error: #e51d1d;
--color-info: #5752b0;

--font-primary: 'Raleway', system-ui, sans-serif;
--font-secondary: 'Inter', system-ui, sans-serif;
--font-icon: 'Font Awesome 6 Pro', sans-serif;

--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-pill: 9999px;

--duration-quick: 120ms;
--duration-default: 200ms;
--duration-slow: 320ms;
--easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);
--easing-entrance: cubic-bezier(0.0, 0.0, 0.2, 1);
--easing-exit: cubic-bezier(0.4, 0.0, 1, 1);
```

**Mode-dependent semantic tokens:**

| Token | Light | Flip | Dark |
|---|---|---|---|
| `--color-surface-primary` | `#fdfdfd` | `#3b3a6d` | `#121212` |
| `--color-surface-secondary` | `#f1f4fc` | `#48448f` | `#2B2B2B` |
| `--color-surface-warm` | `#f7f3e3` | `#5d3a5a` | `#414141` |
| `--color-surface-elevated` | `#fdfdfd` | `#252442` | `#161616` |
| `--color-border` | `#b4bfed` | `#5752b0` | `#414141` |
| `--color-text-primary` | `#3b3a6d` | `#f7f3e3` | `#fdfdfd` |
| `--color-text-secondary` | `#464646` | `#b4bfed` | `#D9D9D9` |
| `--color-text-muted` | `#989898` | `#5752b0` | `#828282` |
| `--color-text-inverse` | `#fdfdfd` | `#3b3a6d` | `#3b3a6d` |
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.04)` | `0 1px 4px rgba(0,0,0,0.20)` | `0 1px 4px rgba(0,0,0,0.40)` |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` | `0 4px 16px rgba(0,0,0,0.32)` | `0 4px 16px rgba(0,0,0,0.50)` |

The `design-tokens.json` file alongside this doc holds the full structured set in a machine-readable format and is the source of truth for codegen.
