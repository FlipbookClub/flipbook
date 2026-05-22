import { ConvexError, v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

const MAX_TITLE = 200;
const MAX_AUTHOR = 100;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — see FR-010

const bookValidator = v.object({
  _id: v.id("books"),
  _creationTime: v.number(),
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
  createdAt: v.number(),
});

async function membershipFor(
  ctx: QueryCtx | MutationCtx,
  clubId: Id<"clubs">,
  userId: Id<"users">,
): Promise<Doc<"memberships"> | null> {
  return await ctx.db
    .query("memberships")
    .withIndex("by_club_and_user", (q) => q.eq("clubId", clubId).eq("userId", userId))
    .unique();
}

async function assertCanUpload(
  ctx: MutationCtx,
  clubId: Id<"clubs">,
  userId: Id<"users">,
): Promise<Doc<"clubs">> {
  const club = await ctx.db.get(clubId);
  if (!club) throw new ConvexError({ code: "club_not_found" });
  const isModerator = club.moderatorId === userId;
  if (isModerator) return club;
  const membership = await membershipFor(ctx, clubId, userId);
  if (!membership) throw new ConvexError({ code: "not_a_member" });
  if (!club.permissions.membersCanUploadBooks) {
    throw new ConvexError({ code: "uploads_disabled_for_members" });
  }
  return club;
}

export const generateUploadUrl = mutation({
  args: { clubId: v.id("clubs") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    await assertCanUpload(ctx, args.clubId, me._id);
    return await ctx.storage.generateUploadUrl();
  },
});

export const register = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.string(),
    author: v.string(),
    pdfStorageId: v.id("_storage"),
    pdfPageCount: v.number(),
    fileSize: v.number(),
    coverImageUrl: v.optional(v.string()),
  },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    await assertCanUpload(ctx, args.clubId, me._id);

    const title = args.title.trim();
    const author = args.author.trim();
    if (!title || title.length > MAX_TITLE) {
      throw new ConvexError({ code: "invalid_title" });
    }
    if (!author || author.length > MAX_AUTHOR) {
      throw new ConvexError({ code: "invalid_author" });
    }
    if (args.pdfPageCount <= 0) {
      throw new ConvexError({ code: "invalid_page_count" });
    }
    if (args.fileSize <= 0 || args.fileSize > MAX_FILE_SIZE) {
      throw new ConvexError({ code: "file_too_large", max: MAX_FILE_SIZE });
    }

    // Verify the storage object actually exists — guards against a client
    // registering a stale or bogus storage ID after a failed upload.
    const metadata = await ctx.db.system.get(args.pdfStorageId);
    if (!metadata) {
      throw new ConvexError({ code: "storage_object_missing" });
    }

    const now = Date.now();
    const bookId = await ctx.db.insert("books", {
      title,
      author,
      pdfStorageId: args.pdfStorageId,
      pdfPageCount: args.pdfPageCount,
      coverImageUrl: args.coverImageUrl,
      uploadedByUserId: me._id,
      clubId: args.clubId,
      isPublic: false, // Always false for MVP — DMCA exposure mitigation.
      isRemoved: false,
      fileSize: args.fileSize,
      createdAt: now,
    });
    await ctx.db.patch(args.clubId, { lastActivityAt: now });
    return bookId;
  },
});

export const get = query({
  args: { bookId: v.id("books") },
  returns: v.union(
    v.null(),
    v.object({
      book: bookValidator,
      pdfUrl: v.union(v.null(), v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return null;
    const membership = await membershipFor(ctx, book.clubId, me._id);
    if (!membership) return null;

    // FR-010 / Edge case: signed URL is fetched fresh on every query so the
    // reader can detect expiration and re-query. Return null pdfUrl when the
    // book is marked removed (DMCA) so the reader renders the takedown state.
    const pdfUrl = book.isRemoved ? null : await ctx.storage.getUrl(book.pdfStorageId);
    return { book, pdfUrl };
  },
});

export const listForClub = query({
  args: { clubId: v.id("clubs") },
  returns: v.array(bookValidator),
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
      .query("books")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .order("desc")
      .take(50);
  },
});
