import { afterEach, describe, it, expect, vi } from "vitest";
import {
  identifyInBrowserTracing,
  initBrowserTracing,
  resetBrowserTracing,
} from "@/tracing/browserTracing";

const settings = {
  tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
  serviceName: "pwa",
};

afterEach(() => {
  resetBrowserTracing();
  vi.restoreAllMocks();
});

describe("initBrowserTracing", () => {
  it("does not load the HyperDX SDK when the config has no browserTracing", async () => {
    const load = vi.fn();
    expect(await initBrowserTracing({}, load)).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it("starts the SDK with the configured settings", async () => {
    const startBrowserTracing = vi.fn();
    const load = vi.fn().mockResolvedValue({ startBrowserTracing });
    expect(await initBrowserTracing({ browserTracing: settings }, load)).toBe(
      true,
    );
    expect(startBrowserTracing).toHaveBeenCalledWith(settings);
  });

  it("passes the tab's session id to the SDK", async () => {
    const startBrowserTracing = vi.fn();
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

  it("keeps the app running when the SDK cannot be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const load = vi.fn().mockRejectedValue(new Error("chunk failed"));
    expect(await initBrowserTracing({ browserTracing: settings }, load)).toBe(
      false,
    );
    expect(warn).toHaveBeenCalled();
  });
});

describe("identifyInBrowserTracing", () => {
  it("does nothing while browser tracing is off", () => {
    expect(() =>
      identifyInBrowserTracing({ pseudonym: "p-1", library: "brugge.be" }),
    ).not.toThrow();
  });

  it("tells the SDK the pseudonymous user and their library", async () => {
    const identify = vi.fn();
    await initBrowserTracing({ browserTracing: settings }, async () => ({
      startBrowserTracing: () => ({ identify }),
    }));
    identifyInBrowserTracing({ pseudonym: "p-1", library: "brugge.be" });
    expect(identify).toHaveBeenCalledWith({
      pseudonym: "p-1",
      library: "brugge.be",
    });
  });
});
