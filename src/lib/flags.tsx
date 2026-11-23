import {
  Component,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";

import { useConnectivity } from "./connectivity";
import { FLAGS_TIMEOUT_MS, INITIAL_FLAGS, resolveFlags, type FlagsSnapshot, type FlagsSource } from "./flagState";
import { captureException } from "./monitoring";
import { api } from "../../convex/_generated/api";

// S0-7 feature flags, app side. One live query for every flag, held by
// FlagsProvider at the app root; components read it with useFlag(key).
//
// Every flag is off until the server says otherwise, and the app never waits
// for it: offline, or no answer within FLAGS_TIMEOUT_MS (2 s), and every flag
// stays off (rules in flagState.ts). Once the answer arrives it is live:
// toggling a flag in the Convex dashboard reaches the phone within seconds.

const FlagsContext = createContext<FlagsSnapshot>(INITIAL_FLAGS);

function FlagsQuery({ onChange }: { onChange: (keys: string[] | undefined) => void }) {
  const keys = useQuery(api.flags.listEnabled, {});
  useEffect(() => {
    onChange(keys);
  }, [keys, onChange]);
  return null;
}

// useQuery throws during render when the server rejects the query, most
// plausibly a build reaching a phone before flags.listEnabled is deployed.
// That must leave every flag off, not take the app down.
class FlagsBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    captureException(error, { where: "FlagsProvider" });
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function FlagsProvider({ children }: { children: ReactNode }) {
  const [serverKeys, setServerKeys] = useState<string[] | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const { isOnline, isReady } = useConnectivity();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), FLAGS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const snapshot = useMemo(
    () =>
      resolveFlags({
        serverKeys,
        failed,
        // Only once NetInfo has reported: before that, the timeout covers it.
        offline: isReady && !isOnline,
        timedOut,
      }),
    [serverKeys, failed, isReady, isOnline, timedOut],
  );

  return (
    <FlagsContext.Provider value={snapshot}>
      <FlagsBoundary onError={() => setFailed(true)}>
        <FlagsQuery onChange={setServerKeys} />
      </FlagsBoundary>
      {children}
    </FlagsContext.Provider>
  );
}

/** Whether a flag is on for this user. Off while loading, offline or on error. */
export function useFlag(key: string): boolean {
  return useContext(FlagsContext).enabled.has(key);
}

/**
 * Whether the app may stop waiting for flags, and why. `settled` becomes true
 * when the server answers, the phone is offline, the query fails, or 2 s pass,
 * whichever is first. It never goes back to false. Not used yet: Sprint 1
 * holds the splash on it before choosing between the v1 and v2 shells.
 */
export function useFlagsStatus(): { settled: boolean; source: FlagsSource } {
  const { settled, source } = useContext(FlagsContext);
  return { settled, source };
}
