import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// FR-083 / Vision § Motion: respect the OS-level Reduce Motion setting.
// Components that slide/scale should switch to opacity-only when this
// returns true. Fades stay (they're already gentle); only motion drops.
export function useReducedMotion(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (!cancelled) setEnabled(v);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => setEnabled(v),
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return enabled;
}
