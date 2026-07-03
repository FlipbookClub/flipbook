# Product Vision — Flipbook

## 1. Vision & Mission

### Vision Statement

A world where reading is the most consistent social ritual people have — where every book becomes a thread of conversation between the people reading it, and where writers find their readers in the same place those readers find each other.

### Mission Statement

Flipbook turns books into living communities by anchoring conversation, progress, and creator publishing to the page itself — so reading stops being something done alone and becomes the easiest, most rewarding way to stay connected.

### Founder's Why

Moks is a product designer with five years inside healthcare — a domain where every interaction has to earn trust, reduce friction, and respect attention. Those are the same disciplines social reading has been missing. Most reading apps are either review-graveyards from another decade (Goodreads), solo trackers with no real community (StoryGraph), or content feeds dressed up as social spaces (Fable). They feel like databases. They don't feel like reading with someone.

But the bigger reason Moks is the right person to build this isn't the design background — it's that he's been the user. He's been a member of multiple book clubs, a lover of the reading culture, and the kind of reader who's tried every app that promised to make reading more social and walked away from all of them. He knows what every existing reading app gets wrong because he's abandoned each of them. And he knows what a great book club moment feels like because he's lived inside several.

Flipbook is the collision of those two worlds: applying serious product craft to a community he deeply understands. Five years of healthcare product design taught him how to ship with restraint and care. Years of being a reader taught him what restraint and care should be in service of. This is the app he wished existed, finally being built by someone qualified to build it well.

### Founding Team

Flipbook is built by two complementary cofounders. **Moks** sets product direction, vision, strategy, and champions growth — the design-and-product mind and the reader who lived the problem. **Ayodeji** runs operations and process, and is the team's relationship engine: a former Programs Manager at a gaming company with a deep network, a gift for pitching, and a knack for getting Flipbook into rooms a heads-down designer never could. The dynamic is deliberate — an introverted product-and-vision founder paired with an extroverted operations-and-network founder, each covering the other's blind spot.

Two parts of Ayodeji's background matter strategically. First, the network and the pitch turn business development and partnerships into a real, ownable growth engine (reflected in `go-to-market.md` § Channel Strategy) rather than something a solo introvert has to force. Second, his hands-on experience with age-gating, parental controls, and child-safety operations inside a gaming company directly de-risks the Phase 9/10 minor-safety work — the hardest compliance surface on the roadmap is exactly the territory he already knows.

For planning, the team holds the conservative assumption: still part-time around day jobs (~10–15 hours/week each). The second pair of hands is treated as upside and resilience, not a reason to compress timelines yet.

### Core Values

**Read alongside, not at each other.** Every product decision has to make reading-with-people feel natural, not performative. We don't add features that turn reading into a status game (streaks, leaderboards, follower counts). We add features that make it easier for two strangers reading the same chapter to feel like they're in the same room.

**Conversations are tied to the page, not the timeline.** Reading isn't a feed. The home screen is a place — a library, a club, a nightstand — not an algorithmic stream. We resist infinite scroll the same way we resist all behaviors the user didn't ask for.

**Creators get a home, not a paywall.** When a reader pays a creator, it should feel like joining something — a community, a release party, a long-running conversation — not unlocking a file. Monetization is a side effect of community, not its substitute.

**Ship the smallest thing that delivers the magic.** The MVP exists to test whether a reader who joins a club, opens the book, and reads a chapter alongside other people experiences the magic. Everything else is later. Healthcare taught us that polish without value is theater; we ship the value first.

**Respect the reader's attention.** No notifications that exist to drag people back into the app. No engagement loops dressed up as features. If we ping a user, it's because someone replied to their comment in a book they're reading — never because we noticed they hadn't opened the app in three days.

### Strategic Pillars

1. **Reader-first wedge, creator-second flywheel.** We optimize the entire MVP for one user — Maya, the accountability-craving reader. Creators come into the picture as Phase 2 monetization, but the magic moment for readers is what wins this market.
2. **Mobile is the only product surface that matters at launch.** Reading happens on phones, in beds, on commutes. The web companion is Phase 2, for creator dashboards and shareable invite links — never for the reading experience itself.
3. **Live reactivity is the moat.** What separates Flipbook from every dead Discord and every stale review site is that conversations happen *as people are reading*. We invest disproportionately in the real-time backend (Convex) and the real-time UX (margin reactions, live progress, page-keyed comments).
4. **Default to private uploads to manage copyright exposure.** Moderators can upload PDFs, but uploads are private to the club, not searchable, not redistributable. We avoid becoming a piracy platform while keeping the WhatsApp-easy onboarding that makes the product stick.

### Success Looks Like

Twelve months from now: 10,000+ monthly active readers. New book clubs forming weekly without paid acquisition because moderators invite their friends and the invites convert. A small but real cohort of creators publishing on Flipbook (Phase 2 monetization shipped) — not famous authors yet, but the kind of indie novelists and serialized writers whose 5,000-strong newsletters become our first paid communities. ~$50k MRR. A clear BookTok and Bookstagram presence with creators running public clubs we sponsored at launch. We've raised a small seed round to expand the team — at least one engineer to take the backend pressure off Moks, possibly a community lead. The product is regularly cited in "where bookish people hang out" lists. And, most importantly, Maya — the persona we built this for — has finished more books in the last six months than she finished in the previous two years.

-----

## 2. User Research

### Primary Persona

**Maya, 29, Marketing Manager.** Lives in a mid-size city. Reads on her commute (45 minutes each way) and for 30 minutes before bed. Has a stack of half-read books on her nightstand that she's been guiltily walking past for six months. Owns a Kindle and a phone — mostly reads on the phone now because Kindle's social layer is non-existent. Has a Goodreads account she hasn't opened in over a year. Joined two book clubs in the past 18 months: one IRL (fizzled after three meetings because of scheduling), one Discord (went quiet by week three because the discussion was disconnected from the chapters anyone was on).

Tech comfort: high. She's the friend her group chat asks for app recommendations. She uses Notion to track personal projects, Spotify with shared playlists, and follows a handful of bookish creators on TikTok and Instagram. Buys 2–4 books a month. Finishes maybe one. Spends $30–80/month on books, audiobooks, and book-adjacent content.

Emotional state around reading: a low-grade ambient guilt. She *wants* to be the version of herself who finishes books and talks about them with people she likes — that version of her existed in college, when she was always in the middle of three group reads. She'd happily pay for a product that just *worked* and brought her back to that version of herself, but she's tried six apps that promised it and walked away from all of them. She's slightly skeptical and a little tired of being marketed to as "a reader."

What would make her switch: a low-friction onboarding (under two minutes), one specific book she's been meaning to read with people who are visibly active and reading right now, and the feeling — within the first hour — that this app is built by someone who actually reads.

### Secondary Personas

**Indie Author / Serialized Writer (Creator).** A self-published author or Substack novelist with 500–10,000 readers. Currently stitches together Substack (for writing), Discord (for community), Amazon (for sales), and Patreon (for monetization). Each seam costs them readers and sanity. They want a single home where their audience can read, discuss, and pay them. On Flipbook in Phase 2, they publish chapters, build paid communities, and get to skip the platform-juggling. Their readers feel like fans of a community, not subscribers to a feed.

**Book Club Moderator (Power Reader).** The friend in the group who organizes everything — picks the book, sends the invites, sets the reading pace, hosts the call. Power user of the moderator tools. Often graduates into creator-side activity (running paid public clubs, becoming an early Flipbook creator). High-leverage user: each moderator brings 6–12 readers with them. We design the moderator tools to make this person look good to their community — clean invite flows, beautiful club pages, easy reading pace settings.

**Bookish Content Creator (BookTok / Bookstagram).** Has 10k–500k followers on TikTok or Instagram, posts about books, sometimes runs informal "read along with me" series. We seed early access to this group as part of GTM. They become discovery pipelines into Flipbook — they run public clubs, their followers join, and a percentage convert into core readers. In Phase 2 they also become candidates for the paid creator side.

### Jobs To Be Done

**Functional jobs.** Maya needs to: (1) finish books she starts, (2) find people to talk to *while* reading, not after, (3) discover what to read next without falling down a recommendations rabbit hole, (4) keep a book accessible across devices and offline (her commute has dead zones), (5) catch up to a club that started without her.

**Emotional jobs.** Maya needs to: (1) feel like she's making progress on a self-image she values (the reader, the curious person, the person who finishes things), (2) reduce the guilt she feels about her unfinished stack, (3) feel connected to people in a low-pressure way that doesn't require scheduling, (4) feel like reading is a celebration, not a chore.

**Social jobs.** Maya needs to: (1) be seen by people whose taste she trusts as someone who reads thoughtfully, (2) have things to talk about with friends and colleagues that aren't work or news, (3) belong to a community of people who care about the same kinds of stories.

### Pain Points

Ranked by severity for the primary persona.

1. **Books die in the gap between intention and finishing.** Maya buys books faster than she finishes them. The cost is emotional (guilt, ambient sense of failure as a reader) and financial (~$300/year of unfinished books). Frequency: every book she buys. Currently she does nothing — the books just accumulate. Severity: high — this is the existential problem the product solves.
2. **There's no place to talk about a book *while* reading it.** When Maya hits chapter 11 of a book she loves and wants to text someone "wait, what just happened," nobody she knows is reading it. By the time she finishes, the moment is gone. Frequency: every interesting book. Currently she posts vague Goodreads updates that nobody reads. Severity: high — this is the magic-moment problem.
3. **IRL book clubs have too much overhead and dissolve.** Scheduling, hosting, snacks, half the group not having read. Maya has been in two that died. Frequency: every IRL club she's joined. Currently she avoids them. Severity: medium — she's accepted the failure pattern but mourns it.
4. **Goodreads and StoryGraph feel solo, dead, or both.** Even with friends added, it's a review log, not a conversation. Frequency: every time she opens them (which is rarely now). Severity: medium — she's already churned out, but it's the failed mode of the category.
5. **Discord book clubs go quiet within weeks.** Conversation isn't tied to the book; it's tied to a general channel. Once the initial enthusiasm fades, there's nothing pulling people back. Frequency: every Discord she's joined. Severity: medium-high — same pattern keeps happening.
6. **Reading on phone vs. Kindle vs. paperback fragments her experience.** Progress doesn't sync. Highlights live in three different places. Frequency: ongoing. Severity: low-medium — she's mostly accepted phone-only.
7. **"Recommendation" feels like an algorithm guessing.** Most reading apps recommend by metadata; she wants to read what her people are reading. Frequency: every time she finishes a book and wonders what's next. Severity: low — she has other discovery channels (BookTok, friends).

### Current Alternatives & Competitive Landscape

**Goodreads (Amazon).** The default reading log. Massive catalog and friend graph, but the product is a 2008 review-and-shelf paradigm grafted onto a modern phone. Where it falls short: no live discussion tied to a book in progress; the conversation, if any, lives in dead forums. Switching cost for Maya: low — she stopped using it years ago. What she'd want imported: her shelves and currently-reading list (Phase 2 import feature consideration).

**StoryGraph.** Beautiful, indie, beloved by serious readers. Best-in-class personal tracker with mood-based recommendations and stats. Where it falls short: explicitly solo; community features are minimal and not the product's center. Switching cost: medium — committed StoryGraph users have invested in their stats.

**Fable.** The closest direct competitor. Has book clubs and in-app reading. Where it falls short: the product feels more like a curated content feed (celebrity book clubs, themed lists) than a place where everyday clubs run their own reads. Conversation is feed-shaped rather than page-keyed. Switching cost: low for users who joined for one celebrity club and haven't formed real habits.

**Substack.** Used by indie creators to publish serialized fiction and bookish newsletters. Excellent for creators, terrible for readers wanting to discuss a chapter with strangers. Substack's "chat" feature is a tacked-on group chat, not reading-keyed conversation. Switching cost (creator side): medium-high — Substack creators have email lists that don't easily migrate.

**Discord servers.** Used as ad-hoc book clubs. Free, flexible, familiar. Where it falls short: discussion is server-wide, not chapter-keyed. People drop because the server doesn't pull them back to *the book they're reading*. Switching cost: low — a Discord server is easy to abandon.

**WhatsApp / iMessage group chats.** Used by small friend groups for casual reading-along. Works for 2–4 friends, falls apart at 5+. No structure, no progress tracking, easy to derail. Switching cost: low — the group chat is the social fabric, not the book.

**IRL book clubs.** The original product. Beloved when they work; brutal logistics. Where they fall short: scheduling, hosting overhead, the awkwardness when half the group hasn't read. Switching cost: medium — IRL clubs are also social events, not just reading tools.

**Kindle (with social features).** Goodreads-integrated, share highlights with friends. Where it falls short: Goodreads is the social graveyard underneath, and the book is locked into the Amazon ecosystem. Switching cost: high if Maya has a large Kindle library — but she's mostly reading on phone now.

**Doing nothing.** The most common alternative. Maya reads alone, abandons books, occasionally posts a half-finished one on Goodreads. The bar Flipbook needs to clear is not "better than Goodreads" — it's "better than just reading alone with low expectations."

### Key Assumptions to Validate

1. **Assumption:** Readers will accept the friction of "find a club to join" or "create a club and invite friends" in exchange for the social experience. **To validate:** Run the closed beta with 100 hand-picked readers. Measure the percentage who, within 7 days of signup, are part of at least one active club (defined as: at least one other member has read past page 10). Target: 70%. If <40%, the onboarding flow needs a "matchmaking" mechanic — auto-suggested clubs based on what they want to read.
2. **Assumption:** Page-keyed reactions and discussion are dramatically more engaging than book-level forum discussion. **To validate:** In closed beta, A/B (qualitatively) the in-margin reaction feature against a chapter-end "discussion thread" view. Measure: average reactions per reader per session; qualitative feedback on which felt more "alive." Target: 3x more interactions in the in-margin variant.
3. **Assumption:** Moderators will create clubs and stick around — not just ghost after the first invite. **To validate:** Track moderator retention at 14, 30, 60 days. Target: 60% of moderators have an active club at day 30. If <30%, the moderator tools are too thin or the social loop isn't rewarding.
4. **Assumption:** Maya will actually finish more books in Flipbook than she does on her own. **To validate:** Compare self-reported "books finished in last 90 days" before and after the beta. Target: 50% lift. If <20%, the accountability mechanic isn't working — too passive, or progress isn't visible enough.
5. **Assumption:** Private PDF uploads are a sufficient content model for MVP. **To validate:** Track DMCA-style takedown requests in the beta and first 90 days post-launch. If volume is high (>1 per week per 1000 users), we may need to layer in licensed catalog (Phase 1.5) earlier than planned.
6. **Assumption:** Creators (Phase 2) will see Flipbook as a meaningfully better home than Substack + Discord + Patreon. **To validate:** In months 4–6, recruit 5 creators for a Phase 2 paid pilot. Measure: do they migrate audiences? Do they earn at least 50% of what their stitched-together stack earned? If no, the creator value prop needs sharpening before broad launch.
7. **Assumption:** The wedge audience (readers) will pull creators in, rather than the reverse. **To validate:** Track inbound creator interest from organic channels (signup form for "I want to publish on Flipbook") in the first 90 days. Target: 50+ inbound creator signups by day 90 — signal that readers are becoming the gravity well. If <10, we may need to seed creators directly.
8. **Assumption:** Maya will pay for the Pro tier within 60 days of joining. **To validate:** Track conversion to Pro at 30, 60, 90 days. Target: 5% of active readers on Pro by day 60. If <2%, the Pro tier features are not differentiated enough.

### User Journey Map

**Awareness.** Maya sees a TikTok from a BookTok creator she follows: a 30-second video about how she's running a club for *Tomorrow, and Tomorrow, and Tomorrow* on this app she's been beta-testing called Flipbook. The video shows live reactions appearing in the margins of the book as the creator reads. Maya thinks: that's what I've been wanting. She taps the link.

**Consideration.** Lands on the App Store page (or, in Phase 2, a web preview). Sees: a single screenshot of the in-app reading experience with reactions in the margins, three lines of copy ("Read with the people who are reading right now. No scheduling. No hosting. Just the book and the room around it."), a few tasteful credibility signals (creators using it, club count). She downloads it. Friction point: standard App Store hesitation.

**First use (signup → first club).** Opens the app. Sees a clean welcome screen with the wordmark and one CTA: "Join a club" (primary) and "Start a club" (secondary). Taps Join a club. She's offered three things: (1) the public club run by the BookTok creator, since she came from that link, (2) a small set of suggested public clubs reading books in genres she selects in a quick onboarding, (3) "Have an invite? Paste it here." She joins the BookTok creator's club. She's in. Total time: ~90 seconds.

**Magic moment (first reading session).** She opens the book inside Flipbook. Reads chapter 1 on the way home. As she finishes a paragraph she loves, a small reaction (a highlight + a 4-word comment from another club member) fades into the margin next to the same paragraph. She taps it, sees three other reactions. Drops her own reaction. Two minutes later, on the next paragraph, someone replies to her. *That's the magic moment.* She closes the app smiling. She is now a Flipbook user.

**Habit formation (week 1–4).** She reads in the app three times a week. The progress bar of her club (a soft, non-anxious visual showing where the median reader is) becomes a gentle pull — she's slightly ahead, slightly behind, in sync. She finishes the book — the first one she's finished in months — and the club opens its next selection. She invites two friends from her group chat. They join. She is now a moderator-in-the-making.

**Advocacy.** Around month 2, she posts a TikTok about Flipbook unprompted. Her two friends invite their own friends. She converts to Pro at month 2 to unlock unlimited clubs (she's now in three). She is the early user the product was built for, and she's pulling new users with her.

**Friction points at each stage:**
- *First use:* If onboarding asks too many genre questions, she bounces. Cap at 3 questions.
- *Magic moment:* If the first chapter she reads has zero margin reactions yet, the magic doesn't happen. Mitigation: seed the first 1–2 chapters of every onboarding-suggested club with reactions from beta users.
- *Habit formation:* If progress visualization feels like a streak/guilt mechanic, she churns. Ours has to feel ambient and supportive.
- *Advocacy:* If sharing a club is a 5-tap process, the viral loop dies. Sharing a club must be one tap → native share sheet.

-----

## 3. Product Strategy

### Product Principles

1. **The page is the unit of conversation.** Every reaction, comment, and highlight is anchored to a specific page (and ideally a specific paragraph). When you scroll backwards, the conversation scrolls with you. When you scroll forward, you don't see what's ahead — no spoilers.
2. **Progress is visible, never weaponized.** A club shows you where the median member is, and where you are relative to them. There are no streaks. No guilt push notifications. No "you're falling behind" copy. The product helps you keep up; it never punishes you for not.
3. **Moderators are the infrastructure.** Power users — moderators — are the people we design for second, after the primary reader. The moderator tooling has to make creating a club feel like creating a WhatsApp group, and make running one feel rewarding without being effortful.
4. **Creators get a community, not a CMS.** When creator publishing ships in Phase 2, the surface a creator sees is *their reading community* — not a publishing dashboard. Publishing chapters happens *inside* the community surface, alongside seeing who's reading and replying to fans.
5. **Mobile is sacred. Web is utility.** The reading experience never crosses to web. Web only ever holds creator dashboards, invite landing pages, and shareable previews — Phase 2.
6. **Every screen earns its existence.** We delete more than we add. If a feature doesn't make the magic moment more reliable or the moderator's job easier, we don't ship it.

### Market Differentiation

The social reading category has been calcified for over a decade. Goodreads has been frozen since the Amazon acquisition. The newer entrants (StoryGraph, Fable, Hardcover) have taken the same paradigm — the book as an entry in a log — and made it prettier. None of them have rebuilt the primitive.

Flipbook's bet is that the primitive is wrong. Reading isn't a log entry; it's a real-time activity. The conversation that's been missing isn't a discussion thread tied to a finished book — it's a margin reaction tied to a paragraph someone just read. That requires a real-time backend (which is why we picked Convex), an in-app reading surface (which is why this can't be a web wrapper around Goodreads), and a moderator-led club model that feels like a group chat (which is why we're WhatsApp-easy to onboard).

Why this matters to Maya: every existing product makes her feel like reading is something she does alone and reports on later. Flipbook makes her feel like reading is something she does with people who are right there, page-by-page. That's not a feature difference — that's a category difference.

Why it's defensible: the real-time social layer compounds. Each new reader makes existing books more alive. Each active club makes the platform a more interesting place for the next reader. Each creator (Phase 2) brings their audience and converts them into a sub-community. The graph is a network effect; the experience is a craft moat. Goodreads can't ship this without rebuilding the product. Fable would have to gut its content-feed paradigm. We're starting from the right primitive.

### Magic Moment Design

**The magic moment:** A reader is following an indie author on Flipbook. The author drops a new chapter. The reader opens it, reads it in-app, and on the last page sees other subscribers' reactions appearing live in the margins. They reply. The author replies back. They're inside a release party that didn't exist before.

**For this to happen reliably in MVP, we need:**

- **Creator publishing (free in MVP).** Authors can publish chapters and notify subscribers. Monetization is Phase 2; the magic moment doesn't depend on payment.
- **Push notification on new chapter drop.** Subscribers get a single, well-crafted notification: "*[Author] just dropped Chapter 4 of [Book Title]. Open to read.*"
- **In-app reading with live reactions.** When the reader opens the chapter, the reading surface has to render the page with reactions appearing in real time as other subscribers read.
- **Author presence.** The author needs to be a visible participant in the reading session — their reactions are tagged with an "Author" badge; they can reply to subscribers.
- **Real-time backend.** Convex handles the live margin reactions natively; this is the key reason we chose it.

**Shortest path from sign-up to magic moment:** ~7 minutes. Sign up (90s) → Browse and follow at least one creator publishing on Flipbook (90s) → Receive a chapter drop within 1–7 days → Open the chapter and read (4 minutes for an 800-word chapter) → Drop a reaction → See others' reactions appearing live.

**Risk:** if no creator drops a chapter in the user's first week, the magic moment is delayed and onboarding loses its punch. **Mitigation:** seed the closed beta with 3–5 creators publishing on a known weekly cadence. Onboarding asks the new user to follow at least one creator with a recent drop, so the magic moment is achievable in the user's first session.

**Supporting moments** (also in MVP, for users who don't immediately hit the creator-drop magic moment): synchronized chapter reactions inside a club (a reader reacts to a paragraph and sees other club members at the same point react too), and the "caught up to the club" rush (a new member reads to catch up and finds dormant reactions lighting up across pages they just finished).

### MVP Definition

In scope. Buildable in 6–8 weeks of focused part-time work with Claude Code.

**Authentication and account creation.** Clerk-based signup with Apple Sign-In, Google, and phone OTP. Profile with display name, avatar, and reading preferences. Required to do anything on the platform.

**Club creation and invite-link onboarding.** A signed-in user can create a private club: name, optional description, optional book selection (PDF upload, default private). Generates a shareable invite link. Anyone tapping the link, after signup, is auto-added to the club. This is the WhatsApp-easy core flow.

**Private PDF upload and in-app reading.** Moderators upload a PDF; it's stored in Convex file storage and linked to the club. Members can open it in an in-app PDF reader (using a React Native PDF library) with offline support — once opened, the file is downloaded to the device and remains readable without connection. Progress is tracked page by page and synced when online.

**Page-keyed reactions and comments.** While reading, a user can long-press a paragraph (or page, depending on PDF text-extraction capability) to leave a reaction (emoji set: ~6 curated emojis, no full picker) or a short comment (≤200 characters). Other club members reading the same page see these reactions appear in the margin. Reactions are revealed as a member reaches the page — never spoiled ahead.

**Club progress visibility.** A club view shows: each member's current page (with a soft visualization, not a leaderboard), the median reading position, and recent reactions across the book. No streaks, no public ranking.

**Creator publishing (free).** Authors can publish original chapters as their own "club" (a special club type — the author is the moderator, members are subscribers). Subscribers receive a push notification on new chapter drops. The reading and reaction model is identical to a regular club.

**Discovery feed.** A simple browseable list of public clubs and creators currently active on Flipbook. No algorithmic feed in MVP — sorted by activity (most recent reactions first), filterable by genre tags. Discovery exists primarily to help new users find their first club.

**Reader Pro tier.** Subscription via RevenueCat. Pro unlocks: more than three concurrent club memberships, advanced reading customization (font, theme), and offline downloads for unlimited PDFs. Free tier covers the core experience for Maya — Pro is for power users.

**Each MVP feature ties to either the magic moment or the moderator's ability to start a club. Anything that doesn't is out of scope.**

### Safety & Age Segmentation (required before public launch)

Flipbook intends to host **children's book clubs** — minors reading and discussing inside the app. The moment minors are present, onboarding stops being a growth funnel and becomes a **safety and compliance gate**. This is a strategic constraint, not a feature: it reshapes onboarding, discovery, invites, analytics, and live audio.

**The legal floor** (not legal advice — counsel review required before public/minor launch). Global App Store distribution from a Nigeria base means we inherit several regimes at once: **US COPPA** draws a hard line at **age 13** — no collection of a child's personal information without **verifiable parental consent (VPC)**, under the FTC's amended rule now in force (full-compliance deadline April 22, 2026). The **UK Children's Code** covers **everyone under 18** whenever minors are *likely to access* the service, demanding high-privacy defaults, data minimization, geolocation off, and no engagement nudges. The **EU** adds a 13–16 consent threshold. The defensible posture is to contain risk *structurally* rather than moderate it after the fact.

**The model.** A neutral date-of-birth gate forks new users into three lanes — **under-13**, **13–17**, **18+**. Adults flow through the normal onboarding. **Every minor is adult-provisioned into a walled garden**: a vetted guardian/educator places the child into one specific, private, moderated club, and the child lives entirely inside that boundary — no public discovery, no stranger contact, no open audio, display-name only, high-privacy defaults forced on. The two minor lanes differ only in consent depth (under-13 = full VPC; 13–17 = lighter guardian consent + Children's Code defaults). The core magic moment (live margin reactions) works identically and safely inside a closed club, so our differentiator never depends on the risky open surfaces.

**Sequencing.** The closed adult beta needs none of this. But the **age gate + 18/13-17 segmentation must ship before we open to the public**, because the Children's Code applies the instant minors are *likely to access* a public app. **Under-13 + VPC + children's-club tooling is staged** behind a kids-safety vendor (KWS or k-ID) and legal review, rolling out alongside the children's book-club push. See `prd.md` § 6B and `product-roadmap.md` Phases 9–10.

### Explicitly Out of Scope

**Creator monetization (paid subscriptions, one-time purchases).** Tempting because it's the long-term marketplace business. Why deferred: the magic moment works with free creator drops; building Apple/Google IAP plus Stripe Connect creator payouts is a 4-week distraction that doesn't make MVP better. **Reconsider:** Phase 2, after we've validated reader retention and creator interest. Likely months 3–4 post-MVP.

**Web companion / creator dashboard.** Tempting because creators want a bigger surface to manage their work. Why deferred: 100% of MVP magic happens on phones. Adding a web app doubles the engineering surface for marginal MVP benefit. **Reconsider:** Phase 2, alongside creator monetization.

**Licensed book catalog.** Tempting because moderators would prefer a built-in catalog over uploading PDFs. Why deferred: licensing books at MVP scale is expensive ($100k+) and requires legal infrastructure we don't have. The private-upload model is good enough for closed-club reads. **Reconsider:** Year 2, after we've raised a seed round and have user base to justify licensing economics.

**Ratings and reviews.** Tempting because every reading app has them. Why deferred: ratings are the Goodreads paradigm we're explicitly rejecting. The conversation is the value, not the score. **Reconsider:** never, unless data shows users explicitly demand it — and even then, we'd implement as a private feature, not a public score.

**Social graph (followers, friends).** Tempting because it's a standard social mechanic. Why deferred: clubs *are* the social unit; adding a followers graph creates parallel social loops that compete with the core. **Reconsider:** Phase 3+, only if user research reveals a genuine gap.

**Audiobook integration.** Tempting because audiobooks are a huge slice of reading time. Why deferred: audio sync to text is a hard technical problem, and our wedge user (Maya) is primarily a text reader. **Reconsider:** Year 2 if usage data shows audio demand.

**Algorithmic recommendation engine.** Tempting because every app has one. Why deferred: violates Product Principle 6 (we don't add things that don't make the magic more reliable). Discovery in MVP is human (active clubs, active creators). **Reconsider:** Year 2 only if growth requires algorithmic discovery.

**EPUB reader / native bookstore integration.** Tempting because PDFs are clunky. Why deferred: shipping a great PDF reader is hard enough; EPUB adds parser complexity and DRM concerns. **Reconsider:** Phase 3+, alongside licensed catalog work.

**System-theme auto-switching ("Match system" toggle).** Tempting because it's a standard mobile UX. Why deferred: Flip mode is too brand-specific to be auto-selected by an OS-level "dark mode" trigger — we need to learn how users actually pick between Flip and Dark before mapping system-dark to one of them. The three explicit theme modes (Light, Flip, Dark) ship at MVP via an in-app picker; auto-switching follows after user data. **Reconsider:** Phase 2 polish.

**Web companion landing pages for invite links.** Tempting because invites currently require app download. Why deferred: deep links via Branch.io or App Clips work for MVP. **Reconsider:** Phase 2 alongside web companion.

### Feature Priority (MoSCoW)

**Must Have (P0 — MVP launch).**

- Authentication (Clerk: Apple, Google, phone OTP)
- Profile creation and editing (display name, avatar, reading preferences)
- Club creation (name, description, PDF upload) — private only in MVP
- Invite link generation and link-tapping auto-join
- In-app PDF reader with offline support
- Page-by-page progress tracking, synced when online
- Page-keyed reactions (curated emoji set) and short comments
- Club view (member progress, recent reactions, book details)
- Creator publishing (chapters as a special club type — free in MVP)
- Push notifications for new chapter drops, replies to your reactions
- Discovery feed (active clubs, active creators — sorted by activity)
- Reader Pro tier (RevenueCat subscription, gates: >3 clubs, advanced reading customization, unlimited offline)

**Should Have (P1 — MVP launch if time permits, otherwise immediately post-launch).**

- **Age gate + age-tier segmentation (under-13 / 13–17 / 18+) — REQUIRED before public launch.** Neutral DOB gate, "minor mode" defaults (high-privacy, non-discoverable, no stranger contact), and minor-aware guards on invites, discovery, and analytics. Not needed for the closed adult beta; a hard gate on opening to the public. See `prd.md` § 6B, roadmap Phase 9.
- Streamlined adult onboarding — drop the real first/last-name step (display name only; data-minimization + less friction) and route new adults into first-club matchmaking instead of an empty home.
- In-app onboarding genre selection (3 questions max) for first-club suggestions
- Highlight (text selection on PDF) + reaction
- Reactions reveal animation as user reaches the page
- Author badge for creator reactions in their own publishing club
- Native share sheet for invite links

**Could Have (P2 — Phase 2 or later).**

- **Live review sessions (Phase 8 — fast-follow, the first thing after MVP launch).** Clubs schedule and hold live, Twitter Spaces–style review sessions: a host (the moderator, or a member granted hosting rights) goes live with real-time audio, members join to listen or request to speak (raise-hand), and a synchronized live text chat + reaction stream runs alongside the voice. Deliberately *not* in the launch MVP — it adds real-time audio infrastructure (a WebRTC provider on top of Convex) that would delay launch — but it's the highest-priority post-launch addition because it turns the async, page-keyed conversation into a scheduled synchronous ritual the community shows up for. Spec'd in full in `prd.md` (§ Live Review Sessions) and `product-roadmap.md` (Phase 8).
- **Children's book clubs + under-13 support (Phase 10 — staged).** Child-safe club type, guardian/educator provisioning, verifiable parental consent via a kids-safety vendor (KWS / k-ID), and under-13 enablement. Deliberately staged after the 13+ age gate (Phase 9) ships and after legal review — it's the heaviest compliance surface and shouldn't block public launch. The highest-intent reason to build it: it's what lets children's clubs hold activities safely inside Flipbook.
- Web companion (invite landing page, creator dashboard)
- Creator monetization (paid subscriptions, one-time purchases) via Polar / Stripe Connect
- System-theme auto-switching (the "Match system" toggle that maps OS dark mode to either Flip or Dark)
- Reading customization beyond basic (themes, more fonts)
- Reader stats (private only — books finished, pages read, time spent)
- Reading goals (private, gentle — "I want to finish 12 books this year")
- App Clips / Branch.io for richer invite-link previews

**Won't Have (this product cycle).**

- Public book ratings or reviews
- Public follower graph
- EPUB / DRM'd ebook support
- Audiobook integration
- Licensed catalog
- Algorithmic recommendation engine
- Comments threading deeper than 1 level (replies to reactions are flat)

### Core User Flows

**Flow 1: Reader joins a club from an invite link (the WhatsApp-easy flow).**

Trigger: a friend or moderator shares an invite link via group chat / DM.

Steps: User taps the link → opens App Store if app not installed (or app if installed) → after install, app deep-links back to invite → if not signed in, signup screen with one-tap Apple / Google / phone OTP → on signup completion, auto-added to the club → lands on the club view → sees the book, the other members, recent reactions, current chapter → taps "Start reading" → the book opens to the reader's current page (page 1 if they're new).

Outcome: User is in a club, reading. Total time from tap to first page open: under 2 minutes for a returning App Store user; under 3 minutes for a first-time install.

Success criteria: 70% of invite-link recipients who tap the link complete signup. 80% of signups open the book within 24 hours.

**Flow 2: Reader has the magic moment (reactions in the margin).**

Trigger: User is reading inside a club where other members are also reading.

Steps: User reads a paragraph → reaches a paragraph that already has 1+ reactions from members ahead of them on the page → reactions render in the margin (a small icon + count) → user taps to expand → sees the comments → drops their own reaction (long-press the paragraph → emoji picker) → another member replies in real-time → user receives haptic feedback / subtle visual confirmation.

Outcome: User experiences the social-reading moment for the first time. They feel they are inside the book with other people.

Success criteria: 70% of active readers leave at least one reaction in their first reading session. 50% of those receive a reply within 24 hours.

**Flow 3: Creator publishes a new chapter (Phase 2 magic moment supporting flow — but the chapter-drop notification is MVP).**

Trigger: A creator has finished writing a new chapter and uploads it to their publishing club.

Steps: Creator taps "Publish new chapter" in their club view → uploads the chapter (PDF or rich text → MVP: PDF only) → adds an optional author note → taps Publish → all subscribers receive a push notification ("[Author] just dropped Chapter 4 of [Book Title]") → subscribers tap notification → app opens directly to the new chapter → reading begins → as multiple subscribers open within minutes, their reactions appear live to each other.

Outcome: A small release party has spontaneously formed around a chapter drop. Author, fans, and reactions are co-located in real time.

Success criteria: 60% of subscribers open a chapter notification within 24 hours. 40% leave a reaction. The author replies to at least one reaction in their first chapter drop.

### Success Metrics

**Primary metric:** *Books finished per active reader, per 90 days.* This is the metric that proves Flipbook is solving the core problem. Maya's "finished a book" is the truest signal of value delivery. Good: 1.5 (a 50% lift over baseline). Great: 2.5+ (the user is in active club rotation and finishing one book/month).

**Secondary metrics:**
- *Active clubs (clubs with 1+ reactions in the last 7 days).* Good: 75 by day 90. Great: 200+.
- *Magic moment hit rate.* Percent of new users who leave at least one reaction in their first session. Good: 50%. Great: 70%+.
- *Moderator retention (D30).* Percent of users who created a club still active in their club at day 30. Good: 40%. Great: 60%+.
- *Pro tier conversion (D60).* Percent of active readers who upgrade to Pro by day 60. Good: 3%. Great: 5%+.

**Leading indicators:**
- *Invite-link tap-to-signup conversion rate.* Below 50% is a red flag; the invite UX needs work.
- *Time to first reaction.* If new users take >1 hour from signup to first reaction, the seed-content or club-suggestion flow is failing.
- *Chapter-drop open rate (creator pubs).* Below 40% within 24 hours suggests notification copy or timing is off.

### Risks

**Market risk: Reader retention falls off after the first book.** A user joins a club, finishes a book, and the next book the club picks doesn't excite them. Likelihood: medium. Impact: high — kills the long-term user. Mitigation: cross-club discovery (Maya can see what other clubs are reading), and easy "leave this club, join another" flows. Track book-2 retention as a KPI.

**Execution risk: Real-time reactions are technically harder than expected on mobile.** Likelihood: medium. Impact: high — the magic moment doesn't fire cleanly. Mitigation: prototype the reactions surface in week 2 of build, before any other UI work; if Convex + RN don't deliver the perceived live experience, reset scope before too much else is built on top.

**Legal risk: Private PDF uploads attract DMCA takedowns at scale.** Likelihood: medium. Impact: medium — manageable if handled cleanly (DMCA process), existential if mishandled (platform shutdowns, App Store removal). Mitigation: implement DMCA takedown flow before public launch; private-by-default reduces exposure; never index user uploads in search.

**Execution risk: Founder burnout / bandwidth.** ~10–15 hr/week each + day jobs + Nigerian financial constraints + ambitious 6-month vision. Likelihood: medium (reduced from prior solo-founder estimate). Impact: high. Mitigation: the two-cofounder split is the primary mitigation — Moks owns product/vision/growth, Ayodeji owns operations/process/BD, so neither carries the whole load and the extroverted networking work no longer falls on an introverted designer. Plus: ruthless MVP scoping (this doc); each phase produces a demoable increment for motivation hits; explicit Phase 2 deferrals; CodeRabbit + Claude Code reduce review burden. Residual risk: a two-person team has no slack if one cofounder is unavailable — keep scope honest and timelines conservative.

**Market risk: Apple/Google rules shift on creator monetization.** App Store rules around what's monetizable in-app evolve. Likelihood: low-medium. Impact: medium for Phase 2. Mitigation: route creator monetization via web checkout (Polar / Stripe) to avoid Apple/Google's 30% on creator revenue. Standard pattern (Patreon, Spotify, Substack).

**Market risk: Goodreads or Amazon ships a competing live-reading feature.** Likelihood: low (Amazon is glacial); but if they did, impact would be high. Mitigation: brand and craft moat — even if Amazon shipped a clone, Flipbook's specificity to the wedge audience is a defensible position.

**Execution risk: Nigerian payment infrastructure for creator payouts (Phase 2) is harder than expected.** Stripe Connect doesn't natively support Nigeria. Likelihood: high (this is a known issue). Impact: medium-high if many creators are Nigerian-based. Mitigation: by Phase 2, decide on incorporation jurisdiction (Stripe Atlas / Delaware C-Corp), or route Nigerian creator payouts via Wise, Paystack, or Flutterwave. Plan deliberately, don't scramble.

**Market risk: BookTok / Bookstagram seeding doesn't convert at expected rates.** Creators may seed clubs that get high views but low conversion. Likelihood: medium. Impact: medium — affects 90-day GTM targets. Mitigation: track seeded creator → user → active reader conversion explicitly; adjust seeding strategy at day 30 and day 60 based on what's working.

-----

## 4. Brand Strategy

### Positioning Statement

For accountability-craving readers in their 20s–40s who want the energy of a book club without the overhead, **Flipbook** is the *social reading platform* that makes finishing a book feel like a shared experience rather than a solo aspiration. Unlike Goodreads — a graveyard of past reviews — and unlike Discord book clubs that go quiet by week three, Flipbook ties the conversation to the page itself, so the community stays alive as long as someone is reading.

### Brand Personality

If Flipbook were a person: she's the friend who ran two book clubs in college, works at an indie bookstore in her late 20s, has impeccable taste but never makes you feel uncool for not having read what she's read, and sends you a chapter she loved with one sentence in the message: "this part." She's bookish-modern with a cozy undertone — refined and confident, but also warm, generous, and a little playful. She knows reading is having a moment again and acts like it. She'd never use the word "platform" in a sentence. She'd never tell you you're "falling behind" on anything.

She'd dress like she could equally walk into a literary reading or a coffee shop without changing — clean lines, one bold color, nothing overdone. She'd talk in full sentences, never in marketing copy. She'd read everything from Murakami to Brit Bennett to a serialized novella from someone she met on the app, and treat all of them with equal care. She'd never shame anyone for what they read or how slowly they read it. But she'd also never water down what she thinks; she's confident, she's specific, she has opinions.

The brand should feel like a quiet vote of confidence in the user — that they are someone who reads, who has taste, who cares about ideas, who deserves a beautiful tool.

### Voice & Tone Guide

The voice is constant: **warm, generous, lightly clever, never cute, never gamified.**

The tone shifts slightly across contexts:

| Context | DO | DON'T |
|---|---|---|
| **Onboarding** | "Pick three books you've been meaning to read. We'll find you the right room." | "Welcome to your reading journey 📚✨ Let's get started!" |
| **Empty state (no clubs yet)** | "No clubs yet. Want to start one — or wait for one to find you?" | "You haven't joined any clubs. Tap below to get started." |
| **Empty state (no reactions yet on a page)** | "Be the first to react." | "No reactions yet. Be the first!" |
| **Success — finished a book** | "That's a wrap. Add a thought before it fades?" | "🎉 Congrats! You finished a book! Keep up the reading streak!" |
| **Error — upload failed** | "The book didn't quite make it. Try again?" | "Error 422: Upload failed. Please retry." |
| **Push notification — chapter drop** | "[Author] just dropped Chapter 4 of [Book]. The room's filling up." | "🔔 New chapter alert! Don't miss out!" |
| **Push notification — reply to your reaction** | "Toby replied to your reaction in [Book]." | "You have a new notification! Open the app to see." |
| **Marketing — landing copy** | "Read with the people who are reading right now." | "The future of social reading, reimagined." |
| **Settings / billing** | "You're on the Pro plan. Cancel anytime — we won't make it weird." | "Manage your subscription. Premium membership active." |
| **Confirmation — leave a club** | "Leave [Club Name]? Your progress stays with you. You can always come back." | "Are you sure you want to leave this club? This action cannot be undone." |

### Messaging Framework

**Tagline.** *Read together. Finish more. Talk on the page.*

**Homepage / App Store headline (primary).** *Read with the people who are reading right now.*

**Homepage / App Store subheadline.** *Flipbook turns books into living rooms — clubs you join in seconds, conversations tied to the page, and creators you follow into their next release.*

**Three value propositions.**

1. **Finish more.** Reading alongside other people — visibly, gently — is the difference between a book finished and a bookmark abandoned. Flipbook makes the "with people" part as easy as opening the app.
2. **Talk on the page.** Every reaction, every comment, every reply lives next to the paragraph that prompted it. No spoilers ahead, no ghost-town discord channels — the conversation is right where you are in the book.
3. **Follow the writers, not the algorithm.** Indie authors and serialized novelists publish on Flipbook and turn their readers into communities. When they drop a new chapter, you're in the room — not just on a mailing list.

**Feature descriptions (in brand voice).**

- *Clubs in seconds:* "Make a club like a group chat. Invite by link. Read together."
- *In-app reading with offline:* "Open a book inside Flipbook. Read on the train. We'll catch up when you do."
- *Reactions on the page:* "Long-press a paragraph. Drop a reaction. Watch the room reply."
- *Live chapter drops:* "When a creator drops a chapter, you'll know. The room opens."
- *Pro for the obsessed:* "More clubs, more offline, more reading. For the people who finish."

**Objection handlers.**

- *"I have a Goodreads account."* — "Goodreads is for the books you've finished. Flipbook is for the book you're reading right now."
- *"I tried Discord book clubs."* — "Same here. They die in three weeks because the conversation isn't tied to the book. Flipbook fixes that."
- *"I prefer reading alone."* — "You still can. Solo reading works. The clubs are there when you want them."
- *"I'm not a 'big reader.'"* — "Most of our users finish more in their first month than in the previous six. Showing up alongside other people changes how it feels."

### Elevator Pitches

**5-second pitch.**
*"Flipbook is where book clubs read together in real time."*

**30-second pitch.**
*"Flipbook is a social reading app where book clubs read together in real time — you create a club like you'd create a WhatsApp group, invite your friends, and as everyone reads, reactions and comments appear in the margins of the book on the page they're on. It also lets indie authors publish chapters and turn their readers into communities. We're starting on mobile, and we're building for the kind of reader who keeps trying to finish books and almost never does."*

**2-minute pitch.**

*Reading is one of the loneliest social activities people do. Most readers I know — myself included — buy books faster than they finish them, and the books they care about most are the ones they have nowhere to talk about. The existing tools don't fix it: Goodreads is a graveyard of past reviews, Discord book clubs die in three weeks, IRL clubs collapse under scheduling, and Substack is great for creators but terrible for readers wanting to discuss a chapter with strangers.*

*Flipbook is a social reading platform that fixes this by tying the conversation to the page itself. Readers create or join book clubs in seconds — like a WhatsApp group — and as they read inside the app, reactions and comments appear in the margins, page by page. No spoilers ahead, no dead forums, no scheduling. The platform also lets indie authors publish chapters and turn their readers into communities — when an author drops a new chapter, subscribers get a notification, open the chapter, and find themselves in a live reading room with the author and other fans.*

*The wedge is the reader. The flywheel is the creator. Mobile first, web companion later. Convex for the real-time backend, Clerk for auth, RevenueCat for the reader Pro tier. Creator monetization comes in Phase 2.*

*Why now: Reading is having a cultural moment — BookTok pulled 100M+ users into bookish content, Substack proved readers will pay creators directly, and Discord proved community can outlast a single content moment. Nobody has put these three together for the actual reading experience.*

*Why me: I've been a product designer for five years in healthcare — a domain that taught me how to build for trust, retention, and behavior change. I've been a member of several book clubs. I've abandoned every reading app on the market. I'm building the one I wished existed.*

*The ask depends on the audience — a closed beta seat, an early creator partner, or feedback on the prototype.*

### Competitive Differentiation Narrative

The social-reading category is full of products that are either ten years late or one half-step away from getting it right. Goodreads is the largest reading community on the internet and the worst-designed product in the category — Amazon hasn't shipped meaningfully on it in a decade, and it shows. StoryGraph is the gold standard for personal tracking but has explicitly chosen not to be a community product. Fable has the right instinct (clubs, in-app reading) but builds it on a content-feed paradigm that makes everyday clubs feel secondary to celebrity ones.

Flipbook makes a different bet: that the primitive is wrong across the category. Books aren't shelf entries; they're activities that happen in real time. The right unit of social isn't a finished review; it's a margin reaction tied to the paragraph someone just read. We've built around that — Convex for true real-time backend, an in-app reader where reactions render as you reach a page, a moderator-led club model that feels like a group chat. None of the incumbents can ship this without rebuilding their product. We start at the right primitive.

The two-sided model compounds this advantage. Creator monetization (Phase 2) gives indie authors and serialized writers a home that Substack + Discord + Patreon can't match — readers don't just subscribe, they show up to read together. Each new creator brings their audience; each reader becomes a candidate for follow-on creators. The graph gets denser. The conversation gets richer. The platform becomes harder to leave.

### Brand Anti-Patterns

**Never feel like Goodreads (or any 2008 forum).** No flat threaded discussions, no review counts as primary UI, no avatar-and-text grid layouts, no average-rating-out-of-five as a primary surface. The book metadata (ISBN, edition codes, page counts in the abstract) never leads the experience.

**Never gamify reading.** No streaks-as-anxiety. No owl shame. No leaderboards. No "you're in the top 10% of readers this month" badges. No push notifications guilting users into opening the app. Progress is visible and ambient — never weaponized.

**Never feel like a content feed.** No infinite scroll on the home screen. Flipbook is a place — a library, a club, a nightstand — not a timeline. No algorithmic recommendations as primary discovery. No engagement-on-engagement surfaces (likes-on-likes, follower counts as status).

**Never feel like Substack-on-mobile.** No email-first flows. No newsletter aesthetic. The reading happens in the app, the conversation happens on the page, the creator-reader connection happens inside the community surface — not in an inbox.

**Never feel cheap.** No generic stock photography of a person reading by a window. No AI-generated illustrations. No auto-generated book covers. No emoji garlands in headers. No "Welcome to your reading journey" copy.

**Never use the word "platform" in user-facing copy.** Never use "leverage," "synergy," "solution," "ecosystem," "powered by," or "reimagined." Never end a sentence with an exclamation point in a notification.

**Never crowd a screen.** Every page earns its real estate. If you can't justify why something is on the screen, it isn't. White space is part of the brand.

**Never make the user feel behind.** No "you're falling behind" copy. No "your friends are reading more than you." If a club has moved past a member, the copy is gentle ("Toby is on chapter 4 — the room is just ahead of you") and the action is forward-leaning, not shame-driven.

-----

## 5. Design Direction

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
| Charcoal | `#121212` | `--color-bg-dark` | `bg-dark` | Dark mode primary background (Phase 2) |

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

**Font loading.**

```javascript
// expo-font setup (load at app boot)
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Raleway-Medium': require('./assets/fonts/Raleway-Medium.ttf'),
  'Raleway-SemiBold': require('./assets/fonts/Raleway-SemiBold.ttf'),
  'Raleway-Bold': require('./assets/fonts/Raleway-Bold.ttf'),
  'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
});
```

**Type scale (rem-style scale for design-doc clarity; React Native uses raw px).**

| Token | Family | Weight | Size | Line | Letter | Use |
|---|---|---|---|---|---|---|
| `display-lg` | Raleway | 700 | 32px | 1.2 | 0 | Marketing screens, splash |
| `display-md` | Raleway | 700 | 26px | 1.2 | 0 | Major screen titles |
| `heading-lg` | Raleway | 600 | 22px | 1.3 | 0 | Section headers |
| `heading-md` | Raleway | 600 | 18px | 1.3 | 0 | Card titles, club names |
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

**Responsive breakpoints (Phase 2 web companion).**
- Mobile: < 640px (default)
- Tablet: 640–1024px
- Desktop: > 1024px

### Component Philosophy

**Buttons.** Pill-shaped or rounded-rectangle (8–12px radius). Three primary variants: **Primary** (Deep Indigo background, white text — for confirmations and main CTAs), **Secondary** (Vibrant Coral background, white text — for special social/community CTAs like "Join club" or "Drop a chapter"), and **Alt** (text-only, coral text on transparent — for tertiary actions). Each variant has default/hover/pressed/muted states (the Figma library has all four explicitly defined).

Buttons feel substantial but not chunky — 44px height for default, 36px for compact, 52px for primary screen CTAs. No drop shadows on buttons; reserve shadows for elevated surfaces.

**Cards.** Rounded corners (12px), subtle shadow (soft, 0 2px 8px rgba(0,0,0,0.04)) on a near-white surface. Border treatment is rare — we lean on shadow and surface contrast instead. Cards for clubs and books prioritize the cover image (hero), with title in `heading-md` Raleway and meta in `ui-label-md` Inter underneath.

**Inputs.** 1px border (Surface Border `#b4bfed`), 8px radius, 16px internal padding, default 48px height. Placeholder in Text Muted; entered text in Text Primary. Focus state: border thickens to 2px in Deep Indigo 700. No shadows on inputs.

**Tags / chips.** Pill-shaped (full radius), 24–28px height, 10–12px horizontal padding. Two variants: **filled** (Deep Indigo 300 background, Deep Indigo 900 text — for genre tags and metadata) and **outlined** (transparent background, 1px border, primary text — for filters).

**Modals / sheets.** Bottom sheets are the default on mobile; full-screen modals only when the content is the focus (e.g., reading view). Sheets have a 16px top radius, 24px internal padding, and a small top handle (4px tall, 32px wide, gray-2 fill).

**Border radius strategy.** 8px (inputs, small surfaces), 12px (cards, sheets), 16px (large surfaces, modal frames), full (pills, chips). No 4px or 6px — keep the radius system disciplined.

**Shadow philosophy.** Use sparingly. Two defined shadows: `shadow-sm` (0 1px 4px rgba(0,0,0,0.04)) for default cards and `shadow-md` (0 4px 16px rgba(0,0,0,0.08)) for elevated surfaces (modals, floating action buttons). Never use four-direction box shadows or colored shadows.

### Iconography & Imagery

**Icon library:** Font Awesome 6 Pro (per the Figma design system) is preferred. If FA Pro licensing is unavailable, fall back to **Lucide React Native** (open source, MIT, comparable coverage). Icons are stroke-based, not filled, with consistent 1.5–2px stroke weight at 24px size. Inline icon size: 12–16px. Standalone icon size: 24px (default), 20px (compact), 32px (large).

**Imagery direction.**

- **Book covers are sacred.** They appear at scale, never cropped, never overlaid with copy if avoidable.
- **Photography (when used):** real, intimate, low-stimulation. Editorial-style images of books in real environments — never staged, never models pretending to read.
- **Illustration:** sparse. If used, hand-drawn-feeling line art in brand colors, never auto-generated, never "AI illustrated."
- **Avatars:** soft, real photos when users upload them. Initials-on-color fallbacks for users without avatars (color cycled from a defined palette).

**Never:** stock photography of "a person reading by a window," AI-generated illustrations, auto-generated book covers, emoji garlands, decorative gradients.

### Accessibility Commitments

**WCAG 2.1 Level AA compliance** is the floor for MVP, AAA for color contrast where feasible.

**Color contrast.** All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Verified pairings: Deep Indigo 900 on Surface Primary (8.6:1), Text Secondary `#464646` on Surface Primary (9.1:1), Vibrant Coral 500 on Surface Primary (4.6:1 — acceptable for large text and CTAs only). Body text never uses Vibrant Coral.

**Focus indicators.** Every interactive element has a visible focus ring (2px Deep Indigo 700, 2px offset). Focus order follows visual order. No "outline: none" without replacement.

**Touch targets.** Minimum 44x44px on all interactive elements (iOS HIG). Primary CTAs are 48x48px or larger. Tap zones extend beyond visible bounds where needed.

**Screen reader support.** All images have descriptive alt text or are marked decorative. All interactive elements have accessible labels (Buttons announce their action, not "button"). Reading view: each page is announced with chapter and page number; reactions are announced as "reaction by [user] on paragraph [N]: [text]." Dynamic content (live reactions appearing) uses ARIA live regions on web (Phase 2) and accessibility announcements on native.

**Motion.** Respect `prefers-reduced-motion` — animations either eliminated or reduced to opacity-only fades. Reading view never animates content into place when reduced motion is set.

**Type scaling.** Respect iOS Dynamic Type / Android font scale at 100–200% range. Layouts must reflow gracefully; no text clipped or truncated unintentionally.

**Captions / transcripts.** Any audio content (Phase 2 audiobook integration, if shipped) ships with full transcripts.

### Motion & Interaction

**Transition durations.** Default: 200ms. Quick (small UI feedback): 120ms. Slow (modal/sheet entry): 320ms. Never longer than 400ms.

**Easing.** Default: `cubic-bezier(0.4, 0.0, 0.2, 1)` (material standard). Entrance: `cubic-bezier(0.0, 0.0, 0.2, 1)` (decelerate). Exit: `cubic-bezier(0.4, 0.0, 1, 1)` (accelerate).

**What animates:** screen transitions, modal/sheet entry/exit, reaction appearance (subtle fade-and-scale, 200ms), button press states (8ms scale to 0.98), pull-to-refresh, page turns in the reading view (subtle horizontal slide, 240ms).

**What never animates:** typography (no animated text). Colors (instant on state change). Reading content — pages don't animate during a normal scroll.

**Hover/focus/active.** Mobile-first means hover is rare. Press states (active) are visible — buttons subtly compress and the surface darkens 8%. Long-press (for reactions) has a haptic pulse.

**Loading states.** Skeleton loaders are preferred over spinners for content-heavy screens (club lists, book lists). Spinners are reserved for blocking operations (uploads). Optimistic UI for reactions and comments — they appear instantly and reconcile if the server rejects.

**Live reactivity (the magic-moment animation).** When a reaction appears in the margin from another reader, it fades-in (160ms) with a subtle horizontal slide of 8px. Never bounces. Never pulses. The smallest possible motion that says "this is live."

### Design Tokens

Consolidated reference for implementation. Full structured set lives in `design-tokens.json` (sibling to this doc).

**Brand-constant tokens** (same across all three theme modes):

```css
/* Brand identity — constant across Light, Flip, Dark */
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

/* Semantic — constant */
--color-success: #3CAA6E;
--color-warning: #e4b363;
--color-error: #e51d1d;
--color-info: #5752b0;

/* Typography */
--font-primary: 'Raleway', system-ui, sans-serif;
--font-secondary: 'Inter', system-ui, sans-serif;
--font-icon: 'Font Awesome 6 Pro', sans-serif;

/* Spacing */
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

/* Radius */
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-pill: 9999px;

/* Motion */
--duration-quick: 120ms;
--duration-default: 200ms;
--duration-slow: 320ms;
--easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);
--easing-entrance: cubic-bezier(0.0, 0.0, 0.2, 1);
--easing-exit: cubic-bezier(0.4, 0.0, 1, 1);
```

**Mode-dependent semantic tokens** (these are the values that swap per theme):

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

Note: the Flip and Dark mappings above are starting defaults based on the Figma designs — the coding agent should verify each surface against the Figma frames during build (Phase 0, TASK-008) and adjust if a specific Figma node uses a different value. The Figma file is the canonical source.

These tokens are the contract between design and engineering. Every implementation reference, every Tailwind config, every theme file in the React Native app should derive from this set. The `design-tokens.json` file alongside this doc holds the full structured set in a machine-readable format and should be the source of truth for codegen.
