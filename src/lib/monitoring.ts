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
