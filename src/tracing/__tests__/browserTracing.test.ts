import { afterEach, describe, it, expect, vi } from "vitest";
import { initBrowserTracing } from "@/tracing/browserTracing";

const settings = {
  tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
  serviceName: "pwa",
};

afterEach(() => vi.restoreAllMocks());

describe("initBrowserTracing", () => {
  it("does not load the OpenTelemetry SDK when the config has no browserTracing", async () => {
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

  it("keeps the app running when the SDK cannot be loaded", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const load = vi.fn().mockRejectedValue(new Error("chunk failed"));
    expect(await initBrowserTracing({ browserTracing: settings }, load)).toBe(
      false,
    );
    expect(warn).toHaveBeenCalled();
  });
});
