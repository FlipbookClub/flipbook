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
    // `bookId` (v.id("books")) is added in TASK-033 once the `books` table
    // exists. Schemas can't reference tables that haven't been defined yet.
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
});
