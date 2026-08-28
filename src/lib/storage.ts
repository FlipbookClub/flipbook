// Shared MMKV-backed key/value store with an in-memory fallback for Expo Go
// (MMKV requires a JSI-linked native module and throws when imported there).
// The fallback is per-process and non-persistent — fine for Expo Go demoing,
// real persistence happens in dev/preview/production builds.

import { reportError } from "./monitoring";

export interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

// `value` is typed as string, and yet: 239 Sentry events across 31 users,
// running for two months, all of them
//
//   MMKV.set(...): Cannot convert "null" to any type in variant<b, NSt6...>
//
// MMKV's Nitro binding accepts variant<bool, string, double, ArrayBuffer> and
// throws on anything else. Every call site in the app passes either a literal,
// a narrow union, or JSON.stringify(...) of an object, so TypeScript sees
// nothing wrong — which is exactly why this needs catching at runtime instead.
//
// Stack frames in Sentry are unsymbolicated (`anonymous(index.android)`) because
// no source maps are uploaded, so the key is currently the ONLY way to identify
// the caller. Hence reporting it rather than just swallowing the value.
//
// Skipping the write is the right failure mode: every consumer of this store
// already treats a missing key as "no cached value" and recomputes. A dropped
// write costs a cache miss; the throw was costing a broken operation.
function guardedSet(target: KVStore["set"], key: string, value: string): void {
  if (typeof value !== "string") {
    reportError(new Error("storage.set called with a non-string value"), {
      where: "storage_set",
      key,
      valueType: value === null ? "null" : typeof value,
    });
    return;
  }
  target(key, value);
}

function create(): KVStore {
  try {
    const { createMMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
    const mmkv = createMMKV() as unknown as KVStore;
    return {
      getString: (k) => mmkv.getString(k),
      set: (k, v) => guardedSet((kk, vv) => mmkv.set(kk, vv), k, v),
      delete: (k) => mmkv.delete(k),
    };
  } catch {
    const memory = new Map<string, string>();
    return {
      getString: (k) => memory.get(k),
      set: (k, v) =>
        guardedSet((kk, vv) => {
          memory.set(kk, vv);
        }, k, v),
      delete: (k) => {
        memory.delete(k);
      },
    };
  }
}

export const storage: KVStore = create();
