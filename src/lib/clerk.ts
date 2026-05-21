import type { TokenCache } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// SecureStore-backed token cache for Clerk. Wrapped in try/catch because
// SecureStore can fail on devices with disabled secure enclaves (rare) —
// in that case Clerk falls back to in-memory storage for the session.
export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently swallow — Clerk will retry on next sign-in.
    }
  },
};

export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
