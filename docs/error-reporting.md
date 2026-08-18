# Error reporting and observability

**Status:** client wiring done Aug 18, 2026. Convex-side forwarding is a
dashboard setting and still needs doing (see below).

## The short version

Users never see error codes, library text, or stack traces. They see a plain
message and, when we have one, a short support reference. The detail goes to
Sentry, grouped by which flow failed.

There is no custom dashboard and there should not be one. Sentry already does
grouping, release tracking, breadcrumbs and alerting better than anything we
would build, and it is already paid for.

## What lives where

| Signal | Tool | Notes |
|---|---|---|
| Crashes and caught errors | **Sentry** | `EXPO_PUBLIC_SENTRY_DSN`, production env. Dormant with no DSN, so dev builds stay untouched. |
| Product activity, funnels | **PostHog** | `analytics.track(...)` in `src/lib/analytics.ts`. |
| Server function logs | **Convex dashboard** | Per-invocation logs with a Request ID. That ID is what appears in a client "Server Error" message. |

## Using it from app code

Everything is in `src/lib/monitoring.ts`.

```ts
// Unexpected failure: generic message for the user, detail to Sentry.
setFormError(
  userFacingError(err, { where: "signin", clerkCode: code }, "We couldn't sign you in."),
);

// Background failure with nothing to show a user.
reportError(err, { where: "reaction_queue_flush", reason: "max_attempts" });
```

`where` is the flow, not the error. It is the Sentry tag, so grouping follows
the operation rather than whatever wording a dependency happened to use.
Current values: `signin`, `signup`, `verify_email`, `verify_email_resend`,
`password_reset`, `password_reset_request`, `password_reset_resend`,
`profile_setup`, `book_upload`, `publish_chapter`, `join_with_code`,
`invite_accept`, `create_community`, `club_delete`, `reaction_queue_flush`.

### The rule about specific messages

`userFacingError` is for the **fallback** branch only. Errors we recognise and
can act on keep their specific wording, because those messages help:

- "This email is signed up with Apple or Google, not a password."
- "That invite code has already been used."
- "You're at the 3-club limit on the free tier."

The goal is to stop leaking raw codes and library text, not to make every
failure opaque. Before this pass, three screens fell through to showing the
raw ConvexError code, so a user could be told `not_a_member`.

### The support reference

`userFacingError` returns the first 8 characters of the Sentry event id and
appends it as `(ref: ab12cd34)`. Support searches that prefix in Sentry to find
the exact event. It means something to us and nothing to anyone else, which is
the point: an error code tells an attacker about your internals, a reference
does not.

When Sentry is off (dev builds, no DSN) there is no reference and the message
appears alone. Nothing breaks.

## Still to do: Convex server errors into Sentry

Server-side exceptions currently only reach the Convex dashboard. Convex
supports forwarding exceptions to Sentry from **Settings → Integrations** in
the Convex dashboard: add the same Sentry DSN there so client and server
failures land in one project.

Worth doing before store launch. The upload outage on Aug 17 was a server-side
argument-validation rejection: it was visible in Convex logs, but nothing
alerted, and it was found only because a tester screenshotted it.

## Reviewer checklist

- No `err.message`, `errors[0].message`, or `code` rendered into UI text.
- Every `catch` that matters either shows a recognised message or calls
  `userFacingError` / `reportError`.
- `where` names the flow and is reused, not invented per call site.
