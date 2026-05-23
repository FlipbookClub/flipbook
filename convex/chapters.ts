import { ConvexError, v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

const MAX_TITLE = 200;
const MAX_AUTHOR_NOTE = 500;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const chapterValidator = v.object({
  _id: v.id("chapters"),
  _creationTime: v.number(),
  clubId: v.id("clubs"),
  title: v.string(),
  chapterNumber: v.number(),
  pdfStorageId: v.id("_storage"),
  pdfPageCount: v.number(),
  publishedAt: v.number(),
  publishedByUserId: v.id("users"),
  authorNote: v.optional(v.string()),
  fileSize: v.number(),
});

async function assertModeratorOfCreator(
  ctx: MutationCtx,
  clubId: Id<"clubs">,
  userId: Id<"users">,
): Promise<Doc<"clubs">> {
  const club = await ctx.db.get(clubId);
  if (!club) throw new ConvexError({ code: "club_not_found" });
  if (club.moderatorId !== userId) {
    throw new ConvexError({ code: "not_moderator" });
  }
  if (club.type !== "creator") {
    // Standard clubs use the books table; chapters are only for creator clubs.
    throw new ConvexError({ code: "not_a_creator_club" });
  }
  return club;
}

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

// Upload URL is generated via books.generateUploadUrl — the storage layer
// doesn't care whether the bytes become a book or a chapter — but we accept
// a chapter-scoped variant here for symmetry + the moderator-only auth check.
export const generateUploadUrl = mutation({
  args: { clubId: v.id("clubs") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    await assertModeratorOfCreator(ctx, args.clubId, me._id);
    return await ctx.storage.generateUploadUrl();
  },
});

export const publish = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.string(),
    pdfStorageId: v.id("_storage"),
    pdfPageCount: v.number(),
    fileSize: v.number(),
    authorNote: v.optional(v.string()),
  },
  returns: v.id("chapters"),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    await assertModeratorOfCreator(ctx, args.clubId, me._id);

    const title = args.title.trim();
    if (!title || title.length > MAX_TITLE) {
      throw new ConvexError({ code: "invalid_title" });
    }
    if (args.authorNote && args.authorNote.length > MAX_AUTHOR_NOTE) {
      throw new ConvexError({ code: "author_note_too_long" });
    }
    if (args.pdfPageCount <= 0) {
      throw new ConvexError({ code: "invalid_page_count" });
    }
    if (args.fileSize <= 0 || args.fileSize > MAX_FILE_SIZE) {
      throw new ConvexError({ code: "file_too_large", max: MAX_FILE_SIZE });
    }
    const storageMeta = await ctx.db.system.get(args.pdfStorageId);
    if (!storageMeta) throw new ConvexError({ code: "storage_object_missing" });

    // Auto-increment chapterNumber: highest existing + 1.
    const latest = await ctx.db
      .query("chapters")
      .withIndex("by_club_and_number", (q) => q.eq("clubId", args.clubId))
      .order("desc")
      .first();
    const chapterNumber = latest ? latest.chapterNumber + 1 : 1;

    const now = Date.now();
    const chapterId = await ctx.db.insert("chapters", {
      clubId: args.clubId,
      title,
      chapterNumber,
      pdfStorageId: args.pdfStorageId,
      pdfPageCount: args.pdfPageCount,
      publishedAt: now,
      publishedByUserId: me._id,
      authorNote: args.authorNote?.trim() || undefined,
      fileSize: args.fileSize,
    });
    await ctx.db.patch(args.clubId, { lastActivityAt: now });

    // FR-029: schedule push fanout. Scheduler at 0 means "as soon as the
    // mutation commits"; the action runs separately and won't roll back
    // the chapter publish if pushes fail.
    await ctx.scheduler.runAfter(0, internal.notifications.sendChapterDropFanout, {
      chapterId,
    });

    return chapterId;
  },
});

export const list = query({
  args: { clubId: v.id("clubs") },
  returns: v.array(chapterValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];
    const membership = await membershipFor(ctx, args.clubId, me._id);
    if (!membership) return [];

    return await ctx.db
      .query("chapters")
      .withIndex("by_club_and_number", (q) => q.eq("clubId", args.clubId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { chapterId: v.id("chapters") },
  returns: v.union(
    v.null(),
    v.object({
      chapter: chapterValidator,
      pdfUrl: v.union(v.null(), v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return null;
    const membership = await membershipFor(ctx, chapter.clubId, me._id);
    if (!membership) return null;

    const pdfUrl = await ctx.storage.getUrl(chapter.pdfStorageId);
    return { chapter, pdfUrl };
  },
});
