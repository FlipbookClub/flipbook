import Constants from "expo-constants";

// Which app identity this build is (S0-3): "development" for Flipbook Dev,
// anything else for the tester and store app. app.config.ts writes it into
// `extra.appVariant`, and only for the development variant, so preview and
// production builds carry no value at all.
//
// Use this, not __DEV__, to gate developer-only UI. __DEV__ is about how the
// JS was bundled; this is about which app is installed, and it can only be
// "development" in Flipbook Dev, never in a build a tester or reader has.

export const DEVELOPMENT_VARIANT = "development";

export function readAppVariant(extra: unknown): string | null {
  if (typeof extra !== "object" || extra === null) return null;
  const value = (extra as { appVariant?: unknown }).appVariant;
  return typeof value === "string" ? value : null;
}

export function isDevelopmentVariant(): boolean {
  return readAppVariant(Constants.expoConfig?.extra) === DEVELOPMENT_VARIANT;
}
