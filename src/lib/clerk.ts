import type { TokenCache } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Namespace the token cache by publishable key. iOS Keychain survives app
// deletion, so a token written by a *different* Clerk instance (e.g. a prior
// dev build's pk_test) can persist and hang the prod SDK on init — the
// production-launch white-screen we hit. Prefixing every key with a hash of the
// active publishable key means each instance reads only its own tokens; switch
// instances and the new one simply finds nothing and signs in fresh.
function instancePrefix(pk: string | undefined): string {
  let h = 5381;
  for (let i = 0; i < (pk?.length ?? 0); i += 1) {
    h = ((h << 5) + h + (pk as string).charCodeAt(i)) >>> 0;
  }
  return `clerk_${h.toString(16)}_`;
}

const PREFIX = instancePrefix(CLERK_PUBLISHABLE_KEY);

// SecureStore-backed token cache for Clerk. Wrapped in try/catch because
// SecureStore can fail on devices with disabled secure enclaves (rare) —
// in that case Clerk falls back to in-memory storage for the session.
export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(PREFIX + key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(PREFIX + key, value);
    } catch {
      // Silently swallow — Clerk will retry on next sign-in.
    }
  },
};
