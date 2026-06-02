import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { analytics } from "./analytics";

// Keeps the analytics identity in sync with auth: identify once the user's
// Convex record resolves, reset on sign-out. Mount once near the app root.
export function useAnalyticsIdentity(): void {
  const { isSignedIn } = useAuth();
  const me = useQuery(api.users.me);
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (isSignedIn && me?._id && identifiedId.current !== me._id) {
      analytics.identify(me._id, { displayName: me.displayName });
      identifiedId.current = me._id;
    } else if (!isSignedIn && identifiedId.current) {
      analytics.reset();
      identifiedId.current = null;
    }
  }, [isSignedIn, me?._id, me?.displayName]);
}
