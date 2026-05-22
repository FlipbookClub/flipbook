import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

const progressValidator = v.object({
  _id: v.id("progress"),
  _creationTime: v.number(),
  userId: v.id("users"),
  clubId: v.id("clubs"),
  bookId: v.optional(v.id("books")),
  currentPage: v.number(),
  totalPages: v.number(),
  furthestPageReached: v.number(),
  finishedAt: v.optional(v.number()),
  updatedAt: v.number(),
});

const progressWithUserValidator = v.object({
  ...progressValidator.fields,
  user: v.object({
    _id: v.id("users"),
    displayName: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatarUrl: v.optional(v.string()),
  }),
});

export const update = mutation({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    currentPage: v.number(),
    totalPages: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);

    if (args.currentPage < 1 || args.totalPages < 1 || args.currentPage > args.totalPages) {
      throw new ConvexError({ code: "invalid_page" });
    }

    // Only members can report progress. Anonymous progress is meaningless and
    // would skew the club's progress visualization.
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", me._id))
      .unique();
    if (!membership) throw new ConvexError({ code: "not_a_member" });

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_and_club", (q) => q.eq("userId", me._id).eq("clubId", args.clubId))
      .filter((q) => q.eq(q.field("bookId"), args.bookId))
      .unique();

    const now = Date.now();
    // currentPage is the literal "where I am right now" — can move forward
    // OR backward as the user re-reads. furthestPageReached is the monotonic
    // max (drives FR-018 spoiler filtering in Phase 4). Cross-device conflict
    // is resolved by last-write-wins on currentPage; that's the UX users
    // expect ("open where I left off") and Convex serializes writes anyway.
    const nextCurrent = args.currentPage;
    const nextFurthest = existing
      ? Math.max(existing.furthestPageReached, args.currentPage)
      : args.currentPage;
    // finishedAt sticks once set — re-reading earlier pages shouldn't
    // un-finish a book in the Library's Finished tab.
    const finishedAt =
      existing?.finishedAt ??
      (nextFurthest >= args.totalPages ? now : undefined);

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentPage: nextCurrent,
        totalPages: args.totalPages,
        furthestPageReached: nextFurthest,
        finishedAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("progress", {
        userId: me._id,
        clubId: args.clubId,
        bookId: args.bookId,
        currentPage: nextCurrent,
        totalPages: args.totalPages,
        furthestPageReached: nextFurthest,
        finishedAt,
        updatedAt: now,
      });
    }

    await ctx.db.patch(membership._id, { lastReadAt: now });
    await ctx.db.patch(args.clubId, { lastActivityAt: now });
    return null;
  },
});

export const getMine = query({
  args: { clubId: v.id("clubs"), bookId: v.optional(v.id("books")) },
  returns: v.union(v.null(), progressValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return null;

    const rows = await ctx.db
      .query("progress")
      .withIndex("by_user_and_club", (q) => q.eq("userId", me._id).eq("clubId", args.clubId))
      .collect();
    if (rows.length === 0) return null;

    if (args.bookId) {
      return rows.find((r) => r.bookId === args.bookId) ?? null;
    }
    // No bookId filter — return the most recent.
    return rows.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  },
});

export const listForClub = query({
  args: { clubId: v.id("clubs"), bookId: v.optional(v.id("books")) },
  returns: v.array(progressWithUserValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", me._id))
      .unique();
    if (!membership) return [];

    let rows: Doc<"progress">[];
    if (args.bookId) {
      rows = await ctx.db
        .query("progress")
        .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
        .collect();
      rows = rows.filter((r) => r.clubId === args.clubId);
    } else {
      rows = await ctx.db
        .query("progress")
        .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
        .collect();
    }

    const results = [];
    for (const r of rows) {
      const user = await ctx.db.get(r.userId);
      if (user) {
        results.push({
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
    }
    return results;
  },
});

export const listMine = query({
  args: {},
  returns: v.array(progressValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    return await ctx.db
      .query("progress")
      .withIndex("by_user_and_club", (q) => q.eq("userId", me._id))
      .collect();
  },
});

const libraryItemValidator = v.object({
  ...progressValidator.fields,
  book: v.object({
    _id: v.id("books"),
    title: v.string(),
    author: v.string(),
    pdfPageCount: v.number(),
    coverImageUrl: v.optional(v.string()),
    isRemoved: v.boolean(),
  }),
  club: v.object({
    _id: v.id("clubs"),
    name: v.string(),
  }),
});

// Library view: progress rows joined with their book + club. Powers the
// Library tab — Reading (finishedAt null) and Finished (finishedAt set).
export const listMyLibrary = query({
  args: {},
  returns: v.array(libraryItemValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const rows = await ctx.db
      .query("progress")
      .withIndex("by_user_and_club", (q) => q.eq("userId", me._id))
      .collect();

    const items = [];
    for (const r of rows) {
      if (!r.bookId) continue;
      const book = await ctx.db.get(r.bookId);
      if (!book) continue;
      const club = await ctx.db.get(r.clubId);
      if (!club) continue;
      items.push({
        ...r,
        book: {
          _id: book._id,
          title: book.title,
          author: book.author,
          pdfPageCount: book.pdfPageCount,
          coverImageUrl: book.coverImageUrl,
          isRemoved: book.isRemoved,
        },
        club: { _id: club._id, name: club.name },
      });
    }
    items.sort((a, b) => b.updatedAt - a.updatedAt);
    return items;
  },
});
