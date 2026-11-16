import { DEVELOPMENT_VARIANT, readAppVariant } from "./appVariant";

jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: {} } }));

describe("readAppVariant", () => {
  it("reads the variant app.config.ts writes for Flipbook Dev", () => {
    expect(readAppVariant({ appVariant: "development", eas: { projectId: "x" } })).toBe(
      DEVELOPMENT_VARIANT,
    );
  });

  it("is null for preview and production, which carry no variant", () => {
    expect(readAppVariant({ eas: { projectId: "x" } })).toBeNull();
    expect(readAppVariant(undefined)).toBeNull();
    expect(readAppVariant(null)).toBeNull();
  });

  it("ignores a value that is not a string", () => {
    expect(readAppVariant({ appVariant: true })).toBeNull();
    expect(readAppVariant({ appVariant: 1 })).toBeNull();
  });
});
