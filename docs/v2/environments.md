# Environments

**Task:** S0-4 (`docs/v2/specs/sprint-00-foundations.md`) · **Written:** 14 Nov 2026 · **Confirmed by:** Moks, 14 Nov 2026, from `eas env:list` (development, preview, production), the EAS, Convex and Vercel dashboards, `npx convex env list`, `.env.local` and the Clerk key prefixes

Which backend, sign-in instance and monitoring each kind of build talks to. Deployments are named by role only: this repository is public. **Never copy a key, secret or token into this file or any tracked file.**

## The three builds

| | Development | Preview (v1 testers) | Production |
| --- | --- | --- | --- |
| Built with | EAS `development`, `development-device` profiles ("Flipbook Dev") | EAS `preview` profile | EAS `production` profile |
| EAS environment | `development` | `preview` | `production` |
| Where its code's settings come from | **The dev server on your Mac**, not the build. See "Development builds and EAS variables" | EAS `preview` environment, baked in at build time | EAS `production` environment, baked in at build time |
| Convex deployment | **Development** | **Production** | **Production** |
| Clerk instance | **Development** (`pk_test_` key) | **Production** (`pk_live_` key) | **Production** (`pk_live_` key) |
| Sentry environment | `development`: DSN and `EXPO_PUBLIC_ENV` are in the EAS `development` environment, and reach the app only through the dev server | **Labelled `production` today** (no `EXPO_PUBLIC_ENV`); should be `preview` | `production` (the default) |
| PostHog project | Key in the EAS `development` environment, reaching the app only through the dev server ⚠️ confirm it is the same project | One project, shared with production | One project, shared with preview |

**Testers on the `preview` profile use production data.** Their builds sign in with the production Clerk instance and read the production Convex deployment, the same as store users. Anything run against preview touches real readers: never seed, migrate or test destructively there. This includes S0-2's version-gate test, which blocks every tester for as long as the minimum is raised.

**PostHog is one project for every build**, as the spec intended, but it cannot yet be filtered by environment: the app sends no environment property with its events (issue 3).

## App variables

What the app reads (`src/`, `App.tsx`, `app.config.ts`) and where each is set.

| Variable | Read by | Development (`.env.local` / EAS `development`) | EAS `preview` | EAS `production` |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_CONVEX_URL` | `src/lib/convex.ts`; the app refuses to start without it | `.env.local`: development deployment | Production deployment | Production deployment |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `src/lib/clerk.ts`; the app refuses to start without it | `.env.local`: `pk_test_` | `pk_live_` | `pk_live_` |
| `EXPO_PUBLIC_SENTRY_DSN` | `src/lib/monitoring.ts`; Sentry is off without it | EAS `development` (not in `.env.local`) | Set | Set |
| `EXPO_PUBLIC_ENV` | `src/lib/monitoring.ts`; Sentry environment name, default `production` | EAS `development`: `development` (not in `.env.local`) | **Not set** | Not set (default is right) |
| `EXPO_PUBLIC_POSTHOG_KEY` | `src/lib/analytics.ts`; analytics is a no-op without it | EAS `development` (not in `.env.local`) | Set (same as production) | Set (same as preview) |
| `EXPO_PUBLIC_POSTHOG_HOST` | `src/lib/analytics.ts`, default `https://us.i.posthog.com` | Not set | Not set (default) | Not set (default) |
| `APP_VARIANT` | `app.config.ts` (S0-3) | Set only by `npm run start:dev`, never in `.env.local` | Never | Never |

Build-time only, read by the Sentry Expo plugin when the build is made:

| Variable | EAS `preview` | EAS `production` | Effect |
| --- | --- | --- | --- |
| `SENTRY_AUTH_TOKEN` | Not set | Set | Uploads source maps, so production stack traces are readable |
| `SENTRY_DISABLE_AUTO_UPLOAD` | Set | Not set | Skips the upload, so **preview crash reports have unreadable stack traces** |

`.env.example` also lists RevenueCat keys. Nothing in the app reads them yet and no EAS environment sets them.

### Development builds and EAS variables

A development build does not carry its app code; it downloads it from the dev server running on your Mac each time it opens. Every `EXPO_PUBLIC_` value is written into that code **when the dev server bundles it**, from the dev server's own environment: `.env.local`, `.env`, and whatever is set in the shell that started it (checked in `babel-preset-expo`, `inline-env-vars.js`, in this repo's installed packages).

So the EAS `development` environment is used while EAS builds the native app, but **its `EXPO_PUBLIC_` values never reach a development build's code on their own**. With `.env.local` as it is today, a development build has no Sentry DSN, no `EXPO_PUBLIC_ENV` and no PostHog key: Sentry and PostHog are off, whatever the EAS `development` environment holds.

Two ways to get them in:

- **Start the dev server inside the EAS environment** (keeps `.env.local` as it is): `eas env:exec development "APP_VARIANT=development npx expo start"`. Values already in the shell take precedence over `.env.local`, so the three EAS values are added and `.env.local` still supplies the Convex URL and Clerk key.
- **Pull them into a file:** `eas env:pull --environment development` writes `.env.local` (or another file with `--path`). Check what it does to the Convex URL and Clerk key already there before using it.

Preview and production builds are different: their code is bundled on EAS during the build, so their EAS environments do reach it.

## Convex server variables

Set per deployment with `npx convex env set` (add `--prod` for production). Names only.

| Variable | Read by | Development | Production |
| --- | --- | --- | --- |
| `CLERK_JWT_ISSUER_DOMAIN` | `convex/auth.config.ts`; which Clerk instance may sign in | Set | Set |
| `CLERK_SECRET_KEY` | `convex/newsletter.ts`, to list accounts | Not set | Set |
| `RESEND_API_KEY` | All email sends (`email.ts`, `invites.ts`, `newsletter.ts`, `reengagement.ts`) | **Not set, on purpose** (see "Email from development") | Set |
| `EMAIL_UNSUB_SECRET` | `convex/lib/emailAuth.ts`, signs unsubscribe links | Set | Set |
| `WAITLIST_FROM_EMAIL` | Sender address; falls back to a default in code | Not set (default) | Not set (default) |
| `READING_REMINDERS_ENABLED` | `convex/notifications.ts`; reminder pushes only send when `"true"` | Not set (off) | Set |
| `REENGAGEMENT_EMAILS_ENABLED` | `convex/reengagement.ts`; weekly emails only send when `"true"` | Not set (off) | **`"true"`, decided 14 Nov 2026** (see "Production decisions") |
| `BETA_INVITE_REQUIRED` | `convex/invites.ts`; sign-up needs an invite code when set | Not set (off) | **Not set, on purpose** (see "Production decisions") |
| `CONVEX_SITE_URL` | Unsubscribe and invite links | Provided by Convex | Provided by Convex |

### Email from development

**The development deployment has no Resend key, on purpose** (decided by Moks, 14 Nov 2026). Without one, welcome, invite and re-engagement emails are skipped with a warning in the Convex logs, and the newsletter broadcast stops with an error. Nothing sent from development can reach a real reader.

To test email in development, set a temporary Resend key on the development deployment, send only to Resend's test addresses (such as `delivered@resend.dev`), and remove the key when done:

- `npx convex env set RESEND_API_KEY <temporary key>`
- `npx convex env remove RESEND_API_KEY`

### Production decisions

Both decided by Moks, 14 Nov 2026.

- **The beta invite gate stays off.** `BETA_INVITE_REQUIRED` is deliberately unset: anyone who has the TestFlight or Play testing link can create an account without a code. Access is controlled by who receives those links. This supersedes the instruction in `docs/beta-readiness.md` to set it for production.
- **Re-engagement emails are on.** `REENGAGEMENT_EMAILS_ENABLED` is set to `"true"` on production, so the weekly cron (Mondays, 09:00 UTC) sends the P5-T5 email pair to every eligible reader. Set with `npx convex env set REENGAGEMENT_EMAILS_ENABLED true --prod`.

## The website

`web/` (useflipbook.com, on Vercel) reads one variable, `NEXT_PUBLIC_CONVEX_SITE_URL`, for the waitlist form and the sign-up count. It points at the **production** deployment.

## Open issues

None of these is fixed here; each belongs to the task named.

1. **Preview crashes are filed as production in Sentry, with unreadable stack traces.** No `EXPO_PUBLIC_ENV` in the EAS `preview` environment, and source-map upload is disabled there. S0-6: set `EXPO_PUBLIC_ENV=preview`, and decide whether preview uploads source maps.
2. **Development builds don't receive their monitoring and analytics settings yet.** The EAS `development` environment holds the Sentry DSN, the PostHog key and `EXPO_PUBLIC_ENV=development`, but `npm run start:dev` doesn't load them, so they never reach a development build's code ("Development builds and EAS variables"). S0-6's exit gate needs a test error and a `sign_in` event from a development build, so this must be settled first.
3. **PostHog cannot be filtered by environment.** The app sends no environment property with its events, so preview and production events are indistinguishable in the one project. S0-6.
4. **No staging deployment** (raised by the spec). There is a development deployment and a production one, and testers are on production. Migration rehearsals ("Moving v1 users across", step 3, in `architecture.md`) need a copy of production data somewhere that is neither, so they have nowhere safe to run. Moks decides before the first migration, in Sprint 10.

## How to re-check

- **EAS:** `eas env:list --environment preview` and `--environment production`.
- **Convex:** `npx convex env list` (development) and `npx convex env list --prod`. Both print values; share names only.
- **Clerk:** a key starting `pk_test_` is the development instance; `pk_live_` is production.
- **Vercel:** Project → Settings → Environment Variables.

Update the "Confirmed by" line at the top whenever this file is re-checked.
