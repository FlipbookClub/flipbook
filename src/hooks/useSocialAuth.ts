import { useCallback, useState } from "react";
import { useSSO } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import type { OAuthStrategy } from "@clerk/types";

// Wraps Clerk's `useSSO` for Apple + Google. The same flow handles both sign-up
// and sign-in: Clerk creates a session if the OAuth identity is new, otherwise
// signs into the existing one. On success the new session is activated, and
// the RootNavigator auth gate (TASK-021) routes forward.
//
// In Expo Go the redirect is `exp://<lan-ip>:8081`; in a dev/EAS build it's
// the app's scheme (`flipbook://`). Both must be added to the Clerk dashboard's
// allowed redirect URLs for the configured OAuth providers.
export function useSocialAuth() {
  const { startSSOFlow } = useSSO();
  const [providerInFlight, setProviderInFlight] = useState<OAuthStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startFlow = useCallback(
    async (strategy: OAuthStrategy) => {
      setError(null);
      setProviderInFlight(strategy);
      try {
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl: Linking.createURL("/"),
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        }
        // If createdSessionId is null the user cancelled — leave silently.
      } catch (err) {
        const message =
          (err as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          (err as { message?: string })?.message ??
          "Sign-in failed. Please try again.";
        setError(message);
      } finally {
        setProviderInFlight(null);
      }
    },
    [startSSOFlow],
  );

  return {
    startFlow,
    providerInFlight,
    error,
  };
}
