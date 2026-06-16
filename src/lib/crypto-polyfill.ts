// Polyfill `globalThis.crypto.getRandomValues` for release builds.
//
// MUST be imported before any Convex/Clerk client is constructed (it is the very
// first import in index.ts). Hermes ships no WebCrypto, yet both the Convex and
// Clerk SDKs call `crypto.getRandomValues` during client init. When it is absent,
// Clerk's init blocks forever — `isLoaded` never flips true — and the app hangs
// on a blank/white screen. That was the production-launch bug.
//
// Why expo-crypto and not react-native-get-random-values: the prebuilt ios/
// project predated react-native-get-random-values, so its native module
// (RNGetRandomValues) was never compiled into the binary — its JS shim bound to a
// missing native module and crypto.getRandomValues was non-functional. expo-crypto
// is an autolinked Expo module present in EVERY build, so backing the polyfill
// with it can't silently break the same way again.
import { getRandomValues } from "expo-crypto";

type GetRandomValues = <T extends ArrayBufferView | null>(array: T) => T;

// Cast through `unknown` to a minimal shape: the DOM `Crypto` type would force
// us to also provide `subtle`/`randomUUID`, which neither Convex nor Clerk needs.
const host = globalThis as unknown as {
  crypto?: { getRandomValues?: GetRandomValues };
};

if (typeof host.crypto !== "object" || host.crypto === null) {
  host.crypto = {};
}

// Always assign — never trust a pre-existing impl. A non-functional shim from
// another package can pass a `typeof === "function"` guard yet throw at call
// time, which is precisely the failure mode this file exists to prevent.
host.crypto.getRandomValues = getRandomValues as GetRandomValues;
