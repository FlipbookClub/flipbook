import {
  compareVersions,
  isUpdateRequired,
  parseVersion,
  resolveVersionGate,
  type MinVersionConfig,
} from "./versionGate";

// versionGate.ts reads the installed version through expo-constants. These
// tests only exercise the pure functions, so the native module is stubbed.
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.0.1" } },
}));

const config: MinVersionConfig = {
  minVersionIos: "1.0.1",
  minVersionAndroid: "1.0.1",
  updateUrlIos: "https://example.test/ios",
  updateUrlAndroid: "https://example.test/android",
};

describe("parseVersion", () => {
  it("reads one to four numeric segments", () => {
    expect(parseVersion("1")).toEqual([1]);
    expect(parseVersion("1.0")).toEqual([1, 0]);
    expect(parseVersion("1.0.10")).toEqual([1, 0, 10]);
    expect(parseVersion("1.0.0.3")).toEqual([1, 0, 0, 3]);
  });

  it("ignores surrounding whitespace", () => {
    expect(parseVersion(" 1.0.1 ")).toEqual([1, 0, 1]);
  });

  it("returns null for malformed strings", () => {
    for (const bad of ["", " ", "abc", "v1.0.0", "1.0.1-beta", "1..2", "1.0.", ".1", "1,0", "1.0.0.0.0", "-1.0"]) {
      expect(parseVersion(bad)).toBeNull();
    }
  });

  it("returns null for non-strings", () => {
    for (const bad of [undefined, null, 1, 1.0, {}, [], true]) {
      expect(parseVersion(bad)).toBeNull();
    }
  });
});

describe("compareVersions", () => {
  it("compares segments as numbers, not strings", () => {
    expect(compareVersions("1.0.10", "1.0.9")).toBe(1);
    expect(compareVersions("1.0.9", "1.0.10")).toBe(-1);
    expect(compareVersions("1.10.0", "1.9.9")).toBe(1);
    expect(compareVersions("2.0.0", "1.99.99")).toBe(1);
  });

  it("treats equal versions as equal", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.1", "1.0.1")).toBe(0);
  });

  it("pads missing segments with zero", () => {
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1", "1.0.0")).toBe(0);
    expect(compareVersions("1.0", "1.0.1")).toBe(-1);
    expect(compareVersions("1.1", "1.0.9")).toBe(1);
  });

  it("ignores leading zeros in a segment", () => {
    expect(compareVersions("1.01.0", "1.1.0")).toBe(0);
  });

  it("returns null when either side is missing or malformed", () => {
    expect(compareVersions(undefined, "1.0.0")).toBeNull();
    expect(compareVersions("1.0.0", undefined)).toBeNull();
    expect(compareVersions(null, null)).toBeNull();
    expect(compareVersions("", "1.0.0")).toBeNull();
    expect(compareVersions("1.0.0", "latest")).toBeNull();
    expect(compareVersions("1.0.0-rc1", "1.0.0")).toBeNull();
  });
});

describe("isUpdateRequired", () => {
  it("is true only when installed is strictly lower", () => {
    expect(isUpdateRequired("1.0.0", "1.0.1")).toBe(true);
    expect(isUpdateRequired("1.0.9", "1.0.10")).toBe(true);
  });

  it("is false when installed equals or exceeds the minimum", () => {
    expect(isUpdateRequired("1.0.0", "1.0.0")).toBe(false);
    expect(isUpdateRequired("1.0.10", "1.0.9")).toBe(false);
    expect(isUpdateRequired("2.0.0", "1.0.1")).toBe(false);
  });

  it("never blocks on missing values", () => {
    expect(isUpdateRequired(undefined, "9.9.9")).toBe(false);
    expect(isUpdateRequired(null, "9.9.9")).toBe(false);
    expect(isUpdateRequired("1.0.0", undefined)).toBe(false);
    expect(isUpdateRequired("1.0.0", null)).toBe(false);
    expect(isUpdateRequired("1.0.0", "")).toBe(false);
  });

  it("never blocks on malformed strings", () => {
    expect(isUpdateRequired("not-a-version", "9.9.9")).toBe(false);
    expect(isUpdateRequired("1.0.0", "9.9.9-beta")).toBe(false);
    expect(isUpdateRequired("1.0.0", "v9.9.9")).toBe(false);
    expect(isUpdateRequired("1.0.0", "9..9")).toBe(false);
  });
});

describe("resolveVersionGate", () => {
  it("blocks an old install and hands back that platform's link", () => {
    expect(resolveVersionGate("ios", "1.0.0", config)).toEqual({
      blocked: true,
      updateUrl: "https://example.test/ios",
    });
    expect(resolveVersionGate("android", "1.0.0", config)).toEqual({
      blocked: true,
      updateUrl: "https://example.test/android",
    });
  });

  it("uses each platform's own minimum", () => {
    const split = { ...config, minVersionIos: "1.0.0", minVersionAndroid: "1.0.2" };
    expect(resolveVersionGate("ios", "1.0.1", split).blocked).toBe(false);
    expect(resolveVersionGate("android", "1.0.1", split).blocked).toBe(true);
  });

  it("stays open when the install meets the minimum", () => {
    expect(resolveVersionGate("ios", "1.0.1", config)).toEqual({ blocked: false, updateUrl: null });
    expect(resolveVersionGate("android", "1.1.0", config)).toEqual({ blocked: false, updateUrl: null });
  });

  it("stays open while loading (undefined) and when no row exists (null)", () => {
    expect(resolveVersionGate("ios", "0.0.1", undefined).blocked).toBe(false);
    expect(resolveVersionGate("ios", "0.0.1", null).blocked).toBe(false);
  });

  it("stays open when the installed version is unknown", () => {
    expect(resolveVersionGate("ios", null, config).blocked).toBe(false);
    expect(resolveVersionGate("ios", undefined, config).blocked).toBe(false);
    expect(resolveVersionGate("ios", "garbage", config).blocked).toBe(false);
  });

  it("stays open when the stored minimum is malformed", () => {
    const bad = { ...config, minVersionIos: "soon", minVersionAndroid: "" };
    expect(resolveVersionGate("ios", "1.0.0", bad).blocked).toBe(false);
    expect(resolveVersionGate("android", "1.0.0", bad).blocked).toBe(false);
  });

  it("stays open when the update link is missing or empty", () => {
    const noLinks = { ...config, updateUrlIos: "", updateUrlAndroid: "   " };
    expect(resolveVersionGate("ios", "1.0.0", noLinks)).toEqual({ blocked: false, updateUrl: null });
    expect(resolveVersionGate("android", "1.0.0", noLinks)).toEqual({ blocked: false, updateUrl: null });
    const missing = { minVersionIos: "9.9.9", minVersionAndroid: "9.9.9" } as MinVersionConfig;
    expect(resolveVersionGate("ios", "1.0.0", missing).blocked).toBe(false);
  });

  it("stays open on platforms the gate does not cover", () => {
    expect(resolveVersionGate("web", "0.0.1", config).blocked).toBe(false);
    expect(resolveVersionGate("windows", "0.0.1", config).blocked).toBe(false);
  });
});
