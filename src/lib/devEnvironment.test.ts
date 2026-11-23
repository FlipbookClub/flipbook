import { clerkInstance, describeDevEnvironment, devEnvironmentLabel } from "./devEnvironment";

describe("clerkInstance", () => {
  it("reads only the prefix", () => {
    expect(clerkInstance("pk_test_abc")).toBe("test");
    expect(clerkInstance("pk_live_abc")).toBe("live");
  });

  it("is unknown for anything else", () => {
    expect(clerkInstance(undefined)).toBe("unknown");
    expect(clerkInstance("")).toBe("unknown");
    expect(clerkInstance("sk_test_abc")).toBe("unknown");
  });
});

describe("describeDevEnvironment", () => {
  it("is safe for tests only with the development env and a test Clerk key", () => {
    expect(describeDevEnvironment("development", "pk_test_x").safeForTests).toBe(true);
    expect(describeDevEnvironment("development", "pk_live_x").safeForTests).toBe(false);
    expect(describeDevEnvironment("production", "pk_test_x").safeForTests).toBe(false);
    expect(describeDevEnvironment(undefined, "pk_test_x").safeForTests).toBe(false);
  });

  it("never puts the key itself in the label", () => {
    const label = devEnvironmentLabel(describeDevEnvironment("development", "pk_test_secretish"));
    expect(label).toBe("Flipbook Dev · development · Clerk test");
    expect(label).not.toContain("secretish");
  });

  it("labels a production key plainly, so the smoke flow refuses it", () => {
    expect(devEnvironmentLabel(describeDevEnvironment("development", "pk_live_x"))).toContain(
      "Clerk live",
    );
  });
});
