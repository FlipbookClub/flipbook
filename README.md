# Flipbook

Social reading app where book clubs read together in real time and indie creators turn audiences into communities. Mobile-only at MVP.

The bet: every existing social reading app treats a book as a log entry. Flipbook treats it as a live activity — conversations are page-keyed and rendered in the margin as readers reach them, never spoiling ahead.

## Stack

- **Frontend:** Expo (React Native) + NativeWind v4 + React Navigation
- **Backend:** Convex (functions + DB + file storage + scheduler)
- **Auth:** Clerk (email + Google + Apple)
- **Payments:** RevenueCat (reader Pro tier)
- **PDF:** react-native-pdf (requires a dev build — see "Important")
- **State persistence:** MMKV

## How to run

```bash
# 1. Install dependencies (uses legacy-peer-deps for Clerk x Expo SDK 54).
npm install

# 2. Start the Convex dev backend (in one terminal — leave it running).
npx convex dev

# 3. Start the Metro bundler (in another terminal).
npx expo start --dev-client
```

Press `i` (iOS Sim) or `a` (Android Emulator) once Metro is ready.

### Required env vars

Copy [.env.example](.env.example) to `.env.local` and fill in:

- `EXPO_PUBLIC_CONVEX_URL` — auto-set by `npx convex dev` on first run.
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — from your Clerk dashboard.
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` / `_ANDROID` — needed from Phase 6 (Pro tier) onward.

## Important

**Expo Go does not work for this app.** Native modules (`react-native-pdf`, `react-native-mmkv`, `react-native-purchases`) require a development build:

```bash
# One-time per OS:
npx expo prebuild
npx expo run:ios   # or run:android
```

For team / device distribution, use EAS:

```bash
npx eas-cli build --profile development --platform ios
```

EAS profiles are defined in [eas.json](eas.json):
- `development` — dev client + iOS Simulator support.
- `preview` — TestFlight / Play Internal Testing.
- `production` — store submission.

## Docs

Source of truth lives under [docs/](docs/):

- [docs/product-vision.md](docs/product-vision.md) — vision, personas, brand strategy, design philosophy.
- [docs/prd.md](docs/prd.md) — technical architecture, data model, API spec, screen-by-screen UI/UX.
- [docs/product-roadmap.md](docs/product-roadmap.md) — 8-phase / ~100-task build plan with checkboxes.

The roadmap is the working surface — start each session by finding the first unchecked task.
