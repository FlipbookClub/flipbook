import { v } from "convex/values";

import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { fetchClerkAccounts } from "./newsletter";
import { unsubscribeUrl } from "./lib/emailAuth";

// P5-T5 / FB-012. Weekly re-engagement, two audiences:
//   - club owners get a digest of what happened in their club
//   - readers get a note about the book they are in the middle of
//
// SHIPS INERT. Nothing sends unless REENGAGEMENT_EMAILS_ENABLED is "true" on
// the deployment. This is recurring mail to real people; merging a feature
// must not be what starts it.
//   npx convex env set REENGAGEMENT_EMAILS_ENABLED true --prod
//
// ⚠️ COPY IS PLACEHOLDER — AYODEJI TO WRITE. Everything inside the two build*
// functions below is scaffolding written to be obviously provisional, not
// brand voice. The pipeline, the audience rules, the unsubscribe and the
// idempotency are the parts meant for review as engineering; the words are
// not. Do not send with this copy.

const DEFAULT_FROM = "Moks at Flipbook <hello@useflipbook.com>";
const REPLY_TO = "hello@useflipbook.com";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Nobody who used the app in the last two days needs calling back to it.
const RECENTLY_ACTIVE_MS = 2 * 24 * 60 * 60 * 1000;

type DigestRow = {
  userId: Id<"users">;
  clerkId: string;
  displayName: string;
  clubName: string;
  newBooks: number;
  newReactions: number;
  memberCount: number;
};

type ProgressRow = {
  userId: Id<"users">;
  clerkId: string;
  displayName: string;
  bookTitle: string;
  clubName: string;
  percent: number | null;
  page: number | null;
  totalPages: number | null;
};

export const collectWeeklyAudience = internalQuery({
  // Passed in rather than read here so the query stays deterministic.
  args: { nowMs: v.number() },
  returns: v.object({
    digests: v.array(
      v.object({
        userId: v.id("users"),
        clerkId: v.string(),
        displayName: v.string(),
        clubName: v.string(),
        newBooks: v.number(),
        newReactions: v.number(),
        memberCount: v.number(),
      }),
    ),
    progressNotes: v.array(
      v.object({
        userId: v.id("users"),
        clerkId: v.string(),
        displayName: v.string(),
        bookTitle: v.string(),
        clubName: v.string(),
        percent: v.union(v.null(), v.number()),
        page: v.union(v.null(), v.number()),
        totalPages: v.union(v.null(), v.number()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const since = args.nowMs - WEEK_MS;
    const digests: DigestRow[] = [];
    const progressNotes: ProgressRow[] = [];

    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      const prefs = user.emailPrefs;
      const recentlyActive = args.nowMs - user.lastActiveAt < RECENTLY_ACTIVE_MS;

      // --- club-owner digest ---
      if (prefs?.weeklyDigest !== false) {
        const owned = await ctx.db
          .query("clubs")
          .withIndex("by_moderator", (q) => q.eq("moderatorId", user._id))
          .collect();

        for (const club of owned) {
          const books = await ctx.db
            .query("books")
            .withIndex("by_club", (q) => q.eq("clubId", club._id))
            .collect();
          const newBooks = books.filter(
            (b) => !b.isRemoved && b.createdAt >= since,
          ).length;

          const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_club", (q) => q.eq("clubId", club._id))
            .collect();
          const newReactions = reactions.filter((r) => r.createdAt >= since).length;

          // A digest of nothing is worse than no digest: it reports an empty
          // week back to the person most likely to feel responsible for it.
          if (newBooks === 0 && newReactions === 0) continue;

          digests.push({
            userId: user._id,
            clerkId: user.clerkId,
            displayName: user.displayName,
            clubName: club.name,
            newBooks,
            newReactions,
            memberCount: club.memberCount,
          });
        }
      }

      // --- reader progress note ---
      // Skipped for anyone who has been in the app recently; this is for
      // people who drifted, not people who are already here.
      if (prefs?.progressNote !== false && !recentlyActive) {
        const rows = await ctx.db
          .query("progress")
          .withIndex("by_user_and_club", (q) => q.eq("userId", user._id))
          .collect();
        const latest = rows
          .filter((r) => r.bookId && !r.finishedAt)
          .sort((a, b) => b.updatedAt - a.updatedAt)[0];
        if (latest?.bookId) {
          const book = await ctx.db.get(latest.bookId);
          const club = await ctx.db.get(latest.clubId);
          if (book && !book.isRemoved && club) {
            progressNotes.push({
              userId: user._id,
              clerkId: user.clerkId,
              displayName: user.displayName,
              bookTitle: book.title,
              clubName: club.name,
              percent: latest.percentComplete ?? null,
              page: latest.percentComplete === undefined ? latest.currentPage : null,
              totalPages:
                latest.percentComplete === undefined ? latest.totalPages : null,
            });
          }
        }
      }
    }

    return { digests, progressNotes };
  },
});

// ⚠️ PLACEHOLDER COPY — AYODEJI. Deliberately plain so it cannot be mistaken
// for finished brand voice if it ever reaches an inbox by accident.
function buildDigest(row: DigestRow, unsubUrl: string) {
  const bits = [
    row.newBooks > 0 ? `${row.newBooks} new book${row.newBooks === 1 ? "" : "s"}` : null,
    row.newReactions > 0
      ? `${row.newReactions} reaction${row.newReactions === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  const subject = `[PLACEHOLDER] This week in ${row.clubName}`;
  const text = `Hi ${row.displayName},

This week in ${row.clubName}: ${bits.join(" and ")}. ${row.memberCount} member${row.memberCount === 1 ? "" : "s"}.

[PLACEHOLDER COPY — pending final wording.]

Victory Moks
Flipbook

Stop receiving weekly club digests: ${unsubUrl}`;
  return { subject, text };
}

// ⚠️ PLACEHOLDER COPY — AYODEJI.
function buildProgressNote(row: ProgressRow, unsubUrl: string) {
  const where =
    row.percent !== null
      ? `${Math.round(row.percent)}% in`
      : row.page !== null
        ? `on page ${row.page}${row.totalPages ? ` of ${row.totalPages}` : ""}`
        : "part-way through";

  const subject = `[PLACEHOLDER] ${row.bookTitle} is still open`;
  const text = `Hi ${row.displayName},

You're ${where} of ${row.bookTitle}, with ${row.clubName}.

[PLACEHOLDER COPY — pending final wording. Tone: warm, no guilt, no counting
of days missed.]

Victory Moks
Flipbook

Stop receiving reading notes: ${unsubUrl}`;
  return { subject, text };
}

async function sendOne(
  apiKey: string,
  to: string,
  subject: string,
  text: string,
  unsubUrl: string,
): Promise<boolean> {
  const from = process.env.WAITLIST_FROM_EMAIL ?? DEFAULT_FROM;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      text,
      // A real one-click unsubscribe this time, not the newsletter's mailto:
      // the endpoint writes emailPrefs, so honouring it is automatic.
      headers: { "List-Unsubscribe": `<${unsubUrl}>` },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[reengagement] send failed (${res.status}) for ${to}: ${detail}`);
    return false;
  }
  return true;
}

export const sendWeeklyReengagement = internalAction({
  args: { dryRun: v.optional(v.boolean()) },
  returns: v.object({
    digests: v.number(),
    progressNotes: v.number(),
    sent: v.number(),
    skipped: v.string(),
  }),
  handler: async (ctx, args): Promise<{
    digests: number;
    progressNotes: number;
    sent: number;
    skipped: string;
  }> => {
    const dryRun = args.dryRun ?? false;
    if (!dryRun && process.env.REENGAGEMENT_EMAILS_ENABLED !== "true") {
      return {
        digests: 0,
        progressNotes: 0,
        sent: 0,
        skipped: "REENGAGEMENT_EMAILS_ENABLED is not 'true'",
      };
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey && !dryRun) {
      return { digests: 0, progressNotes: 0, sent: 0, skipped: "RESEND_API_KEY not set" };
    }

    const now = Date.now();
    const { digests, progressNotes } = await ctx.runQuery(
      internal.reengagement.collectWeeklyAudience,
      { nowMs: now },
    );

    if (dryRun) {
      return {
        digests: digests.length,
        progressNotes: progressNotes.length,
        sent: 0,
        skipped: "dry run",
      };
    }

    // clerkId -> email. The users table has no address; Clerk is the source.
    const accounts = await fetchClerkAccounts();
    const emailByClerkId = new Map(accounts.map((a) => [a.id, a.email]));

    // Reuses the newsletter's send ledger so a re-run inside the same week is
    // a no-op rather than a second copy — the same protection, and the same
    // reason, as the September broadcast.
    const week = Math.floor(now / WEEK_MS);
    let sent = 0;

    for (const row of digests) {
      const to = emailByClerkId.get(row.clerkId);
      if (!to) continue;
      const campaign = `digest-${week}`;
      const first = await ctx.runMutation(internal.newsletter.recordSend, {
        campaign,
        email: to,
        sentAt: now,
      });
      if (!first) continue;
      const unsub = await unsubscribeUrl(row.userId, "weeklyDigest");
      const { subject, text } = buildDigest(row, unsub);
      if (await sendOne(apiKey!, to, subject, text, unsub)) sent += 1;
    }

    for (const row of progressNotes) {
      const to = emailByClerkId.get(row.clerkId);
      if (!to) continue;
      const campaign = `progress-${week}`;
      const first = await ctx.runMutation(internal.newsletter.recordSend, {
        campaign,
        email: to,
        sentAt: now,
      });
      if (!first) continue;
      const unsub = await unsubscribeUrl(row.userId, "progressNote");
      const { subject, text } = buildProgressNote(row, unsub);
      if (await sendOne(apiKey!, to, subject, text, unsub)) sent += 1;
    }

    console.log(
      `[reengagement] digests=${digests.length} notes=${progressNotes.length} sent=${sent}`,
    );
    return {
      digests: digests.length,
      progressNotes: progressNotes.length,
      sent,
      skipped: "",
    };
  },
});

// Flips one email preference off. Called by the unsubscribe endpoint, which
// has no authenticated user — the signature in the link is the authorisation.
export const setEmailPref = internalMutation({
  args: {
    userId: v.id("users"),
    pref: v.union(v.literal("weeklyDigest"), v.literal("progressNote")),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;
    const current = user.emailPrefs ?? { weeklyDigest: true, progressNote: true };
    await ctx.db.patch(args.userId, {
      emailPrefs: { ...current, [args.pref]: false },
    });
    return true;
  },
});
