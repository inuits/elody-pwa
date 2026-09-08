import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  user: { value: undefined as { role?: string } | undefined },
}));

vi.mock("@/main", () => ({
  get auth() {
    return { isAuthenticated: { value: true }, user: mocks.user.value };
  },
}));
vi.mock("@/composables/useTenant", () => ({
  default: () => ({
    selectedTenant: { value: "" },
    getCodeById: () => undefined,
    getIdFromCode: () => undefined,
    setTennant: vi.fn(),
    getLabelById: () => undefined,
  }),
}));
vi.mock("@/composables/useServiceVersionManager", () => ({
  useServiceVersionManager: () => ({ setVersion: vi.fn() }),
}));
vi.mock("@/composables/usePageStatus", () => ({
  usePageStatus: () => ({ resetPageStatus: vi.fn() }),
}));
vi.mock("@/helpers", () => ({
  getFromExpressEndpoint: vi.fn().mockResolvedValue(undefined),
  getChildrenOfHomeRoutes: () => [],
  requiresAuthForEntity: () => false,
}));

import { addRouterNavigationGuards } from "../routerNavigationGuards";

const alternativeRoutes = { fallback: "/devices-tt" };

const routerConfigWith = (permitted: boolean) => ({
  routerConfig: [
    {
      path: "/:tenant?/devices-anpr",
      name: "Home",
      meta: { alternativeRoutes, permitted },
      children: [
        {
          path: "/:tenant?/devices-anpr",
          name: "navigation.devices-anpr",
          meta: { alternativeRoutes, permitted },
        },
      ],
    },
  ],
});

// Drives the real beforeEach guard the way vue-router would. Only the verdict
// moved to the config; `alternativeRoutes` is static and still read off the
// router's own meta, so the fake carries it in both places.
const navigateTo = async (
  config: any,
  routeName: string,
  matchedMeta: object = { alternativeRoutes },
) => {
  let guard: any;
  const router = {
    afterEach: vi.fn(),
    beforeEach: (fn: any) => (guard = fn),
    currentRoute: { value: { meta: {} } },
  } as any;

  addRouterNavigationGuards(router, config);

  const next = vi.fn();
  await guard(
    {
      name: routeName,
      fullPath: "/devices-anpr",
      path: "/devices-anpr",
      params: {},
      query: {},
      matched: [
        { name: routeName, path: "/:tenant?/devices-anpr", meta: matchedMeta },
      ],
    },
    {},
    next,
  );
  return next;
};

describe("addRouterNavigationGuards route permissions", () => {
  beforeEach(() => {
    mocks.user.value = undefined;
  });

  it("lets a route the graphql layer permitted through", async () => {
    const next = await navigateTo(routerConfigWith(true), "Home");

    expect(next).toHaveBeenCalledWith();
  });

  it("redirects a route the graphql layer denied to the role's alternative", async () => {
    const next = await navigateTo(routerConfigWith(false), "Home");

    expect(next).toHaveBeenCalledWith("/devices-tt");
  });

  it("reads the verdict of a nested route, not only of a top-level one", async () => {
    const next = await navigateTo(
      routerConfigWith(false),
      "navigation.devices-anpr",
    );

    expect(next).toHaveBeenCalledWith("/devices-tt");
  });

  // A route that gates nothing carries no verdict at all, and always did pass.
  it("lets a route carrying no verdict through", async () => {
    const next = await navigateTo(
      { routerConfig: [{ path: "/", name: "Home", meta: {} }] },
      "Home",
      {},
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("sends the user to the alternative route for their own role", async () => {
    mocks.user.value = { role: "operator" };
    const next = await navigateTo(
      {
        routerConfig: [
          {
            path: "/:tenant?/devices-anpr",
            name: "Home",
            meta: {
              alternativeRoutes: { ...alternativeRoutes, operator: "/ops" },
              permitted: false,
            },
          },
        ],
      },
      "Home",
      { alternativeRoutes: { ...alternativeRoutes, operator: "/ops" } },
    );

    expect(next).toHaveBeenCalledWith("/ops");
  });
});
