import { ConvexError, v } from "convex/values";

import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// First-impression seed (TASK-095). Given a book the founder has already
// uploaded to a (public) showcase club, this populates it with a few demo
// members — each with reading progress — and a lively spread of reactions, so
// testers who open it see an active reading room instead of an empty one.
//
// Run from the Convex dashboard:  internal.seed.seedReactionsForBook({ bookId })
// Idempotent: re-running won't duplicate users, memberships, or reactions.

const PERSONAS = [
  { slug: "ada", displayName: "Ada", firstName: "Ada", lastName: "O.", genres: ["Fiction", "Romance"] },
  { slug: "tunde", displayName: "Tunde", firstName: "Tunde", lastName: "A.", genres: ["Sci-Fi/Fantasy"] },
  { slug: "mara", displayName: "Mara", firstName: "Mara", lastName: "K.", genres: ["Mystery/Thriller"] },
  { slug: "deji", displayName: "Deji", firstName: "Deji", lastName: "B.", genres: ["Nonfiction", "History"] },
];

const EMOJIS = ["🔥", "❤️", "😭", "🤯", "💀", "✨"] as const;

// {pageFraction, persona, emoji?} or {pageFraction, persona, text}
const REACTIONS: Array<{ frac: number; p: number; emoji?: string; text?: string }> = [
  { frac: 0.02, p: 0, text: "Okay this opening line already has me." },
  { frac: 0.04, p: 1, emoji: "🔥" },
  { frac: 0.08, p: 2, text: "Did anyone else have to re-read this paragraph?" },
  { frac: 0.12, p: 0, emoji: "🤯" },
  { frac: 0.16, p: 3, text: "the imagery here is unreal" },
  { frac: 0.21, p: 1, emoji: "❤️" },
  { frac: 0.27, p: 2, emoji: "😭" },
  { frac: 0.33, p: 3, text: "calling it now — this character is trouble" },
  { frac: 0.4, p: 0, emoji: "✨" },
  { frac: 0.48, p: 1, text: "no because WHY would they do that" },
  { frac: 0.55, p: 2, emoji: "💀" },
  { frac: 0.63, p: 3, emoji: "🔥" },
];

export const seedReactionsForBook = internalMutation({
  args: { bookId: v.id("books") },
  returns: v.object({
    users: v.number(),
    memberships: v.number(),
    reactions: v.number(),
  }),
  handler: async (ctx, args) => {
    const book = await ctx.db.get(args.bookId);
    if (!book) throw new ConvexError({ code: "book_not_found" });
    const clubId = book.clubId;
    const totalPages = Math.max(1, book.pdfPageCount);
    const now = Date.now();

    // 1) Ensure demo users.
    const userIds: Id<"users">[] = [];
    let usersCreated = 0;
    for (const persona of PERSONAS) {
      const clerkId = `seed:${persona.slug}`;
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .unique();
      if (existing) {
        userIds.push(existing._id);
        continue;
      }
      const id = await ctx.db.insert("users", {
        clerkId,
        displayName: persona.displayName,
        firstName: persona.firstName,
        lastName: persona.lastName,
        genres: persona.genres,
        proSubscriptionStatus: "free",
        createdAt: now,
        lastActiveAt: now,
      });
      userIds.push(id);
      usersCreated += 1;
    }

    // 2) Ensure memberships + reading progress on this book.
    let membershipsCreated = 0;
    for (let i = 0; i < userIds.length; i += 1) {
      const userId = userIds[i];
      const member = await ctx.db
        .query("memberships")
        .withIndex("by_club_and_user", (q) => q.eq("clubId", clubId).eq("userId", userId))
        .unique();
      if (!member) {
        await ctx.db.insert("memberships", {
          clubId,
          userId,
          role: "member",
          joinedAt: now,
          isFollowing: false,
        });
        membershipsCreated += 1;
      }
      // Varied reading progress so the room lobby shows a range of "pages read".
      const pct = [0.65, 0.4, 0.25, 0.8][i % 4];
      const currentPage = Math.max(1, Math.round(totalPages * pct));
      const progress = await ctx.db
        .query("progress")
        .withIndex("by_user_and_club", (q) => q.eq("userId", userId).eq("clubId", clubId))
        .collect();
      const existingForBook = progress.find((p) => p.bookId === args.bookId);
      if (!existingForBook) {
        await ctx.db.insert("progress", {
          userId,
          clubId,
          bookId: args.bookId,
          currentPage,
          totalPages,
          furthestPageReached: currentPage,
          updatedAt: now,
        });
      }
    }
    if (membershipsCreated > 0) {
      await ctx.db.patch(clubId, {
        memberCount: ((await ctx.db.get(clubId))?.memberCount ?? 0) + membershipsCreated,
        lastActivityAt: now,
      });
    }

    // 3) Reactions — skip if already seeded (idempotent on re-run).
    const already = await ctx.db
      .query("reactions")
      .withIndex("by_book_and_page", (q) => q.eq("bookId", args.bookId))
      .first();
    let reactionsCreated = 0;
    if (!already) {
      for (let i = 0; i < REACTIONS.length; i += 1) {
        const r = REACTIONS[i];
        const userId = userIds[r.p % userIds.length];
        const page = Math.min(totalPages, Math.max(1, Math.round(totalPages * r.frac) || 1));
        const isComment = !!r.text;
        await ctx.db.insert("reactions", {
          clubId,
          bookId: args.bookId,
          page,
          userId,
          type: isComment ? "comment" : "emoji",
          emoji: isComment ? undefined : (r.emoji ?? EMOJIS[i % EMOJIS.length]),
          text: isComment ? r.text : undefined,
          createdAt: now + i * 1000,
        });
        reactionsCreated += 1;
      }
      await ctx.db.patch(clubId, { lastActivityAt: now });
    }

    return { users: usersCreated, memberships: membershipsCreated, reactions: reactionsCreated };
  },
});
