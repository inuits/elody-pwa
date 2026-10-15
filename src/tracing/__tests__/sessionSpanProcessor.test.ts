import { describe, expect, it, vi } from "vitest";
import { SessionSpanProcessor } from "@/tracing/sessionSpanProcessor";
import { initBrowserTracing } from "@/tracing/browserTracing";

describe("SessionSpanProcessor", () => {
  it("puts the session id on every span it sees start", () => {
    const span = { setAttribute: vi.fn() };
    new SessionSpanProcessor("s-1").onStart(span as any);
    expect(span.setAttribute).toHaveBeenCalledWith("session.id", "s-1");
  });

  it("has nothing to flush or shut down", async () => {
    const processor = new SessionSpanProcessor("s-1");
    await expect(processor.forceFlush()).resolves.toBeUndefined();
    await expect(processor.shutdown()).resolves.toBeUndefined();
  });
});

describe("initBrowserTracing with a session id", () => {
  it("passes the session id to the SDK", async () => {
    const startBrowserTracing = vi.fn();
    const settings = { tracesUrl: "http://x/v1/traces", serviceName: "pwa" };
    await initBrowserTracing(
      { browserTracing: settings },
      async () => ({ startBrowserTracing }),
      "s-1",
    );
    expect(startBrowserTracing).toHaveBeenCalledWith({
      ...settings,
      sessionId: "s-1",
    });
  });
});
