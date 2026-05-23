import { ConvexError, v } from "convex/values";

import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

// Curated emoji set per FR-014. Reject anything else server-side so the
// margin keeps a tight, brand-aligned vocabulary.
const ALLOWED_EMOJIS = ["🔥", "❤️", "😭", "🤯", "💀", "✨"] as const;
const MAX_COMMENT_LENGTH = 200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const reactionValidator = v.object({
  _id: v.id("reactions"),
  _creationTime: v.number(),
  clubId: v.id("clubs"),
  bookId: v.optional(v.id("books")),
  chapterId: v.optional(v.id("chapters")),
  page: v.number(),
  paragraphIndex: v.optional(v.number()),
  userId: v.id("users"),
  type: v.union(v.literal("emoji"), v.literal("comment")),
  emoji: v.optional(v.string()),
  text: v.optional(v.string()),
  parentReactionId: v.optional(v.id("reactions")),
  createdAt: v.number(),
});

const reactionWithUserValidator = v.object({
  ...reactionValidator.fields,
  user: v.object({
    _id: v.id("users"),
    displayName: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
  }),
});

async function membershipFor(
  ctx: QueryCtx,
  clubId: Id<"clubs">,
  userId: Id<"users">,
): Promise<Doc<"memberships"> | null> {
  return await ctx.db
    .query("memberships")
    .withIndex("by_club_and_user", (q) => q.eq("clubId", clubId).eq("userId", userId))
    .unique();
}

async function furthestPageFor(
  ctx: QueryCtx,
  userId: Id<"users">,
  clubId: Id<"clubs">,
  scope: { bookId?: Id<"books">; chapterId?: Id<"chapters"> },
): Promise<number> {
  const rows = await ctx.db
    .query("progress")
    .withIndex("by_user_and_club", (q) => q.eq("userId", userId).eq("clubId", clubId))
    .collect();
  const row = rows.find((r) =>
    scope.bookId ? r.bookId === scope.bookId : r.chapterId === scope.chapterId,
  );
  return row?.furthestPageReached ?? 0;
}

async function enrichWithUsers(
  ctx: QueryCtx,
  rows: Doc<"reactions">[],
): Promise<Array<Doc<"reactions"> & { user: { _id: Id<"users">; displayName: string; firstName: string; lastName: string; avatarUrl?: string } }>> {
  const out = [];
  for (const r of rows) {
    const user = await ctx.db.get(r.userId);
    if (!user) continue;
    out.push({
      ...r,
      user: {
        _id: user._id,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    });
  }
  return out;
}

export const create = mutation({
  args: {
    clubId: v.id("clubs"),
    // Exactly one of bookId / chapterId must be set. Enforced server-side.
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
    page: v.number(),
    paragraphIndex: v.optional(v.number()),
    type: v.union(v.literal("emoji"), v.literal("comment")),
    emoji: v.optional(v.string()),
    text: v.optional(v.string()),
    parentReactionId: v.optional(v.id("reactions")),
  },
  returns: v.id("reactions"),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);

    if ((args.bookId && args.chapterId) || (!args.bookId && !args.chapterId)) {
      throw new ConvexError({ code: "exactly_one_scope_required" });
    }

    const membership = await membershipFor(ctx, args.clubId, me._id);
    if (!membership) throw new ConvexError({ code: "not_a_member" });

    if (args.page < 1) throw new ConvexError({ code: "invalid_page" });

    if (args.type === "emoji") {
      if (!args.emoji || !ALLOWED_EMOJIS.includes(args.emoji as (typeof ALLOWED_EMOJIS)[number])) {
        throw new ConvexError({ code: "invalid_emoji" });
      }
      if (args.text) throw new ConvexError({ code: "emoji_should_not_have_text" });
    } else {
      if (!args.text || args.text.trim().length === 0) {
        throw new ConvexError({ code: "empty_comment" });
      }
      if (args.text.length > MAX_COMMENT_LENGTH) {
        throw new ConvexError({ code: "comment_too_long", max: MAX_COMMENT_LENGTH });
      }
      if (args.emoji) throw new ConvexError({ code: "comment_should_not_have_emoji" });
    }

    // Replies are flat — disallow reply-to-reply (FR-017).
    if (args.parentReactionId) {
      const parent = await ctx.db.get(args.parentReactionId);
      if (!parent) throw new ConvexError({ code: "parent_not_found" });
      if (parent.parentReactionId) {
        throw new ConvexError({ code: "replies_are_flat" });
      }
      const sameScope =
        parent.bookId === args.bookId && parent.chapterId === args.chapterId;
      if (!sameScope || parent.page !== args.page) {
        // Catch a buggy client that tries to reply to a reaction from a
        // different page/book/chapter. The reply must live alongside its parent.
        throw new ConvexError({ code: "reply_page_mismatch" });
      }
    }

    // Rate limit: max 10 reactions per rolling 60s window per user.
    const now = Date.now();
    const recent = await ctx.db
      .query("reactions")
      .withIndex("by_user_and_created", (q) =>
        q.eq("userId", me._id).gte("createdAt", now - RATE_LIMIT_WINDOW_MS),
      )
      .take(RATE_LIMIT_MAX + 1);
    if (recent.length >= RATE_LIMIT_MAX) {
      throw new ConvexError({ code: "rate_limited", retryAfterMs: RATE_LIMIT_WINDOW_MS });
    }

    const reactionId = await ctx.db.insert("reactions", {
      clubId: args.clubId,
      bookId: args.bookId,
      chapterId: args.chapterId,
      page: args.page,
      paragraphIndex: args.paragraphIndex,
      userId: me._id,
      type: args.type,
      emoji: args.type === "emoji" ? args.emoji : undefined,
      text: args.type === "comment" ? args.text?.trim() : undefined,
      parentReactionId: args.parentReactionId,
      createdAt: now,
    });

    await ctx.db.patch(args.clubId, { lastActivityAt: now });

    // FR-030: schedule a reply push to the parent reaction's author.
    // The fanout action handles self-ping and throttle checks.
    if (args.parentReactionId) {
      await ctx.scheduler.runAfter(0, internal.notifications.sendReplyPushFanout, {
        reactionId,
      });
    }

    return reactionId;
  },
});

// FR-016 hot path. Reactions for a single page, gated by the caller's
// furthestPageReached so we never leak spoilers (FR-018). Returns top-level
// reactions only — replies are loaded separately via listReplies when the
// details sheet opens.
export const listForPage = query({
  args: {
    clubId: v.id("clubs"),
    // Exactly one of bookId / chapterId.
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
    page: v.number(),
  },
  returns: v.array(reactionWithUserValidator),
  handler: async (ctx, args) => {
    if ((args.bookId && args.chapterId) || (!args.bookId && !args.chapterId)) {
      return [];
    }
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    const membership = await membershipFor(ctx, args.clubId, me._id);
    if (!membership) return [];

    const furthest = await furthestPageFor(ctx, me._id, args.clubId, {
      bookId: args.bookId,
      chapterId: args.chapterId,
    });
    if (args.page > furthest) return [];

    const rows = args.bookId
      ? await ctx.db
          .query("reactions")
          .withIndex("by_book_and_page", (q) =>
            q.eq("bookId", args.bookId).eq("page", args.page),
          )
          .order("asc")
          .collect()
      : await ctx.db
          .query("reactions")
          .withIndex("by_chapter_and_page", (q) =>
            q.eq("chapterId", args.chapterId).eq("page", args.page),
          )
          .order("asc")
          .collect();
    const topLevel = rows.filter((r) => !r.parentReactionId);
    return await enrichWithUsers(ctx, topLevel);
  },
});

export const listReplies = query({
  args: { reactionId: v.id("reactions") },
  returns: v.array(reactionWithUserValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const parent = await ctx.db.get(args.reactionId);
    if (!parent) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    const membership = await membershipFor(ctx, parent.clubId, me._id);
    if (!membership) return [];

    const rows = await ctx.db
      .query("reactions")
      .withIndex("by_parent", (q) => q.eq("parentReactionId", args.reactionId))
      .order("asc")
      .collect();
    return await enrichWithUsers(ctx, rows);
  },
});

// Activity feed for the club's Book tab — last N reactions across the
// current book. Also spoiler-filtered: only reactions on pages the caller
// has already reached are returned (we err conservative; PRD's no-spoiler
// principle applies more broadly than just margins).
export const listForBook = query({
  args: {
    clubId: v.id("clubs"),
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
    limit: v.optional(v.number()),
  },
  returns: v.array(reactionWithUserValidator),
  handler: async (ctx, args) => {
    if ((args.bookId && args.chapterId) || (!args.bookId && !args.chapterId)) {
      return [];
    }
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    const membership = await membershipFor(ctx, args.clubId, me._id);
    if (!membership) return [];

    const furthest = await furthestPageFor(ctx, me._id, args.clubId, {
      bookId: args.bookId,
      chapterId: args.chapterId,
    });
    const limit = Math.min(args.limit ?? 20, 50);

    const rows = args.bookId
      ? await ctx.db
          .query("reactions")
          .withIndex("by_book_and_page", (q) => q.eq("bookId", args.bookId))
          .order("desc")
          .take(limit * 4)
      : await ctx.db
          .query("reactions")
          .withIndex("by_chapter_and_page", (q) => q.eq("chapterId", args.chapterId))
          .order("desc")
          .take(limit * 4);
    const visible = rows
      .filter((r) => !r.parentReactionId)
      .filter((r) => r.page <= furthest)
      .slice(0, limit);
    return await enrichWithUsers(ctx, visible);
  },
});

export const remove = mutation({
  args: { reactionId: v.id("reactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const reaction = await ctx.db.get(args.reactionId);
    if (!reaction) throw new ConvexError({ code: "not_found" });
    if (reaction.userId !== me._id) {
      throw new ConvexError({ code: "not_author" });
    }
    // Cascade replies — orphaned replies in the UI would be confusing.
    const replies = await ctx.db
      .query("reactions")
      .withIndex("by_parent", (q) => q.eq("parentReactionId", args.reactionId))
      .collect();
    for (const reply of replies) await ctx.db.delete(reply._id);
    await ctx.db.delete(args.reactionId);
    return null;
  },
});
