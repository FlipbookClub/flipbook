# Beta readiness — distribution, crash safety, and the pre-flight checklist

This is the playbook for getting Flipbook into testers' hands **without** the
dev-environment failure modes we hit during development. The golden rule:

> **Testers run an EAS-built, signed binary with the JS bundle embedded.**
> They never touch Metro, prebuild, pod install, or a "script URL." Almost every
> crash we saw while developing was a *dev workflow* problem that cannot happen
> in a distributed build.

---

## 1. Crash + error safety (in place)

- **Root error boundary** (`src/components/ErrorBoundary.tsx`): any render/runtime
  error below the root shows a recoverable "Something went wrong → Restart app"
  screen (real JS reload via `expo-updates`) instead of a frozen/white app, and
  reports the error to monitoring.
- **Monitoring** (`src/lib/monitoring.ts`): Sentry, **off until you set a DSN**.
  When off it only logs to the console and makes zero native calls.

### Turn on Sentry (do this before the first external tester)
1. Create a free project at https://sentry.io → React Native.
2. Copy the **DSN**.
3. Add it to your build env (NOT committed): in EAS, set a secret/env var
   `EXPO_PUBLIC_SENTRY_DSN` (and optionally `EXPO_PUBLIC_ENV=preview|production`).
   - `eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "<dsn>" --environment preview`
4. Ship a fresh EAS build (the native Sentry SDK autolinks during the build).
5. (Optional, for readable stack traces) add the Sentry Expo config plugin
   `@sentry/react-native/expo` to `app.json` with your org/project + a
   `SENTRY_AUTH_TOKEN` build secret, so source maps upload automatically.

Until step 3, the app behaves exactly as today — Sentry is dormant.

---

## 2. Over-the-air (OTA) fixes during beta

`expo-updates` is installed and channels are configured in `eas.json`
(`preview`, `production`). **JS-only** bug fixes can ship to testers in minutes
without a new store build:

```
eas update --channel preview --message "fix: <what>"
```

Native changes (new native module, icon, entitlement) still require a new build.
This is the big lever: most beta bugs are JS and can be hot-fixed OTA.

---

## 3. Build + distribute

**iOS (TestFlight):**
```
eas build --platform ios --profile preview     # internal distribution build
eas submit --platform ios --latest              # to TestFlight (paid team)
```
**Android (Play internal testing):**
```
eas build --platform android --profile preview
eas submit --platform android --latest
```

`preview` = `distribution: internal` — installable by invited testers.

---

## 4. Native-module discipline (the WebView lesson)

- Every new **native** dependency needs a fresh build; a Metro reload is NOT
  enough. Batch native additions; prefer a JS solution when one exists.
- After adding/removing a native dep: `npx expo prebuild` (or `pod install`) +
  rebuild. Mismatched node_modules ↔ Pods = "Build input file cannot be found".
- After a `metro.config.js` change: restart Metro with `expo start -c`, and make
  sure there isn't a stale Metro on :8081 (`lsof -ti:8081 | xargs kill -9`).

---

## 5. Pre-flight smoke test (run on the actual preview/TestFlight build)

Install the **distribution** build (not the dev build) and walk these once:

- [ ] App cold-launches to the splash → home (no hang).
- [ ] Sign up + sign in (email code), sign out.
- [ ] Create a community; edit its details (name/description/emblem); **select
      text in a field** (no freeze).
- [ ] Join a community via invite code.
- [ ] Upload a book (title/author/genre); cover thumbnail appears.
- [ ] Open the reader; page through; progress persists on reopen.
- [ ] React on a page; the reaction shows for another member.
- [ ] Open/back out of a book repeatedly, then use the app — no delayed crash.
- [ ] Discussions feed shows reactions; tapping one deep-links to the page.
- [ ] Library tab: reading vs finished; cards render correctly.
- [ ] Profile: edit name/genres; counts correct.
- [ ] Toggle Light / Flip / Dark — readable everywhere.
- [ ] Airplane mode: a previously-opened book still reads (offline cache).
- [ ] Force-quit + reopen — state restored.

If anything fails here, fix it **before** inviting testers — the smoke test on
the distribution binary is the last line of defense the dev build can't give you.

---

## 6. Known deferred items (not blockers)

- Reader **text selection + highlights** — shelved; the WebView/PDF.js attempt
  caused an app-wide UIKit touch crash and was rolled back (work saved on commit
  `08ca142`). Reader uses the stable react-native-pdf engine with page-level
  reactions.
- Real **push delivery** validation — possible now on the paid Apple team.
- Re-add iOS **Associated Domains** (universal links) when the domain is wired.
