// S0-5. App-side tests (src/). Backend tests run under Vitest: vitest.config.ts.
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
};
