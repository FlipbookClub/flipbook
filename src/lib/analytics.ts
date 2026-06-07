// Provider-agnostic analytics facade (TASK-091).
//
// It's a NO-OP today (logs in __DEV__) so call sites can be instrumented
// without adding `posthog-react-native` — a native dependency — to the dev
// client mid-testing. Flipping PostHog on is three steps + a rebuild:
//
//   1. npx expo install posthog-react-native
//   2. Set EXPO_PUBLIC_POSTHOG_KEY (and optional EXPO_PUBLIC_POSTHOG_HOST,
//      defaults to https://us.i.posthog.com) in .env.local
//   3. Uncomment the PostHog backend in `initAnalytics()` below, then rebuild
//      the dev client / run an EAS build (native dep won't hot-reload).
//
// Call sites use the typed `analytics` API and don't change when PostHog lands.

export type AnalyticsEvent =
  | "sign_up"
  | "sign_in"
  | "sign_out"
  | "profile_completed"
  | "club_created"
  | "club_joined"
  | "book_opened"
  | "reaction_added"
  | "book_finished"
  | "chapter_published";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

interface AnalyticsBackend {
  identify(userId: string, traits?: AnalyticsProps): void;
  capture(event: AnalyticsEvent, props?: AnalyticsProps): void;
  screen(name: string, props?: AnalyticsProps): void;
  reset(): void;
}

function devLog(...args: unknown[]) {
  if (__DEV__) console.log("[analytics]", ...args);
}

// Default backend until PostHog is wired: dev-only console logging.
const noopBackend: AnalyticsBackend = {
  identify: (id, traits) => devLog("identify", id, traits),
  capture: (event, props) => devLog("capture", event, props),
  screen: (name, props) => devLog("screen", name, props),
  reset: () => devLog("reset"),
};

let backend: AnalyticsBackend = noopBackend;

// Called once at app boot. Stays on the no-op backend unless
// EXPO_PUBLIC_POSTHOG_KEY is set — fully dormant (no native calls, safe on a
// binary that doesn't bundle the PostHog SDK) until you configure a key and
// ship a build that includes it. The module is lazy-`require`d only when a key
// exists. See docs/beta-readiness.md.
export function initAnalytics(): void {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) return; // stay on no-op (local dev / not configured)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PostHog = require("posthog-react-native").default;
    const client = new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    });
    backend = {
      identify: (id, traits) => client.identify(id, traits),
      capture: (event, props) => client.capture(event, props),
      screen: (name, props) => client.screen(name, props),
      reset: () => client.reset(),
    };
  } catch (e) {
    devLog("PostHog init failed; staying on no-op", e);
  }
}

export const analytics = {
  /** Tie subsequent events to a user (call on auth). */
  identify: (userId: string, traits?: AnalyticsProps) => backend.identify(userId, traits),
  /** Capture a product event from the typed catalog. */
  track: (event: AnalyticsEvent, props?: AnalyticsProps) => backend.capture(event, props),
  /** Record a screen view. */
  screen: (name: string, props?: AnalyticsProps) => backend.screen(name, props),
  /** Clear identity (call on sign-out). */
  reset: () => backend.reset(),
};
