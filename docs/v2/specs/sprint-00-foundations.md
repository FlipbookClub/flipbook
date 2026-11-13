# Sprint 0 — Foundations

**Status:** Ready to start · **Written:** 12 Nov 2026 · **Owner:** Moks
**Read first:** `CLAUDE.md`, `docs/v2/architecture.md`, `docs/v2/adr/`
**Rule:** flag deviations, don't improvise. If something in the repo contradicts this spec, stop and report it before changing anything.

## Goal

A v2 development build installs beside v1 on both platforms, with CI, monitoring, feature flags and a minimum-version gate in place, and every architecture decision written down. **No v2 screens are built in this sprint.**

## Exit gate

All of these are true:

1. A development build with the `development` variant installs and runs beside the v1 app on one Android phone and one iPhone.
2. A pull request on GitHub shows CI passing (typecheck, lint, tests).
3. Sentry shows a deliberate test error from a development build; PostHog shows a `sign_in` event from the same build.
4. A flag toggled in the Convex dashboard changes what the app reads within seconds, with no rebuild.
5. A v1 build containing the minimum-version gate is submitted to TestFlight and the Play alpha track.
6. `docs/v2/audit-v1.md` exists and Moks has read it.
7. Moks has marked each ADR in `docs/v2/adr/` Accepted or sent it back.

## What the repo looks like today (verified 12 Nov 2026)

| Area | Current state | File |
| --- | --- | --- |
| Expo | SDK 54, React Native 0.81, new architecture on | `package.json`, `app.json` |
| App identity | One bundle ID for everything: `com.flipbook.club` | `app.json` |
| EAS profiles | `development`, `development-device`, `preview` (store, channel `preview`), `production` | `eas.json` |
| OTA updates | Disabled (`updates.enabled: false`) | `app.json` |
| Sentry | SDK installed and wired; dormant until `EXPO_PUBLIC_SENTRY_DSN` is set | `src/lib/monitoring.ts`, Sentry plugin in `app.json` |
| PostHog | Package installed; backend commented out, so analytics is a no-op | `src/lib/analytics.ts` |
| Icons | `@hugeicons/react-native` and `@hugeicons/core-free-icons` installed | `package.json`, `src/lib/icons.tsx` |
| Blur | `expo-blur` installed | `package.json` |
| CI | None (no `.github/`) | — |
| Tests | None in the app or `convex/` | — |
| Lint | No ESLint config at the repo root | — |
| Web | Next.js 16 site in `web/` (marketing and waitlist, useflipbook.com) | `web/` |
| v1 reactions | Anchored by `page` + optional `paragraphIndex`, with `bookId` or `chapterId`; PDF reactions also store `highlightQuote` and `highlightRects` | `convex/schema.ts` → `reactions` |

## Working from Claude Code on the web

Claude Code runs in a cloud copy of the repo. It has no access to Moks's Mac, `.env.local`, `business/`, phones or simulators. Split the work like this:

| Task | Claude Code (web) | Moks, on his Mac or in a dashboard |
| --- | --- | --- |
| S0-1 audit | All of it | Read it |
| S0-2 version gate | Code and tests | Seed the `appConfig` row, test on a phone, build and submit with EAS |
| S0-3 app variants | `app.config.ts`, `eas.json` | Register the iOS bundle ID and devices, install builds on phones |
| S0-4 environments | Draft `environments.md` | Confirm values in EAS, Convex and Clerk |
| S0-5 CI | All of it | Merge the pull request |
| S0-6 Sentry and PostHog | Code changes | Set the keys as EAS environment variables, rebuild, check dashboards |
| S0-7 flags | Code and tests | Toggle the flag in the Convex dashboard on a device |
| S0-8 event plan | All of it | Review |
| S0-9 Maestro | The flow file | Run it on a device |

Never put keys or secrets in a commit. If a task needs a value that isn't in the repo, stop and ask.

## Tasks

Do them in this order. One branch and one pull request per task. Moks runs all git commands.

### S0-1 · Audit v1 against the v2 PRD (read-only) · P0 · ~4 h

Write `docs/v2/audit-v1.md`. Change no code.

It must contain:

- **Tables:** every table in `convex/schema.ts`, and for each: keep as is, extend additively, or replaced by a v2 table (name it, from `architecture.md` → Data model).
- **Reaction anchors:** how v1 stores a reaction position for (a) EPUB uploads, (b) PDF uploads, and (c) whether `paragraphIndex` is stable across font sizes and devices. State plainly whether v1 EPUB reactions can be mapped to v2 paragraph IDs, and what a backfill would need. This is the biggest migration risk.
- **UI:** each file in `src/components/ui/` and `src/theme/`, and which v2 design-system component replaces it (`docs/v2/design-handoff/README.md` → Components).
- **Navigation:** the current stacks in `src/navigation/` and where a flagged v2 tree would mount.
- **Reader:** where epub.js and the native PDF module are wired, and which files Sprint 3 will touch.
- **Risks found:** anything that contradicts `architecture.md`.

**Done when:** the file exists and lists every table and every `src/components/ui/` file.

### S0-2 · Minimum-version gate, shipped in v1 · P0 · ~4 h

The gate has to reach users' phones before v2 does, so it ships in a v1 build this sprint.

- Add table `appConfig` to `convex/schema.ts` (additive): `key: string`, `minVersionIos: string`, `minVersionAndroid: string`, `updateUrlIos: string`, `updateUrlAndroid: string`, index `by_key`.
- Add `convex/appConfig.ts` with a public query `getMinVersion` returning the row for `key = "app"`, or `null` if none exists.
- Add `src/lib/versionGate.ts`: compare the installed app version with the platform minimum (semantic version compare, written as a pure function so it can be unit-tested).
- Add a blocking screen `src/screens/UpdateRequiredScreen.tsx` shown from `src/navigation/RootNavigator.tsx` when the installed version is lower. Copy: "A new version of Flipbook is ready" (heading), "Update to keep reading. Your books, clubs and reactions are all where you left them." (body), button "Update". Use existing v1 UI components and theme; no v2 styling.
- **Safe defaults:** no row, a network error or an unparseable version all mean "don't block". The gate must never lock someone out by accident.
- Seed one row with minimums equal to the current version, so nothing blocks today.
- Bump the version and submit through the existing `preview` profile to TestFlight and the Play alpha track.

**Done when:** raising the minimum in the Convex dashboard shows the update screen on a test device, lowering it removes the screen, and the build is submitted to both stores.

**Tests:** unit tests for the version compare, including `1.0.10` > `1.0.9`, equal versions, missing values and malformed strings.

### S0-3 · App variants so v2 installs beside v1 · P0 · ~3 h

- Add `app.config.ts` that reads `app.json` and an `APP_VARIANT` environment variable:
  - `development` → name "Flipbook Dev", bundle ID and package `com.flipbook.club.dev`, scheme `flipbook-dev`
  - anything else → unchanged (`com.flipbook.club`)
- Set `APP_VARIANT=development` on the `development` and `development-device` profiles in `eas.json`. **Do not change `preview` or `production`**; they ship v1 to testers.
- Register the new iOS bundle ID and test devices through EAS with the existing Apple account.

**Done when:** "Flipbook Dev" and v1 "Flipbook" sit side by side on one Android phone and one iPhone.

**Flag, don't guess:** if the Android deep-link intent filter (`useflipbook.com/join`) would also be claimed by the dev variant, remove it from the dev variant only.

### S0-4 · Environments · P0 · ~2 h

Confirmed by Moks on 12 Nov 2026: Convex has a development and a production deployment, and v1 users are on production. Clerk has a production instance. Write this down in `docs/v2/environments.md` and fill the remaining cells:

| | Development | Preview (v1 testers) | Production |
| --- | --- | --- | --- |
| Convex deployment | development (the `npx convex dev` deployment in `.env.local`) | production — confirm in EAS env vars | production |
| Clerk instance | development | production — confirm in EAS env vars | production |
| Sentry environment | `development` | `preview` | `production` |
| PostHog project | one project, filtered by environment | same | same |

Check each cell against `eas env:list` for every EAS environment. **Testers on the `preview` profile use production data**, so anything run against preview touches real readers: never seed, migrate or test destructively there. Never copy keys into tracked files.

**Gap to raise, not fix:** there is no separate staging Convex deployment, so migration rehearsals (architecture.md, "Moving v1 users across", step 3) have nowhere safe to run. Note it in `environments.md`; Moks decides before the first migration (Sprint 10).

**Done when:** every cell is confirmed against EAS and the dashboards.

### S0-5 · CI on every pull request · P0 · ~4 h

- Add root ESLint config (`eslint-config-expo`), scripts in `package.json`: `typecheck` (`tsc --noEmit`), `lint`, `test`.
- Add Vitest with `convex-test` for backend tests (follow `convex/_generated/ai/guidelines.md` and the convex-test docs), and Jest with `jest-expo` for app-side pure functions. Keep both configs minimal.
- Add `.github/workflows/ci.yml`: on pull request, `npm ci`, typecheck, lint, test. Exclude `web/` (it has its own toolchain).
- First real tests: the version compare (S0-2) and the flag evaluation (S0-7).

**Done when:** a pull request shows a green CI run, and a deliberately broken test makes it red.

**If lint fails on existing v1 code:** don't mass-fix it. Set existing violations to warnings, list them in the PR description, and keep new code clean.

### S0-6 · Turn on Sentry and PostHog · P0 · ~3 h

- Sentry: set `EXPO_PUBLIC_SENTRY_DSN` and `EXPO_PUBLIC_ENV` per EAS environment (Sentry org `flipbook-ni`, project `react-native` already configured in `app.json`). Trigger a test error from a development build.
- PostHog: follow the steps at the top of `src/lib/analytics.ts` (package is already installed); set the key per EAS environment; rebuild the dev client.
- Never send book text, reaction text or chat content to either service.

**Done when:** both dashboards show events from a development build.

### S0-7 · Feature flags · P0 · ~3 h

- Add table `flags` (additive): `key: string`, `enabled: boolean`, `rolloutPercent: number` (0–100), `allowUserIds: array of user ids`, index `by_key`.
- Add `convex/flags.ts`: a query returning the flags that are on for the current user. A flag is on when `enabled` is true and the user is in `allowUserIds` or falls inside `rolloutPercent` (stable hash of user id + key). Signed-out users only get flags with `rolloutPercent = 100`.
- Add `src/lib/flags.ts` with a `useFlag(key)` hook backed by that live query. Default is off while loading.
- Create the first flag: `v2_shell`, off.

**Done when:** toggling `v2_shell` in the Convex dashboard changes `useFlag("v2_shell")` on a device within seconds.

**Tests:** convex-test cases for off, on for an allowed user, percentage rollout stable for the same user, signed-out behaviour.

### S0-8 · Analytics event plan · P0 · ~2 h

Write `docs/v2/analytics-events.md`: every event the founders' dashboard needs (PRD 13.8–13.12, plus the funnels in 13.9 and cohorts in 13.10), with name, when it fires, properties, and which PRD metric uses it. Extend the `AnalyticsEvent` type in `src/lib/analytics.ts` with the v2 names but fire nothing new yet. Keep the existing v1 event names unchanged.

**Done when:** each tile and chart in 13.8–13.12 maps to an event or to a Convex table.

### S0-9 · Maestro smoke flow · P2 · ~2 h

Install Maestro and add `.maestro/smoke.yaml`: launch the app, sign in with a test account, open the library. Not in CI yet.

## Out of scope

- Any v2 screen, component or theme work (that's Sprint 1).
- Schema changes other than the `appConfig` and `flags` tables.
- Upgrading Expo, React Native or any dependency not named here.
- Turning on EAS Update.
- Anything in `web/`.
- Creating store accounts, Convex production deployments or Clerk instances.

## Answered by Moks (12 Nov 2026)

1. Convex: development and production deployments exist; v1 users are on production.
2. Clerk: a production instance exists.
3. Reference Android device: a Redmi (confirm the exact model before Sprint 1; a mid-range model with 3–4 GB RAM is the target).
