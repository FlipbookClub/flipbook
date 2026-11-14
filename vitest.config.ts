import { defineConfig } from "vitest/config";

// S0-5. Backend tests (convex/), run against an in-memory Convex with
// convex-test. App-side tests run under Jest: jest.config.js.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
