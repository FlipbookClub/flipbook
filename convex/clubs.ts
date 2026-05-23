import { ConvexError, v } from "convex/values";

import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";
import { generateInviteCode } from "./lib/inviteCode";

const MAX_NAME = 60;
const MAX_DESCRIPTION = 500;
const INVITE_CODE_RETRIES = 8;

const permissionsValidator = v.object({
  membersCanUploadBooks: v.boolean(),
  membersCanInviteOthers: v.boolean(),
  membersCanUpdateInfo: v.boolean(),
});

const clubValidator = v.object({
  _id: v.id("clubs"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.optional(v.string()),
  type: v.union(v.literal("standard"), v.literal("creator")),
  visibility: v.union(v.literal("private"), v.literal("public")),
  moderatorId: v.id("users"),
  coverImageUrl: v.optional(v.string()),
  permissions: permissionsValidator,
  inviteCode: v.string(),
  memberCount: v.number(),
  createdAt: v.number(),
  lastActivityAt: v.number(),
});

const clubWithMembershipValidator = v.object({
  ...clubValidator.fields,
  role: v.union(v.literal("moderator"), v.literal("member")),
  joinedAt: v.number(),
});

async function uniqueInviteCode(ctx: { db: QueryCtx["db"] }): Promise<string> {
  for (let attempt = 0; attempt < INVITE_CODE_RETRIES; attempt += 1) {
    const code = generateInviteCode();
    const existing = await ctx.db
      .query("clubs")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", code))
      .unique();
    if (!existing) return code;
  }
  throw new ConvexError({ code: "invite_code_generation_failed" });
}

async function userCanSeeClub(
  ctx: QueryCtx,
  club: Doc<"clubs">,
  userId: Id<"users"> | null,
): Promise<boolean> {
  if (club.visibility === "public") return true;
  if (!userId) return false;
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", userId))
    .unique();
  return membership !== null;
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("standard"), v.literal("creator")),
    visibility: v.union(v.literal("private"), v.literal("public")),
    coverImageUrl: v.optional(v.string()),
    permissions: v.optional(permissionsValidator),
  },
  returns: v.object({ clubId: v.id("clubs"), inviteCode: v.string() }),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);

    const name = args.name.trim();
    if (!name || name.length > MAX_NAME) {
      throw new ConvexError({ code: "invalid_name" });
    }
    if (args.description && args.description.length > MAX_DESCRIPTION) {
      throw new ConvexError({ code: "description_too_long" });
    }

    const inviteCode = await uniqueInviteCode(ctx);
    const now = Date.now();

    const clubId = await ctx.db.insert("clubs", {
      name,
      description: args.description?.trim() || undefined,
      type: args.type,
      visibility: args.visibility,
      moderatorId: me._id,
      coverImageUrl: args.coverImageUrl,
      permissions: args.permissions ?? {
        membersCanUploadBooks: false,
        membersCanInviteOthers: false,
        membersCanUpdateInfo: false,
      },
      inviteCode,
      memberCount: 1,
      createdAt: now,
      lastActivityAt: now,
    });

    await ctx.db.insert("memberships", {
      clubId,
      userId: me._id,
      role: "moderator",
      joinedAt: now,
      isFollowing: false,
    });

    return { clubId, inviteCode };
  },
});

export const get = query({
  args: { clubId: v.id("clubs") },
  returns: v.union(v.null(), clubValidator),
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) return null;
    const identity = await ctx.auth.getUserIdentity();
    let userId: Id<"users"> | null = null;
    if (identity) {
      const me = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      userId = me?._id ?? null;
    }
    const canSee = await userCanSeeClub(ctx, club, userId);
    return canSee ? club : null;
  },
});

export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  returns: v.union(v.null(), clubValidator),
  handler: async (ctx, args) => {
    const normalized = args.inviteCode.trim().toUpperCase();
    if (!normalized) return null;
    return await ctx.db
      .query("clubs")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", normalized))
      .unique();
  },
});

export const listMine = query({
  args: {},
  returns: v.array(clubWithMembershipValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const results = [] as Array<Doc<"clubs"> & { role: "moderator" | "member"; joinedAt: number }>;
    for (const m of memberships) {
      const club = await ctx.db.get(m.clubId);
      if (club) results.push({ ...club, role: m.role, joinedAt: m.joinedAt });
    }
    results.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    return results;
  },
});

export const update = mutation({
  args: {
    clubId: v.id("clubs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    permissions: v.optional(permissionsValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) {
      throw new ConvexError({ code: "not_moderator" });
    }

    const patch: Partial<Doc<"clubs">> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name || name.length > MAX_NAME) throw new ConvexError({ code: "invalid_name" });
      patch.name = name;
    }
    if (args.description !== undefined) {
      if (args.description.length > MAX_DESCRIPTION) {
        throw new ConvexError({ code: "description_too_long" });
      }
      patch.description = args.description.trim() || undefined;
    }
    if (args.coverImageUrl !== undefined) patch.coverImageUrl = args.coverImageUrl;
    if (args.visibility !== undefined) patch.visibility = args.visibility;
    if (args.permissions !== undefined) patch.permissions = args.permissions;

    if (Object.keys(patch).length > 0) {
      patch.lastActivityAt = Date.now();
      await ctx.db.patch(args.clubId, patch);
    }
    return null;
  },
});

export const remove = mutation({
  args: { clubId: v.id("clubs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const club = await ctx.db.get(args.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) {
      throw new ConvexError({ code: "not_moderator" });
    }

    // Cascade memberships, books, chapters (+ PDF storage for both),
    // reactions, progress, and club-related notifications.
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    for (const m of memberships) await ctx.db.delete(m._id);

    const books = await ctx.db
      .query("books")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    for (const b of books) {
      await ctx.storage.delete(b.pdfStorageId);
      await ctx.db.delete(b._id);
    }

    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    for (const c of chapters) {
      await ctx.storage.delete(c.pdfStorageId);
      await ctx.db.delete(c._id);
    }

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    for (const r of reactions) await ctx.db.delete(r._id);

    const progressRows = await ctx.db
      .query("progress")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    for (const p of progressRows) await ctx.db.delete(p._id);

    await ctx.db.delete(args.clubId);
    return null;
  },
});

export const listPublic = query({
  args: { searchTerm: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.array(clubValidator),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    const publicClubs = await ctx.db
      .query("clubs")
      .withIndex("by_visibility_activity", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(limit * 4);

    const search = args.searchTerm?.trim().toLowerCase();
    const filtered = search
      ? publicClubs.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            (c.description?.toLowerCase().includes(search) ?? false),
        )
      : publicClubs;
    return filtered.slice(0, limit);
  },
});
