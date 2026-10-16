import { beforeEach, describe, expect, it, vi } from "vitest";

const hyperdx = vi.hoisted(() => ({
  init: vi.fn(),
  setGlobalAttributes: vi.fn(),
}));
vi.mock("@hyperdx/browser", () => ({ default: hyperdx }));

import { startBrowserTracing } from "@/tracing/hyperdxBrowser";

const settings = {
  tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
  serviceName: "pwa",
};

beforeEach(() => vi.clearAllMocks());

describe("startBrowserTracing with HyperDX", () => {
  it("sends traces and logs (errors, console, replay) to the configured collector", () => {
    startBrowserTracing({ ...settings, apiKey: "ingest-1" });
    const options = hyperdx.init.mock.calls[0][0];
    expect(options).toMatchObject({
      apiKey: "ingest-1",
      service: "pwa",
      tracesUrl: "http://hyperdx.localhost:8000/otlp/v1/traces",
      logsUrl: "http://hyperdx.localhost:8000/otlp/v1/logs",
      consoleCapture: true,
      maskAllInputs: true,
    });
  });

  it("works without an ingestion key (a local collector)", () => {
    startBrowserTracing(settings);
    expect(hyperdx.init.mock.calls[0][0].apiKey).toBe("");
  });

  it("joins the app's own API to the browser's trace, and no other origin", () => {
    startBrowserTracing(settings);
    const targets: RegExp[] = hyperdx.init.mock.calls[0][0].tracePropagationTargets;
    const propagates = (url: string) => targets.some((target) => target.test(url));
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
      attributes: { "service.namespace": "vlacc-dams", "deployment.environment": "local" },
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
});
