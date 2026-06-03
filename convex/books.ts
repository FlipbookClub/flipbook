import { ConvexError, v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { isAdminEmail } from "./lib/admins";
import { getCurrentUser } from "./users";

const MAX_TITLE = 200;
const MAX_AUTHOR = 100;
const MAX_GENRE = 60;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — see FR-010

const bookValidator = v.object({
  _id: v.id("books"),
  _creationTime: v.number(),
  title: v.string(),
  author: v.string(),
  genre: v.optional(v.string()),
  pdfStorageId: v.id("_storage"),
  pdfPageCount: v.number(),
  coverImageUrl: v.optional(v.string()),
  uploadedByUserId: v.id("users"),
  clubId: v.id("clubs"),
  isPublic: v.boolean(),
  isRemoved: v.boolean(),
  fileSize: v.number(),
  status: v.optional(v.union(v.literal("current"), v.literal("library"))),
  currentlyReadingAt: v.optional(v.number()),
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
    genre: v.optional(v.string()),
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
    const genre = args.genre?.trim() || undefined;
    if (!title || title.length > MAX_TITLE) {
      throw new ConvexError({ code: "invalid_title" });
    }
    if (!author || author.length > MAX_AUTHOR) {
      throw new ConvexError({ code: "invalid_author" });
    }
    if (genre && genre.length > MAX_GENRE) {
      throw new ConvexError({ code: "invalid_genre" });
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
      genre,
      pdfStorageId: args.pdfStorageId,
      pdfPageCount: args.pdfPageCount,
      coverImageUrl: args.coverImageUrl,
      uploadedByUserId: me._id,
      clubId: args.clubId,
      isPublic: false, // Always false for MVP — DMCA exposure mitigation.
      isRemoved: false,
      fileSize: args.fileSize,
      // New uploads land in the library; the moderator promotes one to the
      // club's current read explicitly (see setCurrentlyReading).
      status: "library",
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

// FR-086 / Edge case "DMCA takedown received": admins flip isRemoved on a
// book row. The reader picks up the flag and renders the takedown message
// (Phase 3 already handles the rendering). No real admin UI for MVP — call
// this from the Convex dashboard "Run a function" panel.
export const markRemoved = mutation({
  args: { bookId: v.id("books"), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const identity = await ctx.auth.getUserIdentity();
    if (!isAdminEmail(identity?.email)) {
      throw new ConvexError({ code: "not_admin" });
    }
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError({ code: "not_found" });
    await ctx.db.patch(args.bookId, { isRemoved: true });
    // Lightweight audit trail — written to logs so the dashboard captures it.
    console.log("DMCA takedown", {
      bookId: args.bookId,
      title: book.title,
      adminUserId: me._id,
      reason: args.reason,
      at: new Date().toISOString(),
    });
    return null;
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

// The club's current read (or null). Member-only.
export const currentForClub = query({
  args: { clubId: v.id("clubs") },
  returns: v.union(v.null(), bookValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return null;
    const membership = await membershipFor(ctx, args.clubId, me._id);
    if (!membership) return null;

    const books = await ctx.db
      .query("books")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();
    const current = books
      .filter((b) => !b.isRemoved && b.status === "current")
      .sort((a, b) => (b.currentlyReadingAt ?? 0) - (a.currentlyReadingAt ?? 0));
    return current[0] ?? null;
  },
});

// Moderator-only: promote a book to the club's current read. Any other current
// book in the club is demoted to the library — one active read at a time.
export const setCurrentlyReading = mutation({
  args: { bookId: v.id("books") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const book = await ctx.db.get(args.bookId);
    if (!book || book.isRemoved) throw new ConvexError({ code: "book_not_found" });
    const club = await ctx.db.get(book.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) throw new ConvexError({ code: "not_moderator" });

    const clubBooks = await ctx.db
      .query("books")
      .withIndex("by_club", (q) => q.eq("clubId", book.clubId))
      .collect();
    for (const b of clubBooks) {
      if (b._id !== args.bookId && b.status === "current") {
        await ctx.db.patch(b._id, { status: "library" });
      }
    }
    const now = Date.now();
    await ctx.db.patch(args.bookId, { status: "current", currentlyReadingAt: now });
    await ctx.db.patch(book.clubId, { lastActivityAt: now });
    return null;
  },
});

// A book can be managed (edited / deleted) by the club moderator or by the
// member who uploaded it. Returns the book + club for reuse by the caller.
async function assertCanManageBook(
  ctx: MutationCtx,
  bookId: Id<"books">,
  userId: Id<"users">,
): Promise<{ book: Doc<"books">; club: Doc<"clubs"> }> {
  const book = await ctx.db.get(bookId);
  if (!book) throw new ConvexError({ code: "book_not_found" });
  const club = await ctx.db.get(book.clubId);
  if (!club) throw new ConvexError({ code: "club_not_found" });
  const isModerator = club.moderatorId === userId;
  const isUploader = book.uploadedByUserId === userId;
  if (!isModerator && !isUploader) {
    throw new ConvexError({ code: "not_allowed" });
  }
  return { book, club };
}

// Edit a book's title / author / genre. Moderator or the uploader.
export const updateMetadata = mutation({
  args: {
    bookId: v.id("books"),
    title: v.string(),
    author: v.string(),
    genre: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    await assertCanManageBook(ctx, args.bookId, me._id);

    const title = args.title.trim();
    const author = args.author.trim();
    const genre = args.genre?.trim() || undefined;
    if (!title || title.length > MAX_TITLE) {
      throw new ConvexError({ code: "invalid_title" });
    }
    if (!author || author.length > MAX_AUTHOR) {
      throw new ConvexError({ code: "invalid_author" });
    }
    if (genre && genre.length > MAX_GENRE) {
      throw new ConvexError({ code: "invalid_genre" });
    }
    await ctx.db.patch(args.bookId, { title, author, genre });
    return null;
  },
});

// Permanently delete a book and its dependent rows (progress + reactions) and
// the stored PDF. Moderator or the uploader. Irreversible — the client confirms.
export const remove = mutation({
  args: { bookId: v.id("books") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const { book } = await assertCanManageBook(ctx, args.bookId, me._id);

    const progressRows = await ctx.db
      .query("progress")
      .withIndex("by_book", (q) => q.eq("bookId", args.bookId))
      .collect();
    for (const row of progressRows) {
      await ctx.db.delete(row._id);
    }

    const reactionRows = await ctx.db
      .query("reactions")
      .withIndex("by_book_and_page", (q) => q.eq("bookId", args.bookId))
      .collect();
    for (const row of reactionRows) {
      await ctx.db.delete(row._id);
    }

    await ctx.storage.delete(book.pdfStorageId);
    await ctx.db.delete(args.bookId);
    return null;
  },
});

// Moderator-only: move a book out of "current" back to the library.
export const moveToLibrary = mutation({
  args: { bookId: v.id("books") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError({ code: "book_not_found" });
    const club = await ctx.db.get(book.clubId);
    if (!club) throw new ConvexError({ code: "club_not_found" });
    if (club.moderatorId !== me._id) throw new ConvexError({ code: "not_moderator" });
    await ctx.db.patch(args.bookId, { status: "library" });
    return null;
  },
});
