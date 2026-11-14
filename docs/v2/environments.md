# Environments

**Task:** S0-4 (`docs/v2/specs/sprint-00-foundations.md`) · **Written:** 14 Nov 2026 · **Confirmed by:** Moks, 14 Nov 2026, from `eas env:list`, `npx convex env list` and the Clerk key prefixes

Which backend, sign-in instance and monitoring each kind of build talks to. Deployments are named by role only: this repository is public. **Never copy a key, secret or token into this file or any tracked file.**

## The three builds

| | Development | Preview (v1 testers) | Production |
| --- | --- | --- | --- |
| Built with | EAS `development`, `development-device` profiles ("Flipbook Dev") | EAS `preview` profile | EAS `production` profile |
| Where its settings come from | Your Mac's `.env.local`, through the dev server (`npm run start:dev`). EAS variables are not used for its code | EAS `preview` environment | EAS `production` environment |
| Convex deployment | **Development** | **Production** ⚠️ confirm | **Production** ⚠️ confirm |
| Clerk instance | **Development** (`pk_test_` key) | **Production** (`pk_live_` key) | **Production** (`pk_live_` key) |
| Sentry environment | `development` once S0-6 sets `EXPO_PUBLIC_ENV`; not set today | **Labelled `production` today** (no `EXPO_PUBLIC_ENV`); should be `preview` | `production` (the default) |
| PostHog project | One project, filtered by environment: **not possible yet**, see issue 4 | Key set ⚠️ confirm it is the same project as production | Key set |

**Testers on the `preview` profile use production data.** Their builds sign in with the production Clerk instance and read the production Convex deployment, the same as store users. Anything run against preview touches real readers: never seed, migrate or test destructively there. This includes S0-2's version-gate test, which blocks every tester for as long as the minimum is raised.

### The two cells still to confirm

The Convex URL in the EAS `preview` and `production` environments has not been read directly. Production is almost certain: each Convex deployment only accepts sign-ins from the Clerk instance its `CLERK_JWT_ISSUER_DOMAIN` names, and preview builds use the production Clerk key, so if their Convex URL pointed at development every tester's sign-in would fail. To close it, open the EAS dashboard → Environment variables, select `preview`, and check that `EXPO_PUBLIC_CONVEX_URL` begins with the production deployment's name (Convex dashboard → production → Settings). Repeat for `production`. For PostHog, check that the `EXPO_PUBLIC_POSTHOG_KEY` values in `preview` and `production` are the same.

## App variables

What the app reads (`src/`, `App.tsx`, `app.config.ts`) and where each is set.

| Variable | Read by | `.env.local` (development) | EAS `preview` | EAS `production` |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_CONVEX_URL` | `src/lib/convex.ts`; the app refuses to start without it | Development deployment | Set | Set |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `src/lib/clerk.ts`; the app refuses to start without it | `pk_test_` | `pk_live_` | `pk_live_` |
| `EXPO_PUBLIC_SENTRY_DSN` | `src/lib/monitoring.ts`; Sentry is off without it | ⚠️ unknown | Set | Set |
| `EXPO_PUBLIC_ENV` | `src/lib/monitoring.ts`; Sentry environment name, default `production` | ⚠️ unknown | **Not set** | Not set (default is right) |
| `EXPO_PUBLIC_POSTHOG_KEY` | `src/lib/analytics.ts`; analytics is a no-op without it | ⚠️ unknown | Set | Set |
| `EXPO_PUBLIC_POSTHOG_HOST` | `src/lib/analytics.ts`, default `https://us.i.posthog.com` | — | Not set (default) | Not set (default) |
| `APP_VARIANT` | `app.config.ts` (S0-3) | Set only by `npm run start:dev`, never in `.env.local` | Never | Never |

Build-time only, read by the Sentry Expo plugin when the build is made:

| Variable | EAS `preview` | EAS `production` | Effect |
| --- | --- | --- | --- |
| `SENTRY_AUTH_TOKEN` | Not set | Set | Uploads source maps, so production stack traces are readable |
| `SENTRY_DISABLE_AUTO_UPLOAD` | Set | Not set | Skips the upload, so **preview crash reports have unreadable stack traces** |

`.env.example` also lists RevenueCat keys. Nothing in the app reads them yet and neither EAS environment sets them.

## Convex server variables

Set per deployment with `npx convex env set` (add `--prod` for production). Names only.

| Variable | Read by | Development | Production |
| --- | --- | --- | --- |
| `CLERK_JWT_ISSUER_DOMAIN` | `convex/auth.config.ts`; which Clerk instance may sign in | Set | Set |
| `CLERK_SECRET_KEY` | `convex/newsletter.ts`, to list accounts | Not set | Set |
| `RESEND_API_KEY` | All email sends (`email.ts`, `invites.ts`, `newsletter.ts`, `reengagement.ts`) | **Set**, see issue 3 | Set |
| `EMAIL_UNSUB_SECRET` | `convex/lib/emailAuth.ts`, signs unsubscribe links | Set | Set |
| `WAITLIST_FROM_EMAIL` | Sender address; falls back to a default in code | Not set (default) | Not set (default) |
| `READING_REMINDERS_ENABLED` | `convex/notifications.ts`; reminder pushes only send when `"true"` | Not set (off) | Set |
| `REENGAGEMENT_EMAILS_ENABLED` | `convex/reengagement.ts`; weekly emails only send when `"true"` | Not set (off) | **Not set (off)**, see issue 2 |
| `BETA_INVITE_REQUIRED` | `convex/invites.ts`; sign-up needs an invite code when set | Not set (off) | **Not set (off)**, see issue 1 |
| `CONVEX_SITE_URL` | Unsubscribe and invite links | Provided by Convex | Provided by Convex |

## The website

`web/` (useflipbook.com, on Vercel) reads one variable, `NEXT_PUBLIC_CONVEX_SITE_URL`, for the waitlist form and the sign-up count. ⚠️ Which deployment it points at has not been confirmed: check it in Vercel → Project → Settings → Environment Variables. If it is the development deployment, waitlist sign-ups have been landing there.

## Issues found

None of these is fixed here; each is for Moks to decide or for the task named.

1. **The beta invite gate is off in production.** `BETA_INVITE_REQUIRED` is not set, so anyone who installs the app can create an account without a code. `docs/beta-readiness.md` says to set it for production. Decide whether that is intended.
2. **Re-engagement emails never send in production.** `REENGAGEMENT_EMAILS_ENABLED` is not set, so the weekly cron for the P5-T5 email pair runs and sends nothing. Decide whether that is intended.
3. **The development deployment can send real email.** It has a Resend key, so anything that emails from development, such as minting invites, reaches whatever addresses are in its data. Worth knowing before seeding development with real addresses.
4. **PostHog cannot be filtered by environment.** The app sends no environment property with its events, so preview and production events are indistinguishable in one project. Belongs to S0-6.
5. **Preview crashes are filed as production in Sentry, with unreadable stack traces.** No `EXPO_PUBLIC_ENV` in the EAS `preview` environment, and source-map upload is disabled there. Belongs to S0-6 (set `EXPO_PUBLIC_ENV=preview`, and decide whether preview uploads source maps).
6. **No staging deployment** (raised by the spec). There is a development deployment and a production one, and testers are on production. Migration rehearsals ("Moving v1 users across", step 3, in `architecture.md`) need a copy of production data somewhere that is neither, so they have nowhere safe to run. Moks decides before the first migration, in Sprint 10.

## How to re-check

- **EAS:** `eas env:list --environment preview` and `--environment production`.
- **Convex:** `npx convex env list` (development) and `npx convex env list --prod`. Both print values; share names only.
- **Clerk:** a key starting `pk_test_` is the development instance; `pk_live_` is production.

Update the "Confirmed by" line at the top whenever this file is re-checked.
