// S0-5. Every Convex module, for convex-test (see appConfig.test.ts). The
// pattern skips files with more than one dot, such as this file and *.test.ts,
// which Convex itself also never deploys.
//
// import.meta.glob is Vite's (Vitest runs on Vite). It is typed here rather
// than through `vite/client`, whose catch-all `*.svg` declaration would
// override the app's react-native-svg-transformer typing and break
// src/components/ui/Wordmark.tsx in the root typecheck.
declare global {
  interface ImportMeta {
    glob(pattern: string): Record<string, () => Promise<unknown>>;
  }
}

export const modules = import.meta.glob("./**/!(*.*.*)*.*s");
