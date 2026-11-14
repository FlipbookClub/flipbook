import type { ConfigContext, ExpoConfig } from "expo/config";

// S0-3 app variants. app.json stays the single source of truth for the app's
// configuration; Expo hands it to this function as `config`. This file only
// swaps the app's IDENTITY for development builds, so "Flipbook Dev" installs
// beside the v1 store app instead of replacing it.
//
// APP_VARIANT is set in exactly two places:
//   - eas.json, on the `development` and `development-device` build profiles
//   - `npm run start:dev`, for the Metro server a development build talks to
// It is deliberately NOT in .env.local or any other env file, so a preview or
// production build can never pick it up by accident.
//
// ANY VALUE OTHER THAN "development" FALLS BACK TO THE PRODUCTION IDENTITY.
// Unset, empty, misspelled ("dev", "Development") or anything else returns
// app.json exactly as written: name "Flipbook", bundle ID and package
// com.flipbook.club, scheme "flipbook". The `preview` and `production`
// profiles never set the variable, so they always ship that identity.
const DEV_VARIANT = "development";

const DEV_NAME = "Flipbook Dev";
const DEV_APP_ID = "com.flipbook.club.dev";
const DEV_SCHEME = "flipbook-dev";

type AndroidIntentFilters = NonNullable<NonNullable<ExpoConfig["android"]>["intentFilters"]>;
type AndroidIntentFilter = AndroidIntentFilters[number];
type IntentFilterData = NonNullable<AndroidIntentFilter["data"]>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// The production intent filters claim two things the dev app must not:
//
//   1. https://useflipbook.com/join — the web invite link. The site's
//      assetlinks.json only vouches for com.flipbook.club, so the dev app
//      could never verify it, and claiming it anyway makes Android ask which
//      app should open every invite.
//   2. the `flipbook` custom scheme — if both apps claimed it, every
//      flipbook:// link would raise the same chooser.
//
// So for the dev variant: drop every web (http/https) entry, rename the
// production scheme to the dev one, and drop autoVerify, which only applies
// to web links. Derived from app.json rather than rewritten here, so a filter
// added there later is carried across by the same rules.
function devIntentFilters(
  filters: AndroidIntentFilters | undefined,
  productionSchemes: string[],
): AndroidIntentFilters {
  const result: AndroidIntentFilters = [];
  for (const filter of filters ?? []) {
    const data: IntentFilterData = [];
    for (const entry of asArray(filter.data)) {
      if (entry.scheme === "http" || entry.scheme === "https") continue;
      if (entry.scheme !== undefined && productionSchemes.includes(entry.scheme)) {
        data.push({ ...entry, scheme: DEV_SCHEME });
      } else {
        data.push(entry);
      }
    }
    if (data.length === 0) continue;
    const { autoVerify: _autoVerify, ...rest } = filter;
    result.push({ ...rest, data });
  }
  return result;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  // `config` is app.json's "expo" object. name and slug are always present
  // there; the cast only tells TypeScript so.
  const base = config as ExpoConfig;

  if (process.env.APP_VARIANT !== DEV_VARIANT) {
    return base;
  }

  return {
    ...base,
    name: DEV_NAME,
    scheme: DEV_SCHEME,
    ios: {
      ...base.ios,
      bundleIdentifier: DEV_APP_ID,
    },
    android: {
      ...base.android,
      package: DEV_APP_ID,
      intentFilters: devIntentFilters(base.android?.intentFilters, asArray(base.scheme)),
    },
  };
};
