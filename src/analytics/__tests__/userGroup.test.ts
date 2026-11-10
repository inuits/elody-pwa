/**
 * The group a user's usage (OpenPanel) and traces (HyperDX) are counted in
 * differs per client, and the deployment's app config says which: the library
 * of the user's e-mail domain (as it always was), or the organisation the
 * user works in, the selected tenant. A tenant is only known once the app has
 * loaded its tenants, and it can change: the group follows it.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialUserGroup,
  resetUserGroup,
  tenantSelected,
  followTenantGroup,
} from "@/analytics/userGroup";
import {
  initUsageAnalytics,
  resetUsageAnalytics,
  type UsageTracker,
} from "@/analytics/usageAnalytics";
import {
  initBrowserTracing,
  resetBrowserTracing,
} from "@/tracing/browserTracing";

const fakeTracker = (): UsageTracker => ({
  track: vi.fn(),
  identify: vi.fn(),
  setGroup: vi.fn(),
  upsertGroup: vi.fn(),
});

const user = { sub: "kc-123", email: "Ann.Peeters@Brugge.be" };

describe("the group at the start", () => {
  it("is the library of the e-mail domain when the config says nothing", () => {
    expect(initialUserGroup(undefined, user)).toEqual({
      id: "brugge.be",
      name: "brugge.be",
      type: "library",
    });
    expect(initialUserGroup(undefined, undefined)).toBeUndefined();
  });

  it("is called what the client calls it", () => {
    expect(
      initialUserGroup({ source: "emailDomain", type: "school" }, user)?.type,
    ).toBe("school");
  });

  it("is not known yet when it is the tenant", () => {
    expect(
      initialUserGroup({ source: "tenant", type: "organisation" }, user),
    ).toBeUndefined();
  });
});

describe("the group of the selected tenant", () => {
  const tracker = fakeTracker();
  const tracing = { identify: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    resetUserGroup();
    resetUsageAnalytics();
    resetBrowserTracing();
    await initUsageAnalytics(
      { usageAnalytics: { clientId: "c", apiUrl: "/api/telemetry/usage" } },
      "s-1",
      async () => ({ startUsageAnalytics: () => tracker }),
    );
    await initBrowserTracing(
      { browserTracing: { tracesUrl: "/t", serviceName: "pwa" } },
      async () => ({ startBrowserTracing: () => tracing }),
    );
  });

  it("puts the user in the tenant's group, in OpenPanel and in HyperDX", () => {
    followTenantGroup({ source: "tenant", type: "organisation" }, "p-1");
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    expect(tracker.upsertGroup).toHaveBeenCalledWith({
      id: "tenant:arsenaal",
      type: "organisation",
      name: "Arsenaal",
    });
    expect(tracker.setGroup).toHaveBeenCalledWith("tenant:arsenaal");
    expect(tracing.identify).toHaveBeenCalledWith({
      pseudonym: "p-1",
      group: "Arsenaal",
    });
  });

  it("follows the user to another tenant", () => {
    followTenantGroup({ source: "tenant", type: "organisation" }, "p-1");
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    tenantSelected({ id: "tenant:de-studio", label: "De Studio" });
    expect(tracker.setGroup).toHaveBeenLastCalledWith("tenant:de-studio");
    expect(tracing.identify).toHaveBeenLastCalledWith({
      pseudonym: "p-1",
      group: "De Studio",
    });
  });

  it("uses a tenant that was selected before the user was known", () => {
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    expect(tracker.setGroup).not.toHaveBeenCalled();
    followTenantGroup({ source: "tenant", type: "organisation" }, "p-1");
    expect(tracker.setGroup).toHaveBeenCalledWith("tenant:arsenaal");
  });

  it("names a tenant without a label by its id", () => {
    followTenantGroup({ source: "tenant", type: "organisation" }, "p-1");
    tenantSelected({ id: "tenant:x", label: "" });
    expect(tracker.upsertGroup).toHaveBeenCalledWith({
      id: "tenant:x",
      type: "organisation",
      name: "tenant:x",
    });
  });

  it("leaves the group alone when it is the e-mail domain, or without a user", () => {
    followTenantGroup({ source: "emailDomain", type: "library" }, "p-1");
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    followTenantGroup(undefined, "p-1");
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    resetUserGroup();
    followTenantGroup({ source: "tenant", type: "organisation" }, undefined);
    tenantSelected({ id: "tenant:arsenaal", label: "Arsenaal" });
    expect(tracker.setGroup).not.toHaveBeenCalled();
    expect(tracing.identify).not.toHaveBeenCalled();
  });
});
