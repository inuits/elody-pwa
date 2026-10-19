import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const hyperdx = vi.hoisted(() => ({
  init: vi.fn(),
  setGlobalAttributes: vi.fn(),
  addAction: vi.fn(),
  recordException: vi.fn(),
}));
vi.mock("@hyperdx/browser", () => ({ default: hyperdx }));

import { startBrowserTracing } from "@/tracing/hyperdxBrowser";

const settings = {
  tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
  serviceName: "pwa",
};

const { warn, error } = console;

beforeEach(() => {
  vi.clearAllMocks();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.warn = warn;
  console.error = error;
});

describe("startBrowserTracing with HyperDX", () => {
  it("sends traces and logs (errors, replay) to the configured collector", () => {
    startBrowserTracing({ ...settings, apiKey: "ingest-1" });
    const options = hyperdx.init.mock.calls[0][0];
    expect(options).toMatchObject({
      apiKey: "ingest-1",
      service: "pwa",
      tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
      logsUrl: "http://hyperdx.localhost:8000/otlp/v1/logs",
      maskAllInputs: true,
    });
  });

  it("works without an ingestion key (a local collector)", () => {
    startBrowserTracing(settings);
    expect(hyperdx.init.mock.calls[0][0].apiKey).toBe("");
  });

  it("joins the app's own API to the browser's trace, and no other origin", () => {
    startBrowserTracing(settings);
    const targets: RegExp[] =
      hyperdx.init.mock.calls[0][0].tracePropagationTargets;
    const propagates = (url: string) =>
      targets.some((target) => target.test(url));
    expect(propagates(`${window.location.origin}/api/graphql`)).toBe(true);
    expect(propagates("/api/graphql")).toBe(true);
    // OpenPanel's API also lives under /api, on another origin: no traceparent there
    expect(propagates("http://openpanel.localhost:8000/api/track")).toBe(false);
  });

  it("puts the tab's session id on everything it sends", () => {
    startBrowserTracing({ ...settings, sessionId: "s-1" });
    expect(hyperdx.setGlobalAttributes).toHaveBeenCalledWith({
      session_id: "s-1",
    });
  });

  it("names the user by pseudonym and the library as team, keeping the session id", () => {
    const tracing = startBrowserTracing({ ...settings, sessionId: "s-1" });
    tracing.identify({ pseudonym: "p-1", library: "brugge.be" });
    expect(hyperdx.setGlobalAttributes).toHaveBeenLastCalledWith({
      session_id: "s-1",
      userId: "p-1",
      teamId: "brugge.be",
    });
  });

  it("puts the client and environment on everything it sends, also once the user is known", () => {
    const tracing = startBrowserTracing({
      ...settings,
      sessionId: "s-1",
      attributes: {
        "service.namespace": "vlacc-dams",
        "deployment.environment": "local",
      },
    });
    expect(hyperdx.setGlobalAttributes).toHaveBeenCalledWith({
      session_id: "s-1",
      "service.namespace": "vlacc-dams",
      "deployment.environment": "local",
    });
    tracing.identify({ pseudonym: "p-1", library: "brugge.be" });
    expect(hyperdx.setGlobalAttributes).toHaveBeenLastCalledWith({
      session_id: "s-1",
      "service.namespace": "vlacc-dams",
      "deployment.environment": "local",
      userId: "p-1",
      teamId: "brugge.be",
    });
  });

  it("sends to the app's own telemetry proxy when the config names a path", () => {
    startBrowserTracing({
      ...settings,
      tracesUrl: "/api/telemetry/otlp/v1/traces",
    });
    const options = hyperdx.init.mock.calls[0][0];
    expect(options.tracesUrl).toBe(
      `${window.location.origin}/api/telemetry/otlp/v1/traces`,
    );
    expect(options.logsUrl).toBe(
      `${window.location.origin}/api/telemetry/otlp/v1/logs`,
    );
  });

  it("does not trace its own telemetry requests", () => {
    startBrowserTracing(settings);
    const ignored: RegExp[] = hyperdx.init.mock.calls[0][0].ignoreUrls;
    const ignores = (url: string) =>
      ignored.some((pattern) => pattern.test(url));
    expect(
      ignores(`${window.location.origin}/api/telemetry/otlp/v1/traces`),
    ).toBe(true);
    expect(ignores(`${window.location.origin}/api/telemetry/usage/track`)).toBe(
      true,
    );
    expect(ignores(`${window.location.origin}/api/graphql`)).toBe(false);
  });

  it("leaves HyperDX's own console capture off: it JSON-stringifies every argument", () => {
    startBrowserTracing(settings);
    expect(hyperdx.init.mock.calls[0][0].consoleCapture).toBe(false);
  });

  it("sends console warnings as console spans, with the arguments as short text", () => {
    startBrowserTracing(settings);
    console.warn('[Vue warn]: injection "TabsProvider" not found.', {
      tabs: [],
    });
    expect(hyperdx.addAction).toHaveBeenCalledWith("console.warn", {
      component: "console",
      level: "warn",
      message: '[Vue warn]: injection "TabsProvider" not found. [Object]',
    });
  });

  it("sends console errors as console spans, and the error with its stack", () => {
    const print = console.error;
    startBrowserTracing(settings);
    const failure = new Error("boom");
    console.error("save failed", failure);
    expect(print).toHaveBeenCalledWith("save failed", failure);
    expect(hyperdx.addAction).toHaveBeenCalledWith("console.error", {
      component: "console",
      level: "error",
      message: "save failed Error: boom",
    });
    expect(hyperdx.recordException).toHaveBeenCalledWith(failure);
  });

  it("prints console errors without HyperDX's error capture, which JSON-stringifies them too", () => {
    const print = console.error;
    hyperdx.init.mockImplementationOnce(() => {
      const before = console.error;
      console.error = (...args: unknown[]) => {
        JSON.stringify(args);
        before(...args);
      };
    });
    startBrowserTracing(settings);
    const stringify = vi.spyOn(JSON, "stringify");
    console.error("with a component", { $: {} });
    expect(stringify).not.toHaveBeenCalled();
    expect(print).toHaveBeenCalledWith("with a component", { $: {} });
    stringify.mockRestore();
  });
});
