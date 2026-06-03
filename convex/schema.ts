import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    displayName: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    genres: v.array(v.string()),
    pushToken: v.optional(v.string()),
    proSubscriptionStatus: v.union(
      v.literal("free"),
      v.literal("active"),
      v.literal("expired"),
    ),
    proExpiresAt: v.optional(v.number()),
    // FR-087: notification preferences. Optional → unset means "deliver
    // everything" (the default before the user has visited Settings).
    notificationPrefs: v.optional(
      v.object({
        chapterDrops: v.boolean(),
        reactionReplies: v.boolean(),
      }),
    ),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_display_name", ["displayName"])
    .index("by_last_active", ["lastActiveAt"]),

  clubs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("standard"), v.literal("creator")),
    visibility: v.union(v.literal("private"), v.literal("public")),
    moderatorId: v.id("users"),
    coverImageUrl: v.optional(v.string()),
    // Figma "Create a new community" permission checkboxes. Moderator always
    // has all three implicitly (derived from role at the API layer).
    permissions: v.object({
      membersCanUploadBooks: v.boolean(),
      membersCanInviteOthers: v.boolean(),
      membersCanUpdateInfo: v.boolean(),
    }),
    inviteCode: v.string(),
    memberCount: v.number(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_moderator", ["moderatorId"])
    .index("by_invite_code", ["inviteCode"])
    .index("by_visibility_activity", ["visibility", "lastActivityAt"])
    .index("by_type_activity", ["type", "lastActivityAt"]),

  memberships: defineTable({
    clubId: v.id("clubs"),
    userId: v.id("users"),
    role: v.union(v.literal("moderator"), v.literal("member")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    // For creator clubs (subscriber semantics) — `false` for standard clubs.
    isFollowing: v.boolean(),
  })
    .index("by_club", ["clubId"])
    .index("by_user", ["userId"])
    .index("by_club_and_user", ["clubId", "userId"]),

  books: defineTable({
    title: v.string(),
    author: v.string(),
    pdfStorageId: v.id("_storage"),
    pdfPageCount: v.number(),
    coverImageUrl: v.optional(v.string()),
    uploadedByUserId: v.id("users"),
    clubId: v.id("clubs"),
    isPublic: v.boolean(),
    isRemoved: v.boolean(),
    fileSize: v.number(),
    // Currently-reading vs library. A club's moderator sets one book as the
    // active read; the rest sit in the library. Optional so pre-existing rows
    // (and the moment before a current book is chosen) read as "library".
    status: v.optional(v.union(v.literal("current"), v.literal("library"))),
    currentlyReadingAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_uploader", ["uploadedByUserId"]),

  chapters: defineTable({
    clubId: v.id("clubs"),
    title: v.string(),
    chapterNumber: v.number(),
    pdfStorageId: v.id("_storage"),
    pdfPageCount: v.number(),
    publishedAt: v.number(),
    publishedByUserId: v.id("users"),
    authorNote: v.optional(v.string()),
    fileSize: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_club_and_number", ["clubId", "chapterNumber"]),

  progress: defineTable({
    userId: v.id("users"),
    clubId: v.id("clubs"),
    bookId: v.optional(v.id("books")),
    // Now available since the chapters table is defined above (Phase 5).
    chapterId: v.optional(v.id("chapters")),
    currentPage: v.number(),
    totalPages: v.number(),
    // FR-018: reactions on pages beyond this are filtered out (no spoilers).
    // Monotonically non-decreasing; max(currentPage, prevFurthestPageReached).
    furthestPageReached: v.number(),
    finishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_and_club", ["userId", "clubId"])
    .index("by_book", ["bookId"])
    .index("by_chapter", ["chapterId"])
    .index("by_club", ["clubId"]),

  reactions: defineTable({
    clubId: v.id("clubs"),
    // Exactly one of bookId / chapterId is set per reaction.
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
    page: v.number(),
    // 0-indexed within page; nullable when paragraph detection isn't
    // available (we anchor page-level in that case — see FR-016 edge case).
    paragraphIndex: v.optional(v.number()),
    userId: v.id("users"),
    type: v.union(v.literal("emoji"), v.literal("comment")),
    emoji: v.optional(v.string()),
    text: v.optional(v.string()),
    // For replies (FR-017). Flat — replies to replies are disallowed in the
    // create mutation.
    parentReactionId: v.optional(v.id("reactions")),
    createdAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_book_and_page", ["bookId", "page"])
    .index("by_chapter_and_page", ["chapterId", "page"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentReactionId"])
    // Rate-limit lookup (FR: max 10 reactions/min per user).
    .index("by_user_and_created", ["userId", "createdAt"]),

  // Pre-launch waitlist signups from the marketing site (getflipbook.com).
  // Public-write via convex/http.ts → POST /waitlist. Dedup is enforced on
  // emailLower (case-insensitive) — repeat submissions update qualifier in
  // place rather than creating duplicates.
  waitlist: defineTable({
    email: v.string(),
    emailLower: v.string(),
    audience: v.union(v.literal("reader"), v.literal("creator")),
    // The "what's the last book you finished?" / "which book club are you in?"
    // answer. Optional but high-signal — see GTM §9 "Waitlist mechanics".
    qualifier: v.optional(v.string()),
    // Creator-only — link to their existing work (Substack, IG, etc).
    creatorLink: v.optional(v.string()),
    // utm_source, utm_campaign, etc — flattened to a single string.
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    // For abuse mitigation — hashed, never raw IP.
    ipHash: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["emailLower"])
    .index("by_audience_created", ["audience", "createdAt"])
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("chapter_drop"),
      v.literal("reaction_reply"),
      v.literal("club_invite"),
      v.literal("milestone"),
    ),
    title: v.string(),
    body: v.string(),
    // Deep link the client opens on tap. E.g.
    // "flipbook://clubs/<clubId>/chapters/<chapterId>".
    deepLink: v.string(),
    isRead: v.boolean(),
    sentAt: v.number(),
    // Generic foreign-key string (chapter, reaction, etc).
    relatedId: v.optional(v.string()),
  })
    .index("by_user_and_sent", ["userId", "sentAt"])
    .index("by_user_unread", ["userId", "isRead"]),
});
