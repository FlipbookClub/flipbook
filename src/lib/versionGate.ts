import Constants from "expo-constants";

// S0-2 minimum-version gate. Everything here except installedVersion() is a
// pure function, so the rules that decide whether a reader gets locked out
// are unit-tested (versionGate.test.ts) rather than trusted.
//
// The one rule that outranks the rest: WHEN IN DOUBT, DO NOT BLOCK. No config
// row, a network error, a version string we cannot read, an unknown platform,
// or no update link to send the reader to all mean the app opens normally.
// Blocking someone by accident is worse than letting an old build through.

export type VersionComparison = -1 | 0 | 1;

// Up to four dot-separated runs of digits: "1", "1.0", "1.0.10", "1.0.0.3".
// Anything else ("1.0.1-beta", "v1.0", "1..2", "") is treated as unreadable
// on purpose. Guessing at a malformed minimum could block every install.
const VERSION_PATTERN = /^\d{1,9}(\.\d{1,9}){0,3}$/;

export function parseVersion(value: unknown): number[] | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!VERSION_PATTERN.test(trimmed)) return null;
  return trimmed.split(".").map((segment) => Number(segment));
}

// Segment-by-segment numeric compare, so "1.0.10" is newer than "1.0.9"
// (a string compare gets that wrong). Missing segments count as zero, so
// "1.0" equals "1.0.0". Returns null when either side is unreadable.
export function compareVersions(a: unknown, b: unknown): VersionComparison | null {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return null;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l < r) return -1;
    if (l > r) return 1;
  }
  return 0;
}

// True only when both versions are readable AND installed is strictly lower.
export function isUpdateRequired(installed: unknown, minimum: unknown): boolean {
  return compareVersions(installed, minimum) === -1;
}

// The shape convex/appConfig.ts → getMinVersion returns.
export interface MinVersionConfig {
  minVersionIos: string;
  minVersionAndroid: string;
  updateUrlIos: string;
  updateUrlAndroid: string;
}

export interface VersionGateResult {
  blocked: boolean;
  // Where the Update button sends the reader. Null whenever blocked is false.
  updateUrl: string | null;
}

export const GATE_OPEN: VersionGateResult = { blocked: false, updateUrl: null };

// The whole decision in one place. `config` is undefined while the query is
// loading (or offline, where it never resolves) and null when no row exists.
export function resolveVersionGate(
  platform: string,
  installed: unknown,
  config: MinVersionConfig | null | undefined,
): VersionGateResult {
  if (!config) return GATE_OPEN;

  let minimum: unknown;
  let url: unknown;
  if (platform === "ios") {
    minimum = config.minVersionIos;
    url = config.updateUrlIos;
  } else if (platform === "android") {
    minimum = config.minVersionAndroid;
    url = config.updateUrlAndroid;
  } else {
    return GATE_OPEN;
  }

  if (!isUpdateRequired(installed, minimum)) return GATE_OPEN;

  // A blocking screen whose button goes nowhere is a lock-out with no exit.
  // Update links live only in the Convex row, never in code, so a missing or
  // empty one means the gate stays open.
  const updateUrl = typeof url === "string" ? url.trim() : "";
  if (updateUrl.length === 0) return GATE_OPEN;

  return { blocked: true, updateUrl };
}

// The version NAME of the installed app ("1.0.1"), never the build number.
//
// REVISIT IF OVER-THE-AIR UPDATES ARE EVER SWITCHED ON FOR v1 BUILDS.
// expo-constants reports the `version` from the app config embedded in the
// running JS bundle. Today updates are disabled (app.json → updates.enabled:
// false), so the bundle always ships inside the binary and the two cannot
// disagree. With EAS Update on, a new bundle delivered to an old binary would
// report the NEW version here while the native app is still the old one, and
// the gate would wave through exactly the installs it exists to catch. At that
// point read the native version instead (expo-application's
// nativeApplicationVersion), which means adding that dependency.
export function installedVersion(): string | null {
  const version = Constants.expoConfig?.version;
  return typeof version === "string" && version.length > 0 ? version : null;
}
