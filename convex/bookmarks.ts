import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Toggle a bookmark on the current page. Inserts a row if none exists, deletes
// the row if one already exists. Returns whether the page is now bookmarked.
export const toggle = mutation({
  args: {
    clubId: v.id("clubs"),
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
    page: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);

    // Membership gate — same as the progress.update pattern.
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", me._id),
      )
      .unique();
    if (!membership) throw new ConvexError({ code: "not_member" });

    const index = args.bookId
      ? ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_book", (q) =>
            q.eq("userId", me._id).eq("bookId", args.bookId),
          )
      : ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_chapter", (q) =>
            q.eq("userId", me._id).eq("chapterId", args.chapterId),
          );

    const existing = await index.collect();
    const match = existing.find((b) => b.page === args.page);

    if (match) {
      await ctx.db.delete(match._id);
      return false;
    }
    await ctx.db.insert("bookmarks", {
      userId: me._id,
      clubId: args.clubId,
      bookId: args.bookId,
      chapterId: args.chapterId,
      page: args.page,
      createdAt: Date.now(),
    });
    return true;
  },
});

// List all bookmarked pages for the current user on a given book or chapter.
export const listForContent = query({
  args: {
    bookId: v.optional(v.id("books")),
    chapterId: v.optional(v.id("chapters")),
  },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const rows = args.bookId
      ? await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_book", (q) =>
            q.eq("userId", me._id).eq("bookId", args.bookId),
          )
          .take(500)
      : args.chapterId
        ? await ctx.db
            .query("bookmarks")
            .withIndex("by_user_and_chapter", (q) =>
              q.eq("userId", me._id).eq("chapterId", args.chapterId),
            )
            .take(500)
        : [];

    return rows.map((b) => b.page);
  },
});
