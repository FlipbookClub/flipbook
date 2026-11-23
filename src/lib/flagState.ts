// S0-7. How the app turns "what the server said, if anything" into flag
// values. Pure, so the rules that decide what a reader sees on a slow or
// offline start are unit-tested (flagState.test.ts) rather than trusted.
//
// The rule that outranks the rest: THE APP NEVER WAITS ON THE NETWORK FOR
// FLAGS. Offline, or no answer within FLAGS_TIMEOUT_MS, means every flag is
// off and the app carries on (today: into v1).

export const FLAGS_TIMEOUT_MS = 2000;

export type FlagsSource =
  | "loading" // waiting, and still inside the timeout
  | "server" // the live answer from Convex
  | "offline" // the phone reports no connection: all off
  | "timeout" // no answer within FLAGS_TIMEOUT_MS: all off
  | "error"; // the query failed (e.g. not deployed yet): all off

export interface FlagsSnapshot {
  // True once the app may stop waiting. Never goes back to false.
  settled: boolean;
  source: FlagsSource;
  enabled: ReadonlySet<string>;
}

export interface FlagsInputs {
  serverKeys: readonly string[] | undefined;
  failed: boolean;
  offline: boolean;
  timedOut: boolean;
}

const NONE: ReadonlySet<string> = new Set();

export function resolveFlags({ serverKeys, failed, offline, timedOut }: FlagsInputs): FlagsSnapshot {
  // A real answer always wins, including one that arrives after the timeout:
  // flags stay live for the rest of the session. Anything that must not
  // change mid-session (which app shell to show) should read the flags once,
  // when they first settle, and keep that answer.
  if (serverKeys !== undefined) {
    return { settled: true, source: "server", enabled: new Set(serverKeys) };
  }
  if (failed) return { settled: true, source: "error", enabled: NONE };
  if (offline) return { settled: true, source: "offline", enabled: NONE };
  if (timedOut) return { settled: true, source: "timeout", enabled: NONE };
  return { settled: false, source: "loading", enabled: NONE };
}

export const INITIAL_FLAGS: FlagsSnapshot = resolveFlags({
  serverKeys: undefined,
  failed: false,
  offline: false,
  timedOut: false,
});
