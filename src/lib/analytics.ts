// Provider-agnostic analytics facade (TASK-091, S0-6).
//
// PostHog is live wherever EXPO_PUBLIC_POSTHOG_KEY is set (all three EAS
// environments; see docs/v2/environments.md) and a no-op that logs in __DEV__
// everywhere else. Call sites use the typed `analytics` API below.
//
// Every event carries `environment` (EXPO_PUBLIC_ENV: development, preview or
// production) so development traffic can be filtered out of the one project.
//
// Never send book text, reaction text, chat content or a person's name.
// Users are identified by their internal Convex id only.

// The full catalogue, with when each fires and its properties, is
// docs/v2/analytics-events.md. Ids and small enums only: never titles, text
// or names.
export type AnalyticsEvent =
  // v1, unchanged.
  | "sign_up"
  | "sign_in"
  | "sign_out"
  | "profile_completed"
  | "club_created"
  | "club_joined"
  | "book_opened"
  | "reaction_added"
  | "book_finished"
  | "chapter_published"
  // v2, declared in S0-8; none fires until the sprint named in the plan.
  | "community_created"
  | "community_joined"
  | "book_page_viewed"
  | "preview_started"
  | "chapter_finished"
  | "rental_started"
  | "gift_sent"
  | "gift_claimed"
  | "pro_prompt_viewed"
  | "pro_started"
  | "message_sent"
  | "voice_note_sent"
  | "session_joined";

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

// The slice of the PostHog client this module uses, so the wrapper below can
// be tested with a fake.
export interface PostHogLike {
  identify(distinctId: string, properties?: AnalyticsProps): void;
  capture(event: string, properties?: AnalyticsProps): void;
  screen(name: string, properties?: AnalyticsProps): void;
  reset(): void;
  register(properties: AnalyticsProps): Promise<void> | void;
}

export function environmentName(value: string | undefined): string {
  return value && value.length > 0 ? value : "unknown";
}

// Wraps a PostHog client so every event and screen carries `environment`.
// It is passed on each call as well as registered as a super property: the
// call-level copy covers events sent before registration finishes, and the
// registered copy covers what PostHog captures on its own (app lifecycle).
// reset() clears super properties, so it registers them again.
export function createPostHogBackend(client: PostHogLike, environment: string): AnalyticsBackend {
  const common = { environment };
  const registerCommon = () => {
    try {
      const pending = client.register(common);
      if (pending && typeof pending.catch === "function") pending.catch(() => undefined);
    } catch {
      /* analytics must never break the app */
    }
  };
  registerCommon();
  return {
    identify: (id, traits) => client.identify(id, traits),
    capture: (event, props) => client.capture(event, { ...props, ...common }),
    screen: (name, props) => client.screen(name, { ...props, ...common }),
    reset: () => {
      client.reset();
      registerCommon();
    },
  };
}

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
    backend = createPostHogBackend(client, environmentName(process.env.EXPO_PUBLIC_ENV));
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
