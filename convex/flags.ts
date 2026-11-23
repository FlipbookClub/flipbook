import { v } from "convex/values";

import { internalMutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { isFlagOn } from "./lib/flagRollout";

// S0-7 feature flags. Rows are edited by hand in the Convex dashboard: flip
// `enabled`, set `rolloutPercent` (0-100), or add user ids to `allowUserIds`.
// The app reads them live through `listEnabled`, so a change reaches running
// phones within seconds, without a rebuild.

// Flags the code expects to exist. `ensureDefaults` creates any that are
// missing, switched off; it never changes a row that already exists.
export const DEFAULT_FLAGS = ["v2_shell"] as const;

// Far above the number of flags this app will ever have; the query must stay
// bounded all the same.
const MAX_FLAGS = 200;

async function currentUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  return user?._id ?? null;
}

// The keys of every flag that is on for the caller, and nothing else: the
// app never sees allow-lists or percentages. Public and usable signed out.
export const listEnabled = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    const rows = await ctx.db.query("flags").take(MAX_FLAGS);
    return rows
      .filter((row) =>
        isFlagOn(
          {
            enabled: row.enabled,
            rolloutPercent: row.rolloutPercent,
            allowUserIds: row.allowUserIds,
          },
          row.key,
          userId,
        ),
      )
      .map((row) => row.key);
  },
});

// Run once per deployment:
//   npx convex run flags:ensureDefaults          (development)
//   npx convex run flags:ensureDefaults --prod   (production)
// Returns the keys it created; running it again creates nothing.
export const ensureDefaults = internalMutation({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const created: string[] = [];
    for (const key of DEFAULT_FLAGS) {
      const existing = await ctx.db
        .query("flags")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) continue;
      await ctx.db.insert("flags", {
        key,
        enabled: false,
        rolloutPercent: 0,
        allowUserIds: [],
      });
      created.push(key);
    }
    return created;
  },
});
