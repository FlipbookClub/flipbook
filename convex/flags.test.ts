import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { clampPercent, isFlagOn, rolloutBucket } from "./lib/flagRollout";
import schema from "./schema";
import { modules } from "./test.setup";

// S0-7. The rollout rule on its own, then flags.listEnabled end to end
// against an in-memory Convex.

type Ctx = ReturnType<typeof convexTest>;

async function addUser(t: Ctx, clerkId: string): Promise<Id<"users">> {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      displayName: clerkId,
      firstName: "Test",
      lastName: "Reader",
      genres: [],
      proSubscriptionStatus: "free",
      createdAt: 0,
      lastActiveAt: 0,
    }),
  );
}

async function addFlag(
  t: Ctx,
  key: string,
  fields: { enabled: boolean; rolloutPercent: number; allowUserIds?: Id<"users">[] },
) {
  await t.run(async (ctx) =>
    ctx.db.insert("flags", { key, allowUserIds: [], ...fields }),
  );
}

describe("rollout rule", () => {
  test("a disabled flag is off for everyone, even allow-listed users", () => {
    const rule = { enabled: false, rolloutPercent: 100, allowUserIds: ["u1"] };
    expect(isFlagOn(rule, "f", "u1")).toBe(false);
    expect(isFlagOn(rule, "f", "u2")).toBe(false);
    expect(isFlagOn(rule, "f", null)).toBe(false);
  });

  test("an allow-listed user gets the flag at 0%", () => {
    const rule = { enabled: true, rolloutPercent: 0, allowUserIds: ["u1"] };
    expect(isFlagOn(rule, "f", "u1")).toBe(true);
    expect(isFlagOn(rule, "f", "u2")).toBe(false);
  });

  test("100% is on for every signed-in user", () => {
    const rule = { enabled: true, rolloutPercent: 100, allowUserIds: [] };
    for (let i = 0; i < 200; i += 1) expect(isFlagOn(rule, "f", `user_${i}`)).toBe(true);
  });

  test("0% is off for every user not on the allow-list", () => {
    const rule = { enabled: true, rolloutPercent: 0, allowUserIds: [] };
    for (let i = 0; i < 200; i += 1) expect(isFlagOn(rule, "f", `user_${i}`)).toBe(false);
  });

  test("the bucket is stable: same user and flag, same answer every time", () => {
    for (let i = 0; i < 50; i += 1) {
      const id = `user_${i}`;
      const first = rolloutBucket(id, "v2_shell");
      for (let n = 0; n < 5; n += 1) expect(rolloutBucket(id, "v2_shell")).toBe(first);
      expect(first).toBeGreaterThanOrEqual(0);
      expect(first).toBeLessThan(100);
    }
  });

  test("a percentage rollout reaches roughly that share of users", () => {
    const rule = { enabled: true, rolloutPercent: 30, allowUserIds: [] };
    let on = 0;
    const total = 5000;
    for (let i = 0; i < total; i += 1) if (isFlagOn(rule, "v2_shell", `user_${i}`)) on += 1;
    expect(on / total).toBeGreaterThan(0.26);
    expect(on / total).toBeLessThan(0.34);
  });

  test("raising the percentage only adds users, never removes them", () => {
    const users = Array.from({ length: 1000 }, (_, i) => `user_${i}`);
    const at = (p: number) =>
      new Set(users.filter((u) => isFlagOn({ enabled: true, rolloutPercent: p, allowUserIds: [] }, "f", u)));
    const ten = at(10);
    const fifty = at(50);
    for (const u of ten) expect(fifty.has(u)).toBe(true);
  });

  test("different flags pick different users at the same percentage", () => {
    const users = Array.from({ length: 1000 }, (_, i) => `user_${i}`);
    const pick = (key: string) =>
      users.filter((u) => isFlagOn({ enabled: true, rolloutPercent: 10, allowUserIds: [] }, key, u));
    expect(pick("flag_a")).not.toEqual(pick("flag_b"));
  });

  test("out-of-range percentages are clamped", () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(250)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(isFlagOn({ enabled: true, rolloutPercent: 250, allowUserIds: [] }, "f", null)).toBe(true);
    expect(isFlagOn({ enabled: true, rolloutPercent: -1, allowUserIds: [] }, "f", "u1")).toBe(false);
  });
});

describe("flags.listEnabled", () => {
  test("returns nothing when there are no flags", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.flags.listEnabled, {})).toEqual([]);
  });

  test("a flag that is off is not returned", async () => {
    const t = convexTest(schema, modules);
    const me = await addUser(t, "clerk_me");
    await addFlag(t, "v2_shell", { enabled: false, rolloutPercent: 100, allowUserIds: [me] });
    const asMe = t.withIdentity({ subject: "clerk_me" });
    expect(await asMe.query(api.flags.listEnabled, {})).toEqual([]);
  });

  test("an allow-listed user gets the flag; another user does not", async () => {
    const t = convexTest(schema, modules);
    const me = await addUser(t, "clerk_me");
    await addUser(t, "clerk_other");
    await addFlag(t, "v2_shell", { enabled: true, rolloutPercent: 0, allowUserIds: [me] });
    expect(await t.withIdentity({ subject: "clerk_me" }).query(api.flags.listEnabled, {})).toEqual([
      "v2_shell",
    ]);
    expect(
      await t.withIdentity({ subject: "clerk_other" }).query(api.flags.listEnabled, {}),
    ).toEqual([]);
  });

  test("a percentage rollout gives the same answer to the same user every time", async () => {
    const t = convexTest(schema, modules);
    const ids: Id<"users">[] = [];
    for (let i = 0; i < 20; i += 1) ids.push(await addUser(t, `clerk_${i}`));
    await addFlag(t, "v2_shell", { enabled: true, rolloutPercent: 50 });
    for (let i = 0; i < 20; i += 1) {
      const asUser = t.withIdentity({ subject: `clerk_${i}` });
      const first = await asUser.query(api.flags.listEnabled, {});
      const second = await asUser.query(api.flags.listEnabled, {});
      expect(second).toEqual(first);
      expect(first.includes("v2_shell")).toBe(rolloutBucket(ids[i], "v2_shell") < 50);
    }
  });

  test("signed out: only flags rolled out to 100%", async () => {
    const t = convexTest(schema, modules);
    const me = await addUser(t, "clerk_me");
    await addFlag(t, "everyone", { enabled: true, rolloutPercent: 100 });
    await addFlag(t, "half", { enabled: true, rolloutPercent: 99 });
    await addFlag(t, "listed", { enabled: true, rolloutPercent: 0, allowUserIds: [me] });
    expect(await t.query(api.flags.listEnabled, {})).toEqual(["everyone"]);
  });

  test("signed in without a Flipbook account yet is treated as signed out", async () => {
    const t = convexTest(schema, modules);
    await addFlag(t, "everyone", { enabled: true, rolloutPercent: 100 });
    await addFlag(t, "half", { enabled: true, rolloutPercent: 99 });
    const onboarding = t.withIdentity({ subject: "clerk_no_row_yet" });
    expect(await onboarding.query(api.flags.listEnabled, {})).toEqual(["everyone"]);
  });

  test("returns keys only: no allow-lists or percentages reach the app", async () => {
    const t = convexTest(schema, modules);
    await addFlag(t, "everyone", { enabled: true, rolloutPercent: 100 });
    const result = await t.query(api.flags.listEnabled, {});
    expect(result).toEqual(["everyone"]);
    expect(result.every((k) => typeof k === "string")).toBe(true);
  });
});

describe("flags.ensureDefaults", () => {
  test("creates v2_shell switched off, and is safe to run again", async () => {
    const t = convexTest(schema, modules);
    expect(await t.mutation(internal.flags.ensureDefaults, {})).toEqual(["v2_shell"]);
    expect(await t.mutation(internal.flags.ensureDefaults, {})).toEqual([]);
    const rows = await t.run(async (ctx) => ctx.db.query("flags").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      key: "v2_shell",
      enabled: false,
      rolloutPercent: 0,
      allowUserIds: [],
    });
  });

  test("never changes a flag that already exists", async () => {
    const t = convexTest(schema, modules);
    const me = await addUser(t, "clerk_me");
    await addFlag(t, "v2_shell", { enabled: true, rolloutPercent: 25, allowUserIds: [me] });
    expect(await t.mutation(internal.flags.ensureDefaults, {})).toEqual([]);
    const row = await t.run(async (ctx) =>
      ctx.db.query("flags").withIndex("by_key", (q) => q.eq("key", "v2_shell")).unique(),
    );
    expect(row).toMatchObject({ enabled: true, rolloutPercent: 25, allowUserIds: [me] });
  });
});
