import { ConvexError, v } from "convex/values";

import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

const notificationTypeValidator = v.union(
  v.literal("chapter_drop"),
  v.literal("reaction_reply"),
  v.literal("club_invite"),
  v.literal("milestone"),
);

const notificationValidator = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  userId: v.id("users"),
  type: notificationTypeValidator,
  title: v.string(),
  body: v.string(),
  deepLink: v.string(),
  isRead: v.boolean(),
  sentAt: v.number(),
  relatedId: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// Public queries + mutations
// ---------------------------------------------------------------------------

export const list = query({
  args: { onlyUnread: v.optional(v.boolean()), limit: v.optional(v.number()) },
  returns: v.array(notificationValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!me) return [];

    const limit = Math.min(args.limit ?? 50, 100);
    if (args.onlyUnread) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) => q.eq("userId", me._id).eq("isRead", false))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_and_sent", (q) => q.eq("userId", me._id))
      .order("desc")
      .take(limit);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    const n = await ctx.db.get(args.notificationId);
    if (!n) throw new ConvexError({ code: "not_found" });
    if (n.userId !== me._id) throw new ConvexError({ code: "not_owner" });
    if (!n.isRead) await ctx.db.patch(args.notificationId, { isRead: true });
    return null;
  },
});

export const markAllRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", me._id).eq("isRead", false))
      .take(500);
    for (const n of unread) await ctx.db.patch(n._id, { isRead: true });
    return null;
  },
});

// ---------------------------------------------------------------------------
// Internal — chapter-drop fanout (FR-029)
// ---------------------------------------------------------------------------

// Snapshot the chapter + author + followers in one query so the action has
// all the data it needs to fan out without round-tripping per follower.
export const collectChapterDropAudience = internalQuery({
  args: { chapterId: v.id("chapters") },
  returns: v.union(
    v.null(),
    v.object({
      chapter: v.object({
        _id: v.id("chapters"),
        clubId: v.id("clubs"),
        title: v.string(),
        chapterNumber: v.number(),
      }),
      clubName: v.string(),
      authorName: v.string(),
      recipients: v.array(
        v.object({
          userId: v.id("users"),
          pushToken: v.optional(v.string()),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) return null;
    const club = await ctx.db.get(chapter.clubId);
    if (!club) return null;
    const author = await ctx.db.get(chapter.publishedByUserId);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_club", (q) => q.eq("clubId", chapter.clubId))
      .collect();

    const recipients = [] as Array<{ userId: Id<"users">; pushToken?: string }>;
    for (const m of memberships) {
      // Skip the publisher themselves — they don't need a notification.
      if (m.userId === chapter.publishedByUserId) continue;
      const user = await ctx.db.get(m.userId);
      if (!user) continue;
      // FR-087: honor per-user notification preferences. Unset = opt-in.
      if (user.notificationPrefs && !user.notificationPrefs.chapterDrops) continue;
      recipients.push({ userId: user._id, pushToken: user.pushToken });
    }

    return {
      chapter: {
        _id: chapter._id,
        clubId: chapter.clubId,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
      },
      clubName: club.name,
      authorName: author?.displayName ?? "Someone",
      recipients,
    };
  },
});

// Persist a notification row. Called by the fanout action so the user's
// in-app notification list always reflects the push.
export const recordNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: notificationTypeValidator,
    title: v.string(),
    body: v.string(),
    deepLink: v.string(),
    relatedId: v.optional(v.string()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      deepLink: args.deepLink,
      isRead: false,
      sentAt: Date.now(),
      relatedId: args.relatedId,
    });
  },
});

interface ExpoPushTicket {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
}

interface ExpoPushResponse {
  data?: ExpoPushTicket[];
  errors?: Array<{ code: string; message: string }>;
}

// Best-effort POST to Expo's Push API. Failures are logged but don't throw —
// a failed push shouldn't roll back the chapter publish (FR-029 acceptance:
// "Notifications dispatched within 30s" is a SLO, not a transactional
// requirement, and the in-app notification row is the durable record).
async function sendExpoBatch(
  messages: Array<{
    to: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
  }>,
): Promise<void> {
  if (messages.length === 0) return;
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    const json = (await res.json()) as ExpoPushResponse;
    if (json.errors?.length) {
      console.error("expo push errors", json.errors);
    }
  } catch (err) {
    console.error("expo push fetch failed", err);
  }
}

export const sendChapterDropFanout = internalAction({
  args: { chapterId: v.id("chapters") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const snapshot = await ctx.runQuery(
      internal.notifications.collectChapterDropAudience,
      { chapterId: args.chapterId },
    );
    if (!snapshot) return null;

    const title = snapshot.clubName;
    const body = `${snapshot.authorName} just dropped Chapter ${snapshot.chapter.chapterNumber}: ${snapshot.chapter.title}. The room's filling up.`;
    const deepLink = `flipbook://clubs/${snapshot.chapter.clubId}/chapters/${snapshot.chapter._id}`;

    const pushMessages: Parameters<typeof sendExpoBatch>[0] = [];
    for (const r of snapshot.recipients) {
      await ctx.runMutation(internal.notifications.recordNotification, {
        userId: r.userId,
        type: "chapter_drop",
        title,
        body,
        deepLink,
        relatedId: snapshot.chapter._id,
      });
      if (r.pushToken) {
        pushMessages.push({
          to: r.pushToken,
          title,
          body,
          data: { deepLink, type: "chapter_drop", relatedId: snapshot.chapter._id },
        });
      }
    }
    // Expo accepts up to 100 messages per POST.
    for (let i = 0; i < pushMessages.length; i += 100) {
      await sendExpoBatch(pushMessages.slice(i, i + 100));
    }
    return null;
  },
});

// ---------------------------------------------------------------------------
// Internal — reaction-reply fanout (FR-030)
// ---------------------------------------------------------------------------

// One-minute throttle key per recipient so replies in quick succession
// collapse into a single push (FR-030 acceptance).
const REPLY_PUSH_THROTTLE_MS = 60_000;

export const collectReplyAudience = internalQuery({
  args: { reactionId: v.id("reactions") },
  returns: v.union(
    v.null(),
    v.object({
      recipient: v.object({
        userId: v.id("users"),
        pushToken: v.optional(v.string()),
      }),
      replierName: v.string(),
      clubName: v.string(),
      contextTitle: v.string(),
      deepLink: v.string(),
      shouldThrottle: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const reply = await ctx.db.get(args.reactionId);
    if (!reply || !reply.parentReactionId) return null;
    const parent = await ctx.db.get(reply.parentReactionId);
    if (!parent) return null;
    // No self-pings.
    if (parent.userId === reply.userId) return null;
    const recipient = await ctx.db.get(parent.userId);
    if (!recipient) return null;
    // FR-087: honor opt-out.
    if (recipient.notificationPrefs && !recipient.notificationPrefs.reactionReplies) {
      return null;
    }
    const replier = await ctx.db.get(reply.userId);
    const club = await ctx.db.get(reply.clubId);

    let contextTitle = "your reaction";
    let deepLink = `flipbook://clubs/${reply.clubId}`;
    if (reply.bookId) {
      const book = await ctx.db.get(reply.bookId);
      if (book) contextTitle = book.title;
      deepLink = `flipbook://clubs/${reply.clubId}/books/${reply.bookId}?page=${reply.page}`;
    } else if (reply.chapterId) {
      const chapter = await ctx.db.get(reply.chapterId);
      if (chapter) contextTitle = chapter.title;
      deepLink = `flipbook://clubs/${reply.clubId}/chapters/${reply.chapterId}?page=${reply.page}`;
    }

    // Throttle: if the recipient got a reply notification within the last
    // minute, swallow this one so they don't get pinged repeatedly.
    const recent = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_sent", (q) => q.eq("userId", recipient._id))
      .order("desc")
      .take(5);
    const shouldThrottle = recent.some(
      (n) =>
        n.type === "reaction_reply" &&
        Date.now() - n.sentAt < REPLY_PUSH_THROTTLE_MS,
    );

    return {
      recipient: { userId: recipient._id, pushToken: recipient.pushToken },
      replierName: replier?.displayName ?? "Someone",
      clubName: club?.name ?? "Flipbook",
      contextTitle,
      deepLink,
      shouldThrottle,
    };
  },
});

export const sendReplyPushFanout = internalAction({
  args: { reactionId: v.id("reactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const snap = await ctx.runQuery(internal.notifications.collectReplyAudience, {
      reactionId: args.reactionId,
    });
    if (!snap) return null;
    if (snap.shouldThrottle) return null;

    const title = snap.clubName;
    const body = `${snap.replierName} replied to your reaction in ${snap.contextTitle}.`;

    await ctx.runMutation(internal.notifications.recordNotification, {
      userId: snap.recipient.userId,
      type: "reaction_reply",
      title,
      body,
      deepLink: snap.deepLink,
      relatedId: args.reactionId,
    });
    if (snap.recipient.pushToken) {
      await sendExpoBatch([
        {
          to: snap.recipient.pushToken,
          title,
          body,
          data: { deepLink: snap.deepLink, type: "reaction_reply", relatedId: args.reactionId },
        },
      ]);
    }
    return null;
  },
});

// Re-export with PRD-aligned name; internal-only because pushes are never
// driven by client mutations directly.
export type NotificationDoc = Doc<"notifications">;
