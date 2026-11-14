import { v } from "convex/values";

import { query } from "./_generated/server";

// S0-2 minimum-version gate. One row, key "app", edited by hand in the Convex
// dashboard. The app compares its own version against the minimum for its
// platform and shows a blocking update screen when it is lower (see
// src/lib/versionGate.ts for the rules, including every case that must NOT
// block).
//
// Deliberately public and unauthenticated: the gate has to work on the
// sign-in screen too, and nothing here is private.
export const getMinVersion = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      minVersionIos: v.string(),
      minVersionAndroid: v.string(),
      updateUrlIos: v.string(),
      updateUrlAndroid: v.string(),
    }),
  ),
  handler: async (ctx) => {
    // .first(), not .unique(): .unique() throws when two rows match, and a
    // duplicate row added by mistake in the dashboard must not break the
    // query for every install. The oldest row wins.
    const row = await ctx.db
      .query("appConfig")
      .withIndex("by_key", (q) => q.eq("key", "app"))
      .first();
    if (!row) return null;
    // Named fields only, so adding a field to the table later can never fail
    // return validation for builds already in readers' hands.
    return {
      minVersionIos: row.minVersionIos,
      minVersionAndroid: row.minVersionAndroid,
      updateUrlIos: row.updateUrlIos,
      updateUrlAndroid: row.updateUrlAndroid,
    };
  },
});
