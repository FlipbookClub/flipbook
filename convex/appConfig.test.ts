import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

// S0-2's getMinVersion, against an in-memory Convex. The rules that decide
// whether a reader is blocked live in src/lib/versionGate.ts and its tests;
// these only check that the query hands back the right row, or null.

const row = {
  key: "app",
  minVersionIos: "1.0.0",
  minVersionAndroid: "1.0.1",
  updateUrlIos: "https://example.test/ios",
  updateUrlAndroid: "https://example.test/android",
};

describe("appConfig.getMinVersion", () => {
  test("returns null when no row exists", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.appConfig.getMinVersion, {})).toBeNull();
  });

  test("returns the four fields of the 'app' row, and nothing else", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("appConfig", row);
    });
    expect(await t.query(api.appConfig.getMinVersion, {})).toEqual({
      minVersionIos: "1.0.0",
      minVersionAndroid: "1.0.1",
      updateUrlIos: "https://example.test/ios",
      updateUrlAndroid: "https://example.test/android",
    });
  });

  test("ignores rows with another key", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("appConfig", { ...row, key: "something-else" });
    });
    expect(await t.query(api.appConfig.getMinVersion, {})).toBeNull();
  });

  test("a duplicate 'app' row does not break the query; the oldest wins", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("appConfig", row);
      await ctx.db.insert("appConfig", { ...row, minVersionIos: "9.9.9" });
    });
    const result = await t.query(api.appConfig.getMinVersion, {});
    expect(result?.minVersionIos).toBe("1.0.0");
  });

  test("works signed out", async () => {
    // No identity is set on `t`: the gate must work on the sign-in screen.
    const t = convexTest(schema, modules);
    await expect(t.query(api.appConfig.getMinVersion, {})).resolves.toBeNull();
  });
});
