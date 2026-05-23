import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const memberWithProgressValidator = v.object({
  _id: v.id("memberships"),
  _creationTime: v.number(),
  clubId: v.id("clubs"),
  userId: v.id("users"),
  role: v.union(v.literal("moderator"), v.literal("member")),
  joinedAt: v.number(),
  lastReadAt: v.optional(v.number()),
  isFollowing: v.boolean(),
  // Joined user fields for rendering members lists without an extra round trip.
  displayName: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  avatarUrl: v.optional(v.string()),
});

export const joinByCode = mutation({
  args: { inviteCode: v.string() },
  returns: v.id("clubs"),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const normalized = args.inviteCode.trim().toUpperCase();
    if (!normalized) throw new ConvexError({ code: "invalid_code" });

    const club = await ctx.db
      .query("clubs")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", normalized))
      .unique();
    if (!club) throw new ConvexError({ code: "club_not_found" });

    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", me._id))
      .unique();
    if (existing) return club._id;

    const now = Date.now();
    // FR-019: creator-club members are followers (subscriber semantics) — gets
    // them on the chapter-drop push fanout. Standard clubs stay at false.
    await ctx.db.insert("memberships", {
      clubId: club._id,
      userId: me._id,
      role: "member",
      joinedAt: now,
      isFollowing: club.type === "creator",
    });
    await ctx.db.patch(club._id, {
      memberCount: club.memberCount + 1,
      lastActivityAt: now,
    });
    return club._id;
  },
});

export const leave = mutation({
  args: { clubId: v.id("clubs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId === me._id) {
      throw new ConvexError({ code: "moderator_cannot_leave" });
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", me._id))
      .unique();
    if (!membership) return null;

    await ctx.db.delete(membership._id);
    await ctx.db.patch(club._id, {
      memberCount: Math.max(0, club.memberCount - 1),
      lastActivityAt: Date.now(),
    });
    return null;
  },
});

export const listClubMembers = query({
  args: { clubId: v.id("clubs") },
  returns: v.array(memberWithProgressValidator),
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) return [];

    // Only members (and the moderator) can see other members for private clubs.
    const identity = await ctx.auth.getUserIdentity();
    if (club.visibility === "private") {
      if (!identity) return [];
      const me = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (!me) return [];
      const myMembership = await ctx.db
        .query("memberships")
        .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", me._id))
        .unique();
      if (!myMembership) return [];
    }

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    const enriched = [];
    for (const m of memberships) {
      const user = await ctx.db.get(m.userId);
      if (!user) continue;
      enriched.push({
        ...m,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      });
    }
    // Moderator first, then by joined order.
    enriched.sort((a, b) => {
      if (a.role === b.role) return a.joinedAt - b.joinedAt;
      return a.role === "moderator" ? -1 : 1;
    });
    return enriched;
  },
});
