# PRD — Flipbook

**Version:** v2.1 (August 15, 2026 — FR-112 revised per growth-ideology change; v1 interim EPUB/multi-genre noted in § 9)
**Companion docs:** `product-vision.md`, `product-roadmap.md`, `go-to-market.md`, `model-math.md`, `vision.json`, `design-tokens.json`
**Change note:** v2.0 is a business-model pivot. The `books` model shifts from user-uploaded PDFs to a centrally-licensed catalog of EPUBs rented for 4-week periods. Author onboarding, royalty statements + payouts, Flipbook Pro subscriptions, Flipbook Specials, and neural-TTS audio narration are all new surfaces. Course communities (educator surface) are added as a bounded extension of the community primitive. Payment rails add Paystack (NGN) alongside the existing RevenueCat for Pro subscriptions.

---

## 1. Overview

### Product Summary

**Flipbook** is a book-rental app with community built in. Readers browse a curated catalog of world classics and African indie voices, rent titles for 4-week periods at prices between ₦500 and ₦4,000, and read them inside a purpose-built in-app EPUB reader. Every book supports optional communities — invite-only book clubs where reactions and comments appear in the margins next to the paragraph that prompted them. A Flipbook Pro subscription unlocks unlimited public-domain rentals, curated Flipbook Specials, neural-TTS audio narration, a 15% discount on Bands B/C/D, and community-creation rights. Authors keep 70% of every rental. Educators can create bounded course communities with roster invites and reading lists — a reading-shaped extension of the community primitive, never an LMS. The MVP ships on iOS and Android via Expo (React Native).

### Objective

This PRD specifies the MVP scope needed to reach the goal in `docs/model-math.md`: **first paying reader by October 13, 2026**, monthly cash breakeven at roughly 1,375 active users + 95 Pro subscribers, and a 12-month path to ~5,000 active users and ~₦1.87M/mo net contribution. Anything outside MVP is deferred to Phase 2 or later.

### Market Differentiation

The technical implementation must deliver on three product moments:

1. **Rental checkout under 45 seconds** for a returning user with a saved card. Every additional second of friction visibly reduces conversion.
2. **In-margin reactions on the page.** Reactions and comments are anchored to specific paragraphs on specific pages of specific EPUB titles, revealed only as a reader reaches them, and rendered live via Convex reactive queries.
3. **Author royalty statements delivered on time, every month.** Monthly cron generates statements, statements email by the 15th of the following month, payouts initiated within 48 hours of statement generation. Missing this promise is a founder-reputation risk that undoes years of trust.

### Magic Moment

A reader in Lagos rents *Nearly All the Men in Lagos Are Mad* for ₦1,500. Her sister in Abuja rents it the same day. They form a two-person community. As each reads Chapter 4, the other's reactions bloom in the margin — a wry ♥ next to the funniest paragraph, a *"wait, what?"* next to the twist. Two weeks later they've finished the first book they've ever finished together. The author has earned ₦2,100 across the two rentals. Both readers are shopping for what to rent next.

**Technical requirements for the magic moment to fire reliably:**

- **Rental checkout success rate ≥88%** on Nigerian cards after rebill logic.
- **Cold-start app launch under 3s** on a mid-tier Android device.
- **First-rental to first-open under 10s** — the book has to be in the reader's hand almost instantly after payment confirms.
- **Reaction round-trip latency under 500ms p95** via Convex reactive queries.
- **In-app EPUB reader handles 200–400 page books without jank.** Page turns under 200ms.
- **Community reactions render as the reader reaches each page** — never spoiling ahead.

### Success Criteria

- All P0 functional requirements (FR-001 through FR-NN in § 4) implemented and verified.
- End-to-end rental happy path (signup → browse → rent → read → react → finish) verified on iOS and Android.
- App passes App Store and Play Store review.
- Reaction round-trip latency p95 under 500ms in staging.
- Author royalty statement generation runs successfully for a synthetic dataset before first real author onboards.

---

## 2. Technical Architecture

### Stack Overview

- **Mobile app:** Expo (React Native), TypeScript.
- **Backend:** Convex (queries, mutations, actions, HTTP endpoints, scheduler, file storage).
- **Auth:** Clerk (Apple, Google, phone OTP).
- **Subscriptions:** RevenueCat (App Store + Play Store Pro subscription entitlements).
- **Local payments:** Paystack (NGN rental checkout, Paystack Transfers for author NGN payouts).
- **International payments (Year 2):** Stripe (USD rental + Pro checkout for diaspora readers).
- **Author payouts (USD):** Wise or PayPal.
- **TTS:** OpenAI TTS (general catalog, ~$6/book pre-generated at ingestion), ElevenLabs (Flipbook Specials, ~$50/book).
- **EPUB rendering:** react-native-readium or @readium/navigator-web via react-native-webview (evaluate at TASK-023).
- **PDF rendering (course materials):** react-native-pdf.
- **Push notifications:** Expo Push Notifications → APNs/FCM.
- **Analytics:** Convex logs + simple in-app event tracking; PostHog free-tier evaluated at Phase 2.
- **Error tracking:** Sentry free tier.

### High-Level Data Flow

```
Mobile app ──── Convex client SDK ──── Convex functions
                                              │
                                              ├── Convex Database (queries + mutations)
                                              ├── Convex File Storage (EPUBs, TTS audio, covers)
                                              ├── Convex Scheduler (cron jobs: royalty statements, rental expiries)
                                              └── HTTP actions (Paystack webhooks, TTS ingestion callbacks)

Paystack ──── HTTPS webhook ──── Convex /webhooks/paystack ──── recordRental / retryPayment
RevenueCat ─ HTTPS webhook ──── Convex /webhooks/revenuecat ── updateProEntitlement
OpenAI/ElevenLabs ─ scheduled action ──── uploads generated audio to Convex Storage
```

### Environments

- **Local dev.** `npx convex dev` per developer; Clerk + Paystack + RevenueCat all in test mode.
- **Staging.** Convex deployment `flipbook-staging`; Clerk staging keys; Paystack test keys; RevenueCat sandbox; separate App Store TestFlight / Play Internal Testing tracks.
- **Production.** Convex `flipbook-prod`; Clerk prod; Paystack live; RevenueCat production; public App Store / Play Store builds.

### Repository Layout

```
flipbook/
├── App.tsx                    # Expo entry
├── app.json                   # Expo config
├── src/
│   ├── screens/               # Screen components (Catalog, Reader, Community, Profile, Settings, Author)
│   ├── components/            # Reusable UI (BookCard, ReactionMargin, PayButton, PriceTag)
│   ├── lib/                   # Client-side helpers (theme, formatting, deep links)
│   └── hooks/                 # useConvex hooks, useRental, useCommunity
├── convex/
│   ├── schema.ts              # (rewritten in this doc)
│   ├── auth.config.ts         # Clerk integration
│   ├── users.ts               # user CRUD, profile
│   ├── catalog.ts             # book browsing, search, filters
│   ├── rentals.ts             # rental checkout, expiry, renewal
│   ├── subscriptions.ts       # RevenueCat webhooks, Pro state
│   ├── communities.ts         # community CRUD, invites (was clubs.ts)
│   ├── memberships.ts         # membership CRUD (largely preserved from v1)
│   ├── reactions.ts           # in-margin reactions (largely preserved from v1)
│   ├── progress.ts            # reading progress (largely preserved from v1)
│   ├── notifications.ts       # push notifications
│   ├── authors.ts             # author onboarding, book upload, royalty statements
│   ├── payouts.ts             # Paystack Transfers + Wise/PayPal payout ops
│   ├── specials.ts            # Flipbook Specials curation
│   ├── audio.ts               # TTS ingestion pipeline
│   ├── courses.ts             # course community extension (educator surface)
│   ├── http.ts                # Paystack + RevenueCat webhooks (existing)
│   ├── waitlist.ts            # existing pre-launch waitlist
│   └── lib/                   # server helpers (admin gates, invite codes, email assets)
├── docs/                      # This doc + companions
└── convex/_generated/         # Codegen
```

---

## 3. Data Model

**Convex schema (v2).** Preserved from v1: `users`, `memberships`, `reactions`, `progress`, `notifications`, `waitlist`. Redesigned or new: `books` (now catalog-centric), `bookAuthors`, `authorAccounts`, `rentals`, `subscriptions`, `communities` (renamed from `clubs`), `courses`, `audioAssets`, `royaltyStatements`, `payouts`, `contentReports`.

```typescript
// convex/schema.ts (v2, illustrative — full file lives in code)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ————— IDENTITY —————
  users: defineTable({
    clerkId: v.string(),
    displayName: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    country: v.optional(v.string()),            // ISO 2-char; used for FX + payment rail routing
    currency: v.union(v.literal("NGN"), v.literal("USD")),
    genres: v.array(v.string()),
    dateOfBirth: v.optional(v.number()),         // epoch millis
    ageLane: v.union(v.literal("adult"), v.literal("teen"), v.literal("child"), v.literal("unknown")),
    pushToken: v.optional(v.string()),
    proTier: v.union(v.literal("free"), v.literal("monthly"), v.literal("quarterly"), v.literal("annual")),
    proExpiresAt: v.optional(v.number()),
    notificationPrefs: v.optional(v.object({
      chapterDrops: v.boolean(),
      reactionReplies: v.boolean(),
      rentalExpiring: v.boolean(),
      proRenewalReminders: v.boolean(),
    })),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_display_name", ["displayName"])
    .index("by_last_active", ["lastActiveAt"]),

  // ————— CATALOG —————
  books: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    coverImageStorageId: v.id("_storage"),
    epubStorageId: v.id("_storage"),
    epubPageCount: v.number(),
    languageCode: v.string(),                    // "en", "ig", "yo"
    genreTags: v.array(v.string()),
    source: v.union(
      v.literal("public_domain"),
      v.literal("indie_author"),
      v.literal("small_publisher"),
    ),
    licensedFrom: v.optional(v.string()),
    rentalBand: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    isPublished: v.boolean(),
    isRemoved: v.boolean(),
    isSpecial: v.boolean(),
    specialsWindowEndsAt: v.optional(v.number()),
    audioOptOut: v.boolean(),
    audioStatus: v.union(v.literal("none"), v.literal("pending"), v.literal("ready"), v.literal("failed")),
    audioNarrator: v.optional(v.union(v.literal("openai"), v.literal("elevenlabs"))),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published_created", ["isPublished", "createdAt"])
    .index("by_band_published", ["rentalBand", "isPublished"])
    .index("by_source", ["source"])
    .index("by_special_window", ["isSpecial", "specialsWindowEndsAt"])
    .searchIndex("search_books", {
      searchField: "title",
      filterFields: ["isPublished", "rentalBand", "source"],
    }),

  bookAuthors: defineTable({
    bookId: v.id("books"),
    authorAccountId: v.id("authorAccounts"),
    role: v.union(v.literal("author"), v.literal("co_author"), v.literal("translator"), v.literal("editor")),
    revenueSharePct: v.number(),                 // sums to <= 70 across all bookAuthors rows for this book
    createdAt: v.number(),
  })
    .index("by_book", ["bookId"])
    .index("by_author", ["authorAccountId"]),

  // ————— AUTHORS & PAYOUTS —————
  authorAccounts: defineTable({
    userId: v.optional(v.id("users")),
    legalName: v.string(),
    penName: v.optional(v.string()),
    email: v.string(),
    emailLower: v.string(),
    country: v.string(),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    payoutCurrency: v.union(v.literal("NGN"), v.literal("USD")),
    paystackRecipientCode: v.optional(v.string()),
    wiseRecipientId: v.optional(v.string()),
    paypalEmail: v.optional(v.string()),
    termSheetVersion: v.string(),
    signedAt: v.number(),
    isActive: v.boolean(),
    isFoundingCohort: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["emailLower"])
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  royaltyStatements: defineTable({
    authorAccountId: v.id("authorAccounts"),
    periodStart: v.number(),
    periodEnd: v.number(),
    rentalCount: v.number(),
    grossRentalRevenue: v.number(),               // NGN kobo (minor units)
    authorShare: v.number(),
    payoutCurrency: v.union(v.literal("NGN"), v.literal("USD")),
    payoutAmount: v.number(),
    fxRate: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("finalized"),
      v.literal("email_sent"),
      v.literal("paid"),
      v.literal("failed"),
    ),
    finalizedAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    payoutId: v.optional(v.id("payouts")),
    breakdown: v.string(),                         // stringified JSON — per-book, per-day
    createdAt: v.number(),
  })
    .index("by_author_period", ["authorAccountId", "periodStart"])
    .index("by_status", ["status"]),

  payouts: defineTable({
    authorAccountId: v.id("authorAccounts"),
    royaltyStatementId: v.id("royaltyStatements"),
    method: v.union(v.literal("paystack"), v.literal("wise"), v.literal("paypal")),
    amount: v.number(),
    currency: v.union(v.literal("NGN"), v.literal("USD")),
    externalReference: v.optional(v.string()),
    status: v.union(
      v.literal("initiated"),
      v.literal("processing"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("reversed"),
    ),
    initiatedAt: v.number(),
    completedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    retryCount: v.number(),
  })
    .index("by_author", ["authorAccountId"])
    .index("by_status_initiated", ["status", "initiatedAt"]),

  // ————— RENTALS —————
  rentals: defineTable({
    userId: v.id("users"),
    bookId: v.id("books"),
    band: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    listPrice: v.number(),                         // NGN kobo — what a Free user would have paid
    pricePaid: v.number(),                         // NGN kobo — after Pro discount if applicable
    currency: v.union(v.literal("NGN"), v.literal("USD")),
    startedAt: v.number(),
    expiresAt: v.number(),
    finishedAt: v.optional(v.number()),
    paymentSource: v.union(
      v.literal("paystack"),
      v.literal("stripe"),
      v.literal("pro_included"),                   // Band A free for Pro
      v.literal("specials"),                        // Flipbook Specials — free for Pro
    ),
    paystackReference: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    watermarkSeed: v.string(),                     // unpredictable, per-rental, used for invisible EPUB watermarking
    createdAt: v.number(),
  })
    .index("by_user_and_expires", ["userId", "expiresAt"])
    .index("by_book_and_started", ["bookId", "startedAt"])
    .index("by_paystack_reference", ["paystackReference"])
    .index("by_user_book_active", ["userId", "bookId", "expiresAt"]),

  // ————— SUBSCRIPTIONS —————
  subscriptions: defineTable({
    userId: v.id("users"),
    revenueCatUserId: v.string(),
    tier: v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("annual")),
    status: v.union(
      v.literal("active"),
      v.literal("in_grace_period"),
      v.literal("in_billing_retry"),
      v.literal("expired"),
      v.literal("cancelled"),
    ),
    priceCents: v.number(),                        // USD cents
    storeCountry: v.string(),
    autoRenews: v.boolean(),
    activatedAt: v.number(),
    expiresAt: v.number(),
    lastRenewalAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    lastWebhookAt: v.number(),
    lastWebhookEventId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_status_expires", ["status", "expiresAt"])
    .index("by_revenuecat_user", ["revenueCatUserId"]),

  // ————— COMMUNITIES (was clubs) —————
  communities: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("book"),           // formed around a single title
      v.literal("genre"),           // ongoing, genre-based
      v.literal("course"),           // educator surface — see courses table for extended props
      v.literal("private"),           // friend-group club
    ),
    visibility: v.union(v.literal("private"), v.literal("public"), v.literal("unlisted")),
    moderatorId: v.id("users"),
    bookId: v.optional(v.id("books")),
    coverImageUrl: v.optional(v.string()),
    permissions: v.object({
      membersCanInviteOthers: v.boolean(),
      membersCanPostBooks: v.boolean(),           // false for reader communities; may be true for course type per lecturer choice
    }),
    inviteCode: v.string(),
    memberCount: v.number(),
    isMinorSafe: v.boolean(),                      // true if all members are 18+
    createdAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_moderator", ["moderatorId"])
    .index("by_invite_code", ["inviteCode"])
    .index("by_book", ["bookId"])
    .index("by_visibility_activity", ["visibility", "lastActivityAt"])
    .index("by_type_activity", ["type", "lastActivityAt"]),

  memberships: defineTable({
    communityId: v.id("communities"),
    userId: v.id("users"),
    role: v.union(v.literal("moderator"), v.literal("member"), v.literal("lecturer"), v.literal("student")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_community", ["communityId"])
    .index("by_user", ["userId"])
    .index("by_community_and_user", ["communityId", "userId"]),

  // ————— COURSES (educator extension) —————
  courses: defineTable({
    communityId: v.id("communities"),
    lecturerAccountId: v.id("users"),
    institutionName: v.optional(v.string()),
    courseCode: v.optional(v.string()),
    termStartAt: v.number(),
    termEndAt: v.number(),
    requiredBookIds: v.array(v.id("books")),
    optionalBookIds: v.array(v.id("books")),
    materialsStorageIds: v.array(v.id("_storage")),
    rightsAcknowledgedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_lecturer", ["lecturerAccountId"])
    .index("by_community", ["communityId"])
    .index("by_term_end", ["termEndAt"]),

  // ————— REACTIONS (preserved from v1, adapted) —————
  reactions: defineTable({
    communityId: v.id("communities"),
    bookId: v.id("books"),
    page: v.number(),
    paragraphIndex: v.optional(v.number()),
    userId: v.id("users"),
    type: v.union(v.literal("emoji"), v.literal("comment")),
    emoji: v.optional(v.string()),
    text: v.optional(v.string()),
    parentReactionId: v.optional(v.id("reactions")),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_book_and_page", ["bookId", "page"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentReactionId"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  // ————— PROGRESS (preserved from v1) —————
  progress: defineTable({
    userId: v.id("users"),
    communityId: v.optional(v.id("communities")),
    bookId: v.id("books"),
    rentalId: v.id("rentals"),
    currentPage: v.number(),
    totalPages: v.number(),
    furthestPageReached: v.number(),
    finishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_and_community", ["userId", "communityId"])
    .index("by_book", ["bookId"])
    .index("by_rental", ["rentalId"]),

  // ————— AUDIO ASSETS —————
  audioAssets: defineTable({
    bookId: v.id("books"),
    chapterIndex: v.number(),
    chapterTitle: v.optional(v.string()),
    storageId: v.id("_storage"),
    provider: v.union(v.literal("openai"), v.literal("elevenlabs")),
    voice: v.string(),
    durationSeconds: v.number(),
    generatedAt: v.number(),
  })
    .index("by_book_chapter", ["bookId", "chapterIndex"]),

  // ————— NOTIFICATIONS (preserved from v1) —————
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("chapter_drop"),
      v.literal("reaction_reply"),
      v.literal("community_invite"),
      v.literal("rental_expiring"),
      v.literal("pro_trial_ending"),
      v.literal("payout_sent"),
      v.literal("milestone"),
    ),
    title: v.string(),
    body: v.string(),
    deepLink: v.string(),
    isRead: v.boolean(),
    sentAt: v.number(),
    relatedId: v.optional(v.string()),
  })
    .index("by_user_and_sent", ["userId", "sentAt"])
    .index("by_user_unread", ["userId", "isRead"]),

  // ————— CONTENT REPORTS (moderation) —————
  contentReports: defineTable({
    reporterId: v.id("users"),
    targetType: v.union(
      v.literal("book"),
      v.literal("reaction"),
      v.literal("community"),
      v.literal("course_material"),
    ),
    targetId: v.string(),
    reason: v.string(),                             // e.g., "copyright", "abusive", "csam"
    detail: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("resolved"), v.literal("dismissed")),
    resolvedAt: v.optional(v.number()),
    resolverId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_status_created", ["status", "createdAt"])
    .index("by_target", ["targetType", "targetId"]),

  // ————— WAITLIST (preserved from v1 — see existing convex/waitlist.ts) —————
  waitlist: defineTable({
    email: v.string(),
    emailLower: v.string(),
    audience: v.union(v.literal("reader"), v.literal("creator")),
    qualifier: v.optional(v.string()),
    creatorLink: v.optional(v.string()),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["emailLower"])
    .index("by_audience_created", ["audience", "createdAt"])
    .index("by_created", ["createdAt"]),
});
```

**Migration notes from v1 schema:**

- `clubs` → renamed to `communities`; adds `type` field (`book | genre | course | private`), optional `bookId` link, `isMinorSafe` flag.
- Old `books` (user-uploaded PDFs) → **deprecated and replaced** by the new catalog-centric `books`. Existing v1 rows should be hidden from the v2 catalog UI. Consider a data migration to convert them to private course materials for backward compatibility, or archive entirely — see § 9 Migration Plan.
- Old `chapters` (creator-published PDFs) → **deprecated**. The v1 creator-publishing concept is retired. In v2, an indie author's published work is a title in the catalog (`books` with `source: "indie_author"`).
- `progress` — adds required `rentalId` foreign key; `bookId` is now non-optional (progress only exists within a rental).
- `reactions` — `bookId` is now required and refers to the catalog `books` table; `chapterId` field removed.

---

## 4. Functional Requirements

Each FR has an ID, priority (P0 = must-have for launch; P1 = should-have, ship immediately post-launch; P2 = later), a one-line description, and detailed acceptance criteria. Reference these IDs in code comments and PRs.

### 4.1 Identity & Authentication

**FR-001 (P0) — Sign up with Clerk.** New user can create an account with Apple Sign-In, Google, or phone OTP. On successful signup, a `users` row is created with `clerkId`, minimal profile fields, `ageLane: "unknown"`, `proTier: "free"`, `country` and `currency` inferred from locale.

**FR-002 (P0) — Sign in and session persistence.** Returning user is signed in silently if a valid Clerk session exists.

**FR-003 (P0) — Complete profile.** After first signup, user is prompted to add display name, avatar (optional), and 3 genre selections. All can be edited later in Settings.

**FR-004 (P1) — Age gate.** Before the app leaves closed beta, a neutral date-of-birth gate at signup routes users into `adult | teen | child` lanes. Adults flow through normal onboarding. Teens (13–17) enter with high-privacy defaults, guardian-provisioned only. Under-13 blocked until KWS/k-ID VPC vendor is integrated (Phase 10). Age lane is set once and cannot be changed by the user.

**FR-005 (P0) — Delete account.** User can delete their account from Settings. Deletion removes personal data (name, avatar, email), cancels active rentals, cancels Pro subscription, retains anonymized rental history for author royalty accounting (rentals attributed to a deleted-user placeholder).

### 4.2 Catalog Browsing & Discovery

**FR-010 (P0) — Editorial home / catalog landing.** Home tab shows curated shelves: "New this week," "Nigerian indie," "Classics," "Flipbook Specials," "Trending in your genres." Each shelf is a horizontally-scrollable list of book cards.

**FR-011 (P0) — Book detail page.** Tapping a book card opens a detail page with cover, title, author(s), description, rental band price, "3 friends are reading this" if any communities exist, action buttons (Rent, Preview, Add to shelf).

**FR-012 (P0) — Search.** Search across title, author, and genre. Uses Convex `searchIndex` on `books.title` with filters for `rentalBand`, `source`, `isPublished`. Results paginated 20 per page.

**FR-013 (P0) — Filter and sort.** Catalog can be filtered by rental band, genre, source (public domain / indie / publisher). Sort by newest, most-rented (last 30 days), and alphabetical.

**FR-014 (P1) — Preview first chapter.** Every book has a free preview of Chapter 1 (first 5-10% of content, capped at ~30 pages) readable without a rental.

**FR-015 (P2) — Cross-genre discovery.** "Readers who liked X also rented Y" surface — collaborative filtering. Deferred to Year 2 unless the catalog page click-through rate is poor.

### 4.3 Rentals

**FR-020 (P0) — Rent a book.** From the book detail page, "Rent" button initiates checkout. Free users: charged the band price via Paystack. Pro users: Band A → free (paymentSource: `pro_included`); Bands B/C/D → 15% discount, charged via Paystack. Successful payment creates a `rentals` row with `startedAt = now`, `expiresAt = now + 4w` (Free) or `now + 6w` (Pro), and returns a signed URL for the EPUB.

**FR-021 (P0) — Rental checkout via Paystack (NGN).** Paystack Standard integration. Card, bank transfer, and USSD options. Success and failure webhooks handled at `/webhooks/paystack`. Idempotency key on reference.

**FR-022 (P0) — Rental expiry.** A Convex cron runs hourly, finds rentals with `expiresAt < now`, marks them expired, revokes the reader's access to the EPUB signed URL on next request. Sends a `rental_expiring` notification 48h before expiry.

**FR-023 (P0) — Re-rent.** An expired rental can be re-rented with one tap. Same book, new rental row, new watermark seed, fresh expiry.

**FR-024 (P0) — Prevent duplicate active rentals.** A user cannot have two active rentals of the same book. Attempting to rent a book they already have active silently opens the existing rental.

**FR-025 (P1) — Rebill / dunning logic.** Failed Paystack charges retry once at 24h, once at 72h, and once at 7 days. Reader is notified after the first failure with a "your bank didn't approve" message and a link to update their card.

**FR-026 (P1) — Book "shelf" — active rentals view.** A "My Shelf" screen shows all active rentals with remaining time, current progress, and quick-open buttons.

**FR-027 (P1) — Rental history.** A "Read" screen shows finished / expired rentals; user can re-rent from history.

**FR-028 (P2) — Stripe checkout for USD diaspora readers.** Year 2. Same rental mechanics, different payment rail.

### 4.4 In-App Reader

**FR-030 (P0) — EPUB reader with offline.** Rented EPUB is downloaded and cached to device (secure storage). Renders inside a webview-based EPUB engine (Readium or equivalent). Supports pagination, page-turn animation, chapter navigation, table of contents.

**FR-031 (P0) — Progress tracking.** Reader's `currentPage`, `furthestPageReached`, `updatedAt` written to `progress` on scroll/pagination. Progress synced when online.

**FR-032 (P0) — Reading customization.** Font size (5 steps), font family (2 options), theme (Light / Flip / Dark). Preferences persist per user.

**FR-033 (P0) — Mark as finished.** User can mark a book finished manually; auto-marks when they reach the last page.

**FR-034 (P0) — Watermarking.** Every rented EPUB is served with an invisible per-rental watermark (metadata field + optional subtle text-layer marks). Watermark seed lives on the `rentals` row. If a Flipbook rental file appears on a piracy site, we can trace it to a rental.

**FR-035 (P1) — Highlights.** Long-press text to highlight. Highlights are private, per-rental, in five colors. Stored in a `highlights` table (added Phase 2, spec elsewhere).

**FR-036 (P2) — Notes.** Attach a text note to a highlight. Private.

### 4.5 In-Margin Reactions

**FR-040 (P0) — Drop a reaction.** In a community-linked read, long-press a paragraph → emoji picker (6 curated) OR "Add comment" for a short comment (≤200 chars). Reaction is persisted with `communityId`, `bookId`, `page`, optional `paragraphIndex`, `userId`, `type`, `emoji` or `text`, `createdAt`.

**FR-041 (P0) — Render reactions in the margin.** As reader reaches a page, any reactions from other community members visible so far (i.e., they've reached that page too) render in the margin. Never shows reactions from pages the reader hasn't reached (spoiler protection).

**FR-042 (P0) — Real-time reveal.** New reactions from other readers appear live via Convex reactive query; 500ms p95 latency.

**FR-043 (P0) — Reply to a reaction.** Tap a reaction → reply. Replies are flat (one level deep). Replies show inline under the parent reaction.

**FR-044 (P0) — Reaction rate limit.** Max 10 reactions per user per minute per book, enforced server-side.

**FR-045 (P1) — Author badge.** If the reactor's `userId` matches the linked `authorAccounts.userId` for a book they authored, render a small Golden Sand author badge.

### 4.6 Communities

**FR-050 (P0) — Create a community.** Pro users can create communities of type `book`, `genre`, or `private`. Free users can only join. Community requires a name, optional description, visibility (private/unlisted/public), and (if type == book) a bookId.

**FR-051 (P0) — Invite by link.** Every community has a shareable invite code. Tapping a link deep-opens the app to the community's join screen. Joining is one tap.

**FR-052 (P0) — Community view.** Shows book cover (if type == book), member count, member reading positions (soft bar visualization, no leaderboard), recent reactions, moderator controls (for moderators).

**FR-053 (P0) — Community cap for Free users.** Free users can join up to 3 communities. Pro removes the cap.

**FR-054 (P1) — Leave a community.** User can leave; progress + reactions retained. Rentals unaffected.

**FR-055 (P1) — Moderator controls.** Rename community, edit description, remove members, close community.

**FR-056 (P2) — Public community discovery.** Browse public communities by genre or by shared book. Deferred to Phase 2.

### 4.7 Flipbook Pro Subscription

**FR-060 (P0) — Subscribe to Pro.** Settings → Upgrade to Pro screen shows three tiers: monthly (₦2,500), quarterly (₦2,000/mo eff., ₦6,000/qtr), annual (₦1,550/mo eff., ₦18,600/yr). Purchase flows through RevenueCat → App Store / Play Store.

**FR-061 (P0) — Pro entitlement synced from RevenueCat webhook.** RevenueCat POSTs to `/webhooks/revenuecat`; handler updates `users.proTier`, `users.proExpiresAt`, and inserts/updates a `subscriptions` row.

**FR-062 (P0) — Pro benefits gate.** Every Pro-only feature (unlimited Band A, 15% discount, Specials access, audio narration, 6-week shelf, community creation, unlimited community joins) checks `users.proTier != "free"` at runtime.

**FR-063 (P0) — Cancel Pro.** User cancels through the App Store / Play Store subscription management (RevenueCat-linked). Entitlement remains active until `proExpiresAt`; then downgrades to Free.

**FR-064 (P1) — Grace period.** Failed renewals grant 3-day grace; entitlement remains active while RevenueCat retries.

### 4.8 Flipbook Specials

**FR-070 (P0) — Specials shelf.** Home tab shows a "Flipbook Specials" shelf featuring books flagged `isSpecial: true`. Pro users see them as free-to-open; Free users see them as promotional (renderable book detail with a "Free with Pro" badge).

**FR-071 (P1) — Specials rotation.** Editorial team can mark/unmark a book as Special via a Convex mutation (admin-gated). Setting `isSpecial: true` requires `specialsWindowEndsAt` for indie exclusives.

**FR-072 (P1) — Author Specials licensing.** When an author's book enters Specials, a `royaltyStatements` row for their flat quarterly Specials fee (₦15,000/title/qtr baseline) is created via cron on the same day as regular monthly statements.

### 4.9 Audio Reader (Pro-only)

**FR-080 (P0) — Ingest audio at book publish.** When a book is published (transitions to `isPublished: true`) and `audioOptOut == false`, a Convex scheduled action calls OpenAI TTS per chapter and uploads chapter MP3s to Convex File Storage. Rows written to `audioAssets`. Book's `audioStatus` transitions `none → pending → ready` (or `failed`).

**FR-081 (P0) — Audio playback for Pro users.** On the reader screen, Pro users see a play button. Tapping plays the audio for the current chapter, streamed from Convex storage. Playback UI: play/pause, chapter navigation, 15s skip.

**FR-082 (P1) — Audio for Specials via ElevenLabs.** Books flagged `isSpecial` re-ingested with ElevenLabs voices for higher fidelity narration. Ingestion pipeline is provider-agnostic — swaps between OpenAI and ElevenLabs based on book's `audioNarrator` field.

**FR-083 (P1) — Author audio opt-out.** Author term-sheet checkbox sets `audioOptOut: true` on their books. Opted-out books never have audio generated or played.

**FR-084 (P2) — Accessibility audio grant.** Free users with declared accessibility need receive 20 hours/month of audio listening. Deferred to Phase 2; requires an opt-in accessibility flow.

### 4.10 Author Onboarding, Books, and Royalties

**FR-090 (P0) — Author signup.** Author receives a signup link (from the docs/supply pitch flow). Signup creates an `authorAccounts` row and, optionally, a linked `users` row. Terms are shown inline; author checks "I agree" and signs.

**FR-091 (P0) — Author uploads a book.** Author uploads EPUB (max 30MB), cover image (max 5MB), title, description, genre tags, language, audio opt-in choice. Editorial team assigns rental band. Book saved with `isPublished: false`.

**FR-092 (P0) — Editorial review + publish.** Admin-gated mutation transitions a book to `isPublished: true` after editorial review. Triggers audio ingestion (if opted in) and appears in catalog immediately.

**FR-093 (P0) — Monthly royalty statement generation.** Convex cron runs at 00:05 UTC on the 1st of each month; for each active author, computes rentals in the previous calendar month, gross revenue, 70% author share (per book, respecting `bookAuthors.revenueSharePct` splits for co-authored works), FX conversion if payout currency is USD, writes `royaltyStatements` row with status `finalized`.

**FR-094 (P0) — Statement email.** Cron generates and sends a per-author statement email by the 15th of each month. Email contains: reporting period, rental count, gross, share, payout amount, payout method, expected payout date.

**FR-095 (P0) — Payout initiation.** Cron initiates payout via Paystack Transfers (NGN authors) or Wise/PayPal (USD authors) within 48h of statement email. Writes `payouts` row; updates `royaltyStatements.status` to `paid` on successful confirmation from the payout provider.

**FR-096 (P1) — Author dashboard.** Simple in-app screen showing the author's books, monthly rental counts, month-to-date earnings, past statements.

**FR-097 (P1) — Book pullout.** Author can request a book to be pulled with 30 days' notice via a Settings action. Existing active rentals run out; no new rentals created.

**FR-098 (P2) — Multi-book bulk upload for small publishers.** A publisher can bulk-upload N books via CSV + EPUB folder. Deferred to Phase 2, when small-publisher deals justify the flow.

### 4.11 Course Communities (educator surface)

**FR-100 (P0 for founding cohort, P1 for public launch) — Create a course community.** Lecturer creates a community of `type: "course"`, provides institution name, course code, term start/end dates. A `courses` row is created with reference to the community.

**FR-101 (P0) — Roster invite by email.** Lecturer pastes a list of student emails. Each student receives an invite email with a deep link to join. Signup + join in one flow.

**FR-102 (P0) — Reading list mode.** Lecturer picks N books from the catalog as required or optional reading. Students see the list on the community landing; one tap rents any title.

**FR-103 (P0) — Course material upload (private PDFs).** Lecturer uploads course materials (max 20MB per file, PDF only). Materials are visible only to community members. Lecturer must check "I hold rights to distribute this material" — a hard gate. `courses.rightsAcknowledgedAt` records the timestamp.

**FR-104 (P0) — Course-community auto-archive.** At `termEndAt`, community auto-archives — no new members can join, but existing members retain read access to materials and reading progress. Auto-unarchive requires lecturer action.

**FR-105 (P1) — Lecturer reading-progress view.** Lecturer sees anonymized class-wide reading progress: "18 of 32 students are on Chapter 3." Individual student progress is never exposed.

**FR-106 (P0) — Explicitly out of scope for course communities.** No grade book, no attendance, no assignment submissions, no video conferencing, no calendar, no certificates. When a lecturer requests these, the response is: *"great, use Google Classroom for that, use Flipbook for the reading."*

### 4.12 Notifications

**FR-110 (P0) — Push notifications.** Expo Push Notifications for:
- Reaction reply
- Chapter drop in a community you're in
- Rental expiring in 48h
- Payout sent (author-side)
- Pro trial ending

**FR-111 (P0) — Notification preferences.** Settings screen exposes on/off toggles for each notification type. Off is respected server-side.

**FR-112 (P0) — Reading-shaped notifications only.** *(Revised Aug 15, 2026 per the growth-ideology revision — see `synthesis-aug-2026.md` Theme D.)* Reading reminders ARE allowed: user-controllable, contextual (anchored to the reader's actual current book and club position), warm-toned, with a Settings toggle. What remains banned: shame framing ("you're falling behind"), fake urgency, and pushes with no reading-shaped payload ("come back to the app" with nothing behind it). See `execution-prd-next-batch.md` P5-T2 for the v1 implementation.

### 4.13 Content Moderation & Piracy

**FR-120 (P0) — Report content.** Any reader can report a book, reaction, community, or course material as objectionable via a small "Report" action. Creates a `contentReports` row.

**FR-121 (P0) — DMCA takedown flow.** Admin (via Convex dashboard mutation) can set `books.isRemoved: true` or unpublish a course material. Active rentals of a removed book get a friendly takedown message on next open.

**FR-122 (P0) — Watermark enforcement.** If a Flipbook EPUB appears on a piracy site, the watermark seed lets us trace it to a specific rental. Action: suspend the user account, notify the author, and update the takedown record.

**FR-123 (P1) — Age-appropriate content filter.** Teens (13–17) see only books tagged `isMinorSafe: true` in the catalog. Adults see everything.

### 4.14 Waitlist & Marketing Backend (existing)

**FR-130 (P0, already shipped) — Waitlist signup.** Existing `waitlist` table, HTTP endpoint at `/waitlist`. Marketing site posts here.

**FR-131 (P0, already shipped) — Waitlist count.** GET `/waitlist/count` returns anonymous total for the marketing site's social-proof line.

### 4.15 Safety & Age Segmentation

Full spec preserved from v1. Summary here:

**FR-140 (P1) — Neutral DOB age gate.** Required before opening beta to public. Segments to `adult | teen | child`. See `product-vision.md` § 3 for the full compliance narrative.

**FR-141 (P2) — Under-13 (child) VPC.** Requires KWS or k-ID integration and legal review. Staged behind Phase 10.

**FR-142 (P1) — Minor-safe defaults.** Teens: no public community discovery, no stranger contact, high-privacy defaults, guardian-provisioned only.

### 4.16 Live Review Sessions

**FR-150 (P2) — Scheduled live audio sessions.** Communities can schedule Twitter Spaces-style live audio review sessions synchronized with the book. Deliberately deferred out of MVP.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **NFR-P1.** App cold-start under 3s on a Pixel 5 (mid-tier Android target).
- **NFR-P2.** Reaction round-trip latency p95 under 500ms in staging.
- **NFR-P3.** Rental checkout success flow (from "Rent" tap to book open) under 10s on 4G, including Paystack redirect.
- **NFR-P4.** Catalog browse and search under 1s to first render on 4G.
- **NFR-P5.** EPUB page-turn animation under 200ms.
- **NFR-P6.** TTS ingestion for one 250-page book: complete within 30 minutes of publish trigger.

### 5.2 Reliability

- **NFR-R1.** Convex uptime target 99.9% (managed by Convex).
- **NFR-R2.** Paystack webhook delivery is idempotent — duplicate webhooks for the same reference must not create duplicate rentals.
- **NFR-R3.** Royalty statement cron must be retryable — if it fails on a given author, retry within 6 hours; alert admin if it fails twice.
- **NFR-R4.** Payout initiation failures logged and surfaced to admin dashboard for manual retry.

### 5.3 Security

- **NFR-S1.** All server functions requiring identity check `ctx.auth.getUserIdentity()` first; ungated public functions are exceptions clearly named (waitlist, catalog browse, book detail public preview).
- **NFR-S2.** Author payout data (Paystack recipient code, Wise ID, PayPal email) encrypted at rest via Convex's native encryption; never exposed via public queries.
- **NFR-S3.** EPUB storage URLs are short-lived signed URLs (max 1h), regenerated per request.
- **NFR-S4.** Watermark seed is per-rental, unpredictable (crypto-secure random), and stored server-side; never exposed to the client.
- **NFR-S5.** IP addresses hashed with SHA-256 before storage; never raw.
- **NFR-S6.** Admin mutations gated by `isAdminEmail` check (see `convex/lib/admins.ts`).

### 5.4 Privacy & Compliance

- **NFR-C1.** COPPA compliance staged behind KWS/k-ID VPC vendor for under-13. Never enabled without legal review.
- **NFR-C2.** UK Children's Code compliance: high-privacy defaults for all 13–17 users, no engagement nudges, no geolocation.
- **NFR-C3.** Nigerian Data Protection Act (NDPA 2023) — data-minimization at collection, encrypted at rest, breach notification within 72h.
- **NFR-C4.** Author agreements are non-exclusive (per term sheet). Rights lapse handling: on term-sheet termination, book flagged `isRemoved: true` on the date of termination; active rentals honored to expiry.

### 5.5 Accessibility

- **NFR-A1.** WCAG 2.1 Level AA compliance for all screens.
- **NFR-A2.** Reading view exposes chapter and page number to screen readers.
- **NFR-A3.** All interactive elements ≥ 44x44 px tap target.
- **NFR-A4.** Respect `prefers-reduced-motion` for reaction animations.
- **NFR-A5.** iOS Dynamic Type + Android font scale supported at 100–200%.

### 5.6 Cost Discipline

- **NFR-CD1.** Software costs Year 1 target ≤ $100/month combined (hosting + tools + FX-inflated USD lines).
- **NFR-CD2.** TTS ingestion cost per general-catalog book ≤ $8 (OpenAI TTS baseline).
- **NFR-CD3.** ElevenLabs Specials narration cost per book ≤ $60.
- **NFR-CD4.** Every USD-denominated cost line has an FX-margin buffer of at least 25% modeled into the P&L.

---

## 6. Edge Cases

### 6.1 Rental Lifecycle

- **A rental's EPUB storage URL expires mid-read.** Reader-side fetch on next paginate → 401 → transparently re-fetch a fresh signed URL from the server → continue.
- **A book is removed (DMCA takedown) while a reader has an active rental.** On next book-open, reader sees a friendly takedown message: "This book is no longer available on Flipbook. Your rental has been credited." Their next rental up to the credit value is free.
- **A book's rental band changes after a reader rents it.** Reader's rental keeps the price it was rented at (via `rentals.listPrice` and `pricePaid` snapshots). Only future rentals are affected.
- **Reader has an active rental of a book that becomes a Specials title.** No change — their paid rental runs to expiry. Post-expiry, they can re-open as a Pro (if Pro) via Specials.
- **Reader's Pro subscription expires while they have a 6-week rental.** Rental keeps its 6-week window (grandfather). New rentals default to 4-week.

### 6.2 Payments

- **Paystack webhook arrives after user-side retry has already created the rental.** Idempotency on `paystackReference` prevents duplicate rentals.
- **Card declined by bank — Nigerian card decline rates are high.** Dunning logic (FR-025) retries at 24h/72h/7d. Reader sees a "your bank didn't approve — try a different card or bank transfer" message.
- **Reader's rebill succeeds after the promised rental start date.** Rental starts fresh at the successful-charge time; not backdated.
- **Refund requested.** Manual admin-processed. Refund invalidates the rental immediately; user retains reading progress but loses EPUB access.
- **Currency mismatch — a Nigerian reader with a NGN card tries to buy Pro via App Store USD pricing.** App Store handles the FX; RevenueCat webhook still reports USD price and store country. `subscriptions.priceCents` is in USD for reporting.

### 6.3 Communities

- **Reader joins a community for a book they haven't rented.** They can see member list, community metadata, and public reactions (paragraph-level reactions filtered by whether they've reached the page — since they haven't rented, they haven't reached any). CTA is "Rent this book to read along."
- **Community moderator deletes their account.** Community moderator role is transferred to the earliest-joined active member. If no active members, community is archived.
- **A community's linked book is removed (DMCA).** Community shows a takedown banner. New rentals disabled. Existing members retain community access.
- **Course community past its `termEndAt` — student wants to re-open a course PDF.** Access retained; only new-member joining is blocked.

### 6.4 Reactions

- **Reader reacts on a page, then another reader ahead of them replies. The first reader closes and re-opens.** They see the reply as a small badge on their reaction. Tap to expand.
- **Two readers react on the same paragraph within milliseconds of each other.** Both reactions render — ordered by `createdAt` deterministically.
- **A reactor's account is deleted.** Their reactions render as "deleted user" with the emoji or comment text preserved (community continuity > individual attribution).
- **Reaction is reported and confirmed abusive.** Reaction is soft-deleted; rendered as "This comment was removed" to preserve conversation thread continuity.

### 6.5 Authors & Payouts

- **Author changes payout method mid-month.** New method applies to statements not yet finalized. Statements already `finalized` retain their locked-in method.
- **NGN → USD FX shift between statement finalization and payout initiation.** FX rate is locked at statement finalization; `royaltyStatements.fxRate` captures it. Any FX gain/loss between finalization and payout is absorbed by Flipbook, not passed to author.
- **Statement email bounces.** Cron retries once at 24h. If still bouncing, admin is alerted.
- **Author pulls their book with active rentals in flight.** Rentals run to expiry; author is paid for all rentals started before pullout date. Book becomes unavailable for new rentals from pullout date.
- **A book has co-authors with different currencies.** Each co-author gets a separate `royaltyStatements` row per period, split according to `bookAuthors.revenueSharePct`, converted to their own payout currency independently.

### 6.6 Audio

- **TTS ingestion fails mid-book.** `audioStatus: failed`. Admin can retry via a mutation. Book still readable in text; Pro users see "audio coming soon" instead of the play button.
- **Author opts out of AI narration after audio has been generated.** Existing audio assets are deleted; `audioOptOut: true` set; `audioStatus: none`.
- **A Pro user starts audio, then their subscription lapses mid-chapter.** Audio playback stops on next chapter transition; a message explains "Pro required to continue listening — text is still yours."

### 6.7 Course Communities

- **Lecturer uploads a copyrighted textbook chapter without rights.** Rights certification is a hard gate at upload, but not a real check. If reported, admin removes the material and warns the lecturer. Repeat violations remove the lecturer's ability to upload.
- **A student in a course wants to see reactions from students in another course reading the same catalog book.** Reactions are community-scoped. They only see reactions from their own community members. To see broader reactions, they'd join a general book community.

---

## 7. Open Questions

Every question here is a decision the team hasn't finalized. Each has an owner.

1. **Which EPUB reader library?** Options: react-native-readium (mature but heavy), Foliate.js in a WebView, custom-built on epub.js. Owner: Moks. Decide by: end of July 2026. Impact: cascades into reader UX and margin-reactions implementation.
2. **Paystack Transfers vs. manual bank transfer for author NGN payouts?** Transfers automates but has KYC requirements. Manual is simpler for first 5-10 authors. Owner: Ayodeji. Decide by: first author signed.
3. **Wise vs. PayPal for USD author payouts?** Wise is cheaper for larger amounts; PayPal is faster to set up. Owner: Ayodeji. Decide by: first USD author signed.
4. **Standard-Ebooks vs. Project-Gutenberg-direct for PD ingestion?** Standard Ebooks are beautifully typeset but a smaller catalog. Gutenberg is the full corpus but raw. Owner: Moks. Decide by: catalog ingestion begins.
5. **Editorial band assignment — automated or hand-set?** Hand-set on the first 300 titles gives us intuition. Automation via genre + publisher heuristics later. Owner: Moks. Decide by: 100th book ingested.
6. **Pro benefit — free Band A rentals unlimited vs. capped at some number per month?** Currently unlimited. If Pro users start renting 40 Band A books per month, we may need a soft cap. Owner: model math. Decide by: 50th Pro subscriber.
7. **Support tooling — Intercom, Front, or nothing yet?** Nothing yet is defensible for first 500 users; break-glass at that point. Owner: Ayodeji. Decide by: 200th user.
8. **Analytics — Convex logs + custom event table vs. PostHog?** Custom is cheaper; PostHog has better funnels out of the box. Owner: Moks. Decide by: 30 days into public v2.
9. **When to add a small-publisher bulk-upload feature (FR-098)?** Depends on when first small-publisher deal closes. Owner: Ayodeji.
10. **Do rentals auto-renew?** Currently no. Adding auto-renew (with reader consent) could smooth churn but risks feeling like a subscription trap. Owner: PM decision. Decide by: 90 days post-launch.

---

## 8. Out of Scope (deferred to Phase 2+ or explicitly never)

- User-uploaded PDF book library (v1 model; explicitly retired).
- Web reading experience.
- Big-Five publisher licensing.
- Public ratings and reviews.
- Public follower graph.
- Human-narrated audiobooks (separate rights class).
- Algorithmic recommendation engine.
- All LMS-shaped features on the campus surface (grades, attendance, video, assignments, etc.).
- Ads or sponsored placements in the consumer app.
- Institutional / enterprise sales motion (Year 2+).
- Book purchases (never — we rent, we don't sell).

---

## 9. Migration Plan (v1 → v2 code + data)

This is a **coexistence** migration, not a hard cutover. v1 (clubs + user-uploaded PDFs) continues to serve the existing beta users while v2 (catalog + rentals + Pro + audio) is built alongside.

**Phase A — schema coexistence (Week 1 of v2 build).**

- Rename `clubs` → `communities`; add new fields (`type`, `bookId`, `isMinorSafe`). Provide default values for existing rows (`type: "private"`, `isMinorSafe: false`).
- Add all new v2 tables: `authorAccounts`, `royaltyStatements`, `payouts`, `rentals`, `subscriptions`, `courses`, `audioAssets`, `contentReports`.
- Leave existing v1 `books` table intact; treat as legacy for now. Add a boolean `isLegacy` if needed to hide from v2 UI.

**Phase B — v2 catalog build (Weeks 2-6).**

- Ingest first 300 PD titles via a Convex script.
- Onboard the founding-30 authors via the author signup flow.
- New v2 catalog UI rolled out alongside v1 club-management UI (feature-flagged).

**Phase B interim note (added Aug 15, 2026):** while v2 builds, v1 continues shipping improvements per `execution-prd-next-batch.md` — notably **EPUB upload in v1** (clubs upload PDF or EPUB; additive `books.fileType` field; epub.js WebView reader on both platforms) and **multi-genre tagging** (additive `books.genres` array alongside legacy `genre` string). These v1 additions are designed to be v2-compatible: the epub.js reader work directly de-risks TASK-125/126, and the `genres` array matches v2's `genreTags` shape (rename at migration).

**Phase C — cutover (Week 8).**

- v2 catalog UI becomes the default home tab.
- v1 clubs migrated to v2 communities (data migration script).
- v1 book uploads disabled for new clubs.
- Legacy v1 books remain readable inside their original clubs; no new v1 uploads.

**Phase D — deprecation (Year 2).**

- Legacy v1 books archived; readers notified in advance.
- Legacy `books` table + user-upload code paths removed.

---

## 10. Testing Strategy

- **Unit tests.** All Convex mutations with non-trivial logic (rental checkout, statement generation, band assignment) have unit tests using Convex's testing helpers.
- **Integration tests.** End-to-end flows for: signup → rental → read → react → finish; Pro subscribe → cancel; author signup → book publish → rental → statement → payout.
- **Manual test matrix.** Every FR has a manual acceptance test documented in a `docs/testing/acceptance.md` (to be created at Phase A completion).
- **Load testing.** Simulate 100 concurrent readers on the same book with reactions; measure p95 latency. Target: <500ms.
- **Payment sandbox testing.** Every Paystack failure code (declined, insufficient, expired, do-not-honor) exercised via test keys before enabling live.
- **Cron testing.** Royalty statement cron manually triggered against a synthetic dataset before first real author is on the platform.

---

## 11. Rollout & Launch Criteria

Before enabling v2 catalog for public users:

- All P0 FRs implemented and green on the acceptance test matrix.
- Paystack live keys tested with real transactions (Moks and Ayodeji as test users).
- RevenueCat live entitlements verified on both iOS and Android.
- At least 200 PD titles ingested and browseable.
- At least 8 founding-cohort indie author titles published (target: 15+ ideal).
- First royalty statement dry-run completed successfully.
- Watermarking verified on a rented EPUB via file inspection.
- App Store and Play Store submissions approved.
- Landing page rewritten to match v2 positioning.
- 5-person friends-and-family cohort has run the full happy path without issue.

---

**End of PRD v2.0.** Update the `Version` header at the top when material changes ship.
