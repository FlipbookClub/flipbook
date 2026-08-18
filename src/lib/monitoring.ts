// Crash + error reporting.
//
// Sentry is OPTIONAL and stays completely OFF unless EXPO_PUBLIC_SENTRY_DSN is
// set. When off, this module makes ZERO native calls — it only logs to the
// console — so a binary that doesn't include the Sentry native SDK (e.g. the
// current dev build) is never touched and can't be bricked. The Sentry module
// is lazy-`require`d inside init, so even the import doesn't run until a DSN is
// present AND a build that bundled the native SDK is running.
//
// To turn it on: create a Sentry project, set EXPO_PUBLIC_SENTRY_DSN, and ship
// a fresh EAS build (which autolinks the native SDK). See docs/beta-readiness.md.

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

type SentryModule = typeof import("@sentry/react-native");

let sentry: SentryModule | null = null;
let enabled = false;

export function initMonitoring(): void {
  if (!DSN) return; // dormant — nothing loaded, nothing native touched
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sentry = require("@sentry/react-native") as SentryModule;
    sentry.init({
      dsn: DSN,
      // Conservative defaults — no PII, light tracing. Tune once it's live.
      sendDefaultPii: false,
      tracesSampleRate: 0.2,
      environment: process.env.EXPO_PUBLIC_ENV ?? "production",
    });
    enabled = true;
  } catch {
    sentry = null;
    enabled = false;
  }
}

// Report a caught error. No-ops to console when monitoring is off.
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (enabled && sentry) {
    try {
      sentry.captureException(error, context ? { extra: context } : undefined);
      return;
    } catch {
      /* fall through to console */
    }
  }
  console.error("[monitoring] captureException", error, context ?? "");
}

export function isMonitoringEnabled(): boolean {
  return enabled;
}

// What users see when something fails for a reason we can't explain to them
// usefully. Deliberately blank of detail: error codes and library messages
// are for us, not for readers.
export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Report a caught error and get back a short reference to show the user.
 *
 * `where` tags the flow ("signin", "book_upload", …) so Sentry groups by
 * operation rather than by whatever wording a dependency happened to use.
 * Everything else in `context` rides along as extra data.
 *
 * Returns the first 8 characters of the Sentry event id, or null when
 * monitoring is off. Support can search the full id by that prefix, which is
 * why users get a reference instead of an error code: it means something to
 * us and nothing to an attacker.
 */
export function reportError(
  error: unknown,
  context: { where: string } & Record<string, unknown>,
): string | null {
  const { where, ...extra } = context;
  if (enabled && sentry) {
    try {
      const eventId = sentry.captureException(error, {
        tags: { where },
        extra,
      });
      return typeof eventId === "string" ? eventId.slice(0, 8) : null;
    } catch {
      /* fall through to console */
    }
  }
  console.error(`[monitoring] ${where}`, error, extra);
  return null;
}

/**
 * The message to show a user for an unexpected failure, with a support
 * reference appended when we have one. Reports to Sentry as a side effect.
 *
 * Use this for the FALLBACK branch only. Errors we recognise and can explain
 * (a known ConvexError code, "this account uses Google") should keep their
 * specific, helpful wording — the point is to stop leaking raw library text
 * and error codes, not to make every failure opaque.
 */
export function userFacingError(
  error: unknown,
  context: { where: string } & Record<string, unknown>,
  message: string = GENERIC_ERROR_MESSAGE,
): string {
  const ref = reportError(error, context);
  return ref ? `${message} (ref: ${ref})` : message;
}
