// Shared MMKV-backed key/value store with an in-memory fallback for Expo Go
// (MMKV requires a JSI-linked native module and throws when imported there).
// The fallback is per-process and non-persistent — fine for Expo Go demoing,
// real persistence happens in dev/preview/production builds.

export interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

function create(): KVStore {
  try {
    const { createMMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
    return createMMKV() as unknown as KVStore;
  } catch {
    const memory = new Map<string, string>();
    return {
      getString: (k) => memory.get(k),
      set: (k, v) => {
        memory.set(k, v);
      },
      delete: (k) => {
        memory.delete(k);
      },
    };
  }
}

export const storage: KVStore = create();
