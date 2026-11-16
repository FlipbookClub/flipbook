import { createPostHogBackend, environmentName, type PostHogLike } from "./analytics";

function fakeClient() {
  const calls: { method: string; args: unknown[] }[] = [];
  const client: PostHogLike = {
    identify: (...args) => void calls.push({ method: "identify", args }),
    capture: (...args) => void calls.push({ method: "capture", args }),
    screen: (...args) => void calls.push({ method: "screen", args }),
    reset: (...args) => void calls.push({ method: "reset", args }),
    register: (...args) => {
      calls.push({ method: "register", args });
      return Promise.resolve();
    },
  };
  return { client, calls };
}

describe("environmentName", () => {
  it("passes a real environment through", () => {
    expect(environmentName("development")).toBe("development");
    expect(environmentName("preview")).toBe("preview");
  });

  it("is 'unknown' when EXPO_PUBLIC_ENV is missing or empty", () => {
    expect(environmentName(undefined)).toBe("unknown");
    expect(environmentName("")).toBe("unknown");
  });
});

describe("createPostHogBackend", () => {
  it("registers the environment as soon as it is created", () => {
    const { client, calls } = fakeClient();
    createPostHogBackend(client, "development");
    expect(calls).toEqual([{ method: "register", args: [{ environment: "development" }] }]);
  });

  it("adds the environment to every event, keeping the event's own properties", () => {
    const { client, calls } = fakeClient();
    const backend = createPostHogBackend(client, "preview");
    backend.capture("sign_in", { method: "password" });
    expect(calls.at(-1)).toEqual({
      method: "capture",
      args: ["sign_in", { method: "password", environment: "preview" }],
    });
  });

  it("does not let an event property overwrite the environment", () => {
    const { client, calls } = fakeClient();
    const backend = createPostHogBackend(client, "production");
    backend.capture("sign_in", { environment: "development" });
    expect(calls.at(-1)?.args[1]).toEqual({ environment: "production" });
  });

  it("adds the environment to screen views", () => {
    const { client, calls } = fakeClient();
    const backend = createPostHogBackend(client, "development");
    backend.screen("Settings");
    expect(calls.at(-1)).toEqual({
      method: "screen",
      args: ["Settings", { environment: "development" }],
    });
  });

  it("registers the environment again after reset, which clears it", () => {
    const { client, calls } = fakeClient();
    const backend = createPostHogBackend(client, "development");
    backend.reset();
    expect(calls.slice(-2)).toEqual([
      { method: "reset", args: [] },
      { method: "register", args: [{ environment: "development" }] },
    ]);
  });

  it("passes identify straight through, so only what the caller sends is sent", () => {
    const { client, calls } = fakeClient();
    const backend = createPostHogBackend(client, "development");
    backend.identify("user_123");
    expect(calls.at(-1)).toEqual({ method: "identify", args: ["user_123", undefined] });
  });

  it("survives a client whose register throws", () => {
    const { client } = fakeClient();
    client.register = () => {
      throw new Error("boom");
    };
    expect(() => createPostHogBackend(client, "development")).not.toThrow();
  });
});
