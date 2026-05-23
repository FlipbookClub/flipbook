import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

// FR-084: simple "are we online enough to write to Convex" check. We treat
// "no network" and "captive portal / no internet reachable" both as offline,
// so mutations that fail can be queued (see [[src/lib/reactionQueue.ts]]).

export interface ConnectivityState {
  isOnline: boolean;
  // Initial value before the first NetInfo event resolves — `undefined` lets
  // callers avoid flashing an "Offline" banner during the first render.
  isReady: boolean;
}

export function useConnectivity(): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>({ isOnline: true, isReady: false });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => {
      const online =
        // Both fields are nullable on first event; treat null as "assume online"
        // so we don't false-positive an offline banner during boot.
        (s.isConnected ?? true) && (s.isInternetReachable ?? true);
      setState({ isOnline: online, isReady: true });
    });
    return unsub;
  }, []);

  return state;
}

// One-shot check for code paths that need to make a decision without a hook
// (e.g. retrying a queued mutation). Resolves to current state.
export async function isOnlineNow(): Promise<boolean> {
  const s = await NetInfo.fetch();
  return (s.isConnected ?? true) && (s.isInternetReachable ?? true);
}
