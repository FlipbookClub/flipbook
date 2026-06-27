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

    // Moderator may have blocked this user from rejoining.
    const block = await ctx.db
      .query("clubBlocks")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", me._id))
      .unique();
    if (block) throw new ConvexError({ code: "blocked" });

    // FR-027: free users are capped at 3 club memberships total. The client
    // catches this code and routes to the Pro upgrade flow with the invite
    // code preserved so the join completes after subscribing.
    if (me.proSubscriptionStatus !== "active") {
      const myMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", me._id))
        .collect();
      if (myMemberships.length >= 3) {
        throw new ConvexError({ code: "pro_required", limit: 3 });
      }
    }

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

// Lightweight query for community card avatar stacks. Returns a random sample
// of up to `limit` members (default 3) showing only the fields a card needs.
// Applies the same private-club visibility guard as listClubMembers so non-
// members can't discover who's in a private club from a card in discovery.
export const sampleClubMembers = query({
  args: {
    clubId: v.id("clubs"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({ displayName: v.string(), avatarUrl: v.optional(v.string()) }),
  ),
  handler: async (ctx, args) => {
    const cap = Math.min(args.limit ?? 3, 3);
    const club = await ctx.db.get(args.clubId);
    if (!club) return [];

    if (club.visibility === "private") {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      const me = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      if (!me) return [];
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_club_and_user", (q) =>
          q.eq("clubId", args.clubId).eq("userId", me._id),
        )
        .unique();
      if (!membership) return [];
    }

    // Read up to 50 members so the shuffle has a meaningful pool for larger
    // clubs without scanning unbounded data.
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .take(50);

    // Fisher-Yates shuffle (in-place) then take cap.
    for (let i = memberships.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [memberships[i], memberships[j]] = [memberships[j], memberships[i]];
    }

    const sample = memberships.slice(0, cap);
    const result = [];
    for (const m of sample) {
      const user = await ctx.db.get(m.userId);
      if (!user) continue;
      result.push({ displayName: user.displayName, avatarUrl: user.avatarUrl });
    }
    return result;
  },
});

// ─────────────────────────────────────────────────────────────────
// MODERATION: remove member + block from rejoining
// ─────────────────────────────────────────────────────────────────

// Remove a member from the club. The membership row is deleted and memberCount
// is decremented. Guards: caller must be the moderator; cannot remove self
// (use `leave` instead); cannot remove the moderator/owner.
export const removeMember = mutation({
  args: { clubId: v.id("clubs"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) throw new ConvexError({ code: "not_moderator" });
    if (args.userId === me._id) throw new ConvexError({ code: "cannot_remove_self" });
    if (args.userId === club.moderatorId) throw new ConvexError({ code: "cannot_remove_moderator" });

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", args.userId),
      )
      .unique();
    if (!membership) throw new ConvexError({ code: "not_member" });

    await ctx.db.delete(membership._id);
    await ctx.db.patch(args.clubId, {
      memberCount: Math.max(0, club.memberCount - 1),
      lastActivityAt: Date.now(),
    });
    return null;
  },
});

// Remove a member AND prevent them from rejoining via any invite code.
export const blockMember = mutation({
  args: { clubId: v.id("clubs"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) throw new ConvexError({ code: "not_moderator" });
    if (args.userId === me._id) throw new ConvexError({ code: "cannot_block_self" });
    if (args.userId === club.moderatorId) throw new ConvexError({ code: "cannot_block_moderator" });

    // Remove membership if present.
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", args.userId),
      )
      .unique();
    if (membership) {
      await ctx.db.delete(membership._id);
      await ctx.db.patch(args.clubId, {
        memberCount: Math.max(0, club.memberCount - 1),
        lastActivityAt: Date.now(),
      });
    }

    // Add to block list (idempotent — skip if already blocked).
    const existing = await ctx.db
      .query("clubBlocks")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", args.userId),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("clubBlocks", {
        clubId: args.clubId,
        userId: args.userId,
        blockedByUserId: me._id,
        createdAt: Date.now(),
      });
    }
    return null;
  },
});

// Lift a block — the user can rejoin via invite code again.
export const unblockMember = mutation({
  args: { clubId: v.id("clubs"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) throw new ConvexError({ code: "not_moderator" });

    const block = await ctx.db
      .query("clubBlocks")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", args.userId),
      )
      .unique();
    if (block) await ctx.db.delete(block._id);
    return null;
  },
});
