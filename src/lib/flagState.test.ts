import { FLAGS_TIMEOUT_MS, INITIAL_FLAGS, resolveFlags } from "./flagState";

const base = { serverKeys: undefined, failed: false, offline: false, timedOut: false };

describe("resolveFlags", () => {
  it("starts unsettled with every flag off", () => {
    expect(INITIAL_FLAGS.settled).toBe(false);
    expect(INITIAL_FLAGS.source).toBe("loading");
    expect(INITIAL_FLAGS.enabled.size).toBe(0);
  });

  it("uses the server's answer as soon as it arrives", () => {
    const s = resolveFlags({ ...base, serverKeys: ["v2_shell"] });
    expect(s).toMatchObject({ settled: true, source: "server" });
    expect(s.enabled.has("v2_shell")).toBe(true);
  });

  it("an empty answer from the server is settled, with everything off", () => {
    const s = resolveFlags({ ...base, serverKeys: [] });
    expect(s).toMatchObject({ settled: true, source: "server" });
    expect(s.enabled.size).toBe(0);
  });

  it("offline settles at once with everything off: no waiting on the network", () => {
    const s = resolveFlags({ ...base, offline: true });
    expect(s).toMatchObject({ settled: true, source: "offline" });
    expect(s.enabled.size).toBe(0);
  });

  it("after the timeout, settles with everything off", () => {
    const s = resolveFlags({ ...base, timedOut: true });
    expect(s).toMatchObject({ settled: true, source: "timeout" });
    expect(s.enabled.size).toBe(0);
  });

  it("a failed query settles with everything off", () => {
    const s = resolveFlags({ ...base, failed: true });
    expect(s).toMatchObject({ settled: true, source: "error" });
    expect(s.enabled.size).toBe(0);
  });

  it("an answer that arrives after the timeout or while marked offline still applies", () => {
    expect(resolveFlags({ ...base, timedOut: true, serverKeys: ["v2_shell"] }).enabled.has("v2_shell")).toBe(true);
    expect(resolveFlags({ ...base, offline: true, serverKeys: ["v2_shell"] }).source).toBe("server");
  });

  it("the timeout is about two seconds", () => {
    expect(FLAGS_TIMEOUT_MS).toBe(2000);
  });
});
