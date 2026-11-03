import { beforeEach, describe, expect, it, vi } from "vitest";

const openpanel = vi.hoisted(() => ({
  options: undefined as unknown,
  setGlobalProperties: vi.fn(),
  track: vi.fn(),
}));
vi.mock("@openpanel/web", () => ({
  OpenPanel: class {
    constructor(options: unknown) {
      openpanel.options = options;
    }
    setGlobalProperties = openpanel.setGlobalProperties;
    track = openpanel.track;
    identify = vi.fn();
    setGroup = vi.fn();
    upsertGroup = vi.fn();
  },
}));

import { startUsageAnalytics } from "@/analytics/openpanelWeb";

const settings = {
  clientId: "c-1",
  apiUrl: "/api/telemetry/usage",
  sessionId: "s-1",
};

beforeEach(() => vi.clearAllMocks());

describe("startUsageAnalytics with OpenPanel", () => {
  it("sends to the app's own telemetry proxy", () => {
    startUsageAnalytics(settings);
    expect(openpanel.options).toMatchObject({
      clientId: "c-1",
      apiUrl: `${window.location.origin}/api/telemetry/usage`,
    });
  });

  it("puts the tab's session id and the UI version on every event", () => {
    startUsageAnalytics(settings);
    expect(openpanel.setGlobalProperties).toHaveBeenCalledWith({
      session_id: "s-1",
      ui_version: "current",
    });
  });

  it("puts the build number on every event", () => {
    startUsageAnalytics({ ...settings, pwaVersion: "434875" });
    expect(openpanel.setGlobalProperties).toHaveBeenCalledWith({
      session_id: "s-1",
      ui_version: "current",
      pwa_version: "434875",
    });
  });

  it("says redesign when the deployment runs the redesign", () => {
    startUsageAnalytics({ ...settings, uiVersion: "redesign" });
    expect(openpanel.setGlobalProperties).toHaveBeenCalledWith({
      session_id: "s-1",
      ui_version: "redesign",
    });
  });
});
