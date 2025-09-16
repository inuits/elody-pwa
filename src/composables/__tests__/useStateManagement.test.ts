import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useStateManagement } from "../useStateManagement";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type {
  GetEntitiesQueryVariables,
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import { Entitytyping, SearchInputType } from "@/generated-types/queries";
import type { SavedSearchType } from "@/composables/useSaveSearchHepler";

const createMockQueryVariables = (
  overrides: Partial<GetEntitiesQueryVariables> = {},
): GetEntitiesQueryVariables => ({
  type: Entitytyping.BaseEntity,
  limit: 10,
  skip: 0,
  searchValue: {
    key: "title",
    value: "test",
    isAsc: true,
    order_by: "title",
  },
  advancedFilterInputs: [] as AdvancedFilterInput[],
  searchInputType: SearchInputType.SimpleInputtype,
  ...overrides,
});

const createMockRoute = (
  name: string,
  path: string,
): RouteLocationNormalizedLoaded => ({
  name,
  path,
  fullPath: path,
  hash: "",
  matched: [],
  meta: {},
  params: {},
  query: {},
  redirectedFrom: undefined,
});

const createMockBaseLibraryState = () => ({
  entityCountOnPage: 10,
  totalEntityCount: 100,
  queryVariables: createMockQueryVariables(),
  filterListItems: [
    {
      isActive: true,
      isDisplayed: true,
      advancedFilter: {} as AdvancedFilter,
      inputFromState: {} as AdvancedFilterInput,
      selectedMatcher: "contains",
    },
  ],
  lastUsedFilters: [] as SavedSearchType[],
  lastUsedFilter: {} as SavedSearchType,
  UIPanelStateCollapsed: [{ key: "panel1", value: true }] as [
    { key: string; value: boolean },
  ],
});

describe("useStateManagement", () => {
  let localStorageMock: Record<string, string>;
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    sessionStorageMock = {};

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          Object.keys(localStorageMock).forEach(
            (key) => delete localStorageMock[key],
          );
        }),
      },
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete sessionStorageMock[key];
        }),
        clear: vi.fn(() => {
          Object.keys(sessionStorageMock).forEach(
            (key) => delete sessionStorageMock[key],
          );
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Storage Type Handling", () => {
    it("should use localStorage by default", () => {
      const { setGlobalState } = useStateManagement();
      const testData = { test: "value" };

      setGlobalState("testKey", testData);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify(testData),
      );
      expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it("should use sessionStorage when specified", () => {
      const { setGlobalState } = useStateManagement();
      const testData = { test: "value" };

      setGlobalState("testKey", testData, "sessionStorage");

      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify(testData),
      );
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should serialize and deserialize data correctly", () => {
      const { setGlobalState, getGlobalState } = useStateManagement();
      const complexData = {
        string: "test",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: "value" },
        null: null,
      };

      setGlobalState("complexData", complexData);
      const retrievedData = getGlobalState("complexData");

      expect(retrievedData).toEqual(complexData);
    });
  });

  describe("Global State Management", () => {
    describe("setGlobalState", () => {
      it("should store data in localStorage by default", () => {
        const { setGlobalState } = useStateManagement();
        const testData = { key: "value" };

        setGlobalState("testKey", testData);

        expect(localStorageMock["testKey"]).toBe(JSON.stringify(testData));
      });

      it("should store data in sessionStorage when specified", () => {
        const { setGlobalState } = useStateManagement();
        const testData = { key: "value" };

        setGlobalState("testKey", testData, "sessionStorage");

        expect(sessionStorageMock["testKey"]).toBe(JSON.stringify(testData));
      });

      it("should not store duplicate data unnecessarily", () => {
        const { setGlobalState } = useStateManagement();
        const testData = { key: "value" };

        setGlobalState("testKey", testData);
        const setItemCallCount = (window.localStorage.setItem as any).mock.calls
          .length;

        setGlobalState("testKey", testData);

        expect((window.localStorage.setItem as any).mock.calls.length).toBe(
          setItemCallCount,
        );
      });
    });

    describe("getGlobalState", () => {
      it("should retrieve data from localStorage by default", () => {
        const { getGlobalState } = useStateManagement();
        const testData = { key: "value" };
        localStorageMock["testKey"] = JSON.stringify(testData);

        const result = getGlobalState("testKey");

        expect(result).toEqual(testData);
      });

      it("should retrieve data from sessionStorage when specified", () => {
        const { getGlobalState } = useStateManagement();
        const testData = { key: "value" };
        sessionStorageMock["testKey"] = JSON.stringify(testData);

        const result = getGlobalState("testKey", "sessionStorage");

        expect(result).toEqual(testData);
      });

      it("should return undefined for non-existent keys", () => {
        const { getGlobalState } = useStateManagement();

        const result = getGlobalState("nonExistentKey");

        expect(result).toBeUndefined();
      });

      it("should handle malformed JSON gracefully", () => {
        const { getGlobalState } = useStateManagement();
        localStorageMock["malformedKey"] = "invalid json {";

        expect(() => getGlobalState("malformedKey")).toThrow();
      });
    });

    describe("updateGlobalState", () => {
      it("should create new state when key doesn't exist", () => {
        const { updateGlobalState, getGlobalState } = useStateManagement();
        const testData = { key: "value" };

        updateGlobalState("newKey", testData);

        expect(getGlobalState("newKey")).toEqual(testData);
      });

      it("should merge with existing state", () => {
        const { setGlobalState, updateGlobalState, getGlobalState } =
          useStateManagement();
        const initialData = { a: 1, b: 2 };
        const updateData = { b: 3, c: 4 };

        setGlobalState("mergeKey", initialData);
        updateGlobalState("mergeKey", updateData);

        const result = getGlobalState("mergeKey");
        expect(result).toEqual({ a: 1, b: 3, c: 4 });
      });

      it("should work with sessionStorage", () => {
        const { updateGlobalState, getGlobalState } = useStateManagement();
        const testData = { key: "value" };

        updateGlobalState("sessionKey", testData, "sessionStorage");

        expect(getGlobalState("sessionKey", "sessionStorage")).toEqual(
          testData,
        );
      });
    });
  });

  describe("Route-Based State Management", () => {
    describe("setStateForRoute", () => {
      it("should handle undefined route gracefully", () => {
        const { setStateForRoute } = useStateManagement();
        const state = createMockBaseLibraryState();

        expect(() => setStateForRoute(undefined, state)).not.toThrow();
      });

      it("should store state for normal routes", () => {
        const { setStateForRoute, getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const state = createMockBaseLibraryState();

        setStateForRoute(route, state);

        const retrievedState = getStateForRoute(route);
        expect(retrievedState).toEqual(state);
      });

      it("should not store state for SingleEntity routes except UIPanelStateCollapsed", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/library/entity/123");
        const fullState = createMockBaseLibraryState();

        setStateForRoute(route, fullState);

        expect(sessionStorageMock[route.path]).toBeUndefined();
      });

      it("should store UIPanelStateCollapsed for SingleEntity routes", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/library/entity/123");
        const panelState = {
          UIPanelStateCollapsed: [{ key: "panel1", value: true }] as [
            { key: string; value: boolean },
          ],
        };

        setStateForRoute(route, panelState);

        const slicedPath = "/library";
        expect(sessionStorageMock[slicedPath]).toBe(JSON.stringify(panelState));
      });

      it("should not store state for SingleMediafile routes except UIPanelStateCollapsed", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute(
          "SingleMediafile",
          "/library/mediafile/456",
        );
        const fullState = createMockBaseLibraryState();

        setStateForRoute(route, fullState);

        expect(sessionStorageMock[route.path]).toBeUndefined();
      });

      it("should avoid unnecessary storage writes", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const state = createMockBaseLibraryState();

        setStateForRoute(route, state);
        const setItemCallCount = (window.sessionStorage.setItem as any).mock
          .calls.length;

        setStateForRoute(route, state);

        expect((window.sessionStorage.setItem as any).mock.calls.length).toBe(
          setItemCallCount,
        );
      });
    });

    describe("getStateForRoute", () => {
      it("should handle undefined route gracefully", () => {
        const { getStateForRoute } = useStateManagement();

        const result = getStateForRoute(undefined);

        expect(result).toBeUndefined();
      });

      it("should retrieve state for normal routes", () => {
        const { getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const state = createMockBaseLibraryState();
        sessionStorageMock[route.path] = JSON.stringify(state);

        const result = getStateForRoute(route);

        expect(result).toEqual(state);
      });

      it("should use sliced path for SingleEntity routes by default", () => {
        const { getStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/library/entity/123");
        const state = createMockBaseLibraryState();
        const slicedPath = "/library";
        sessionStorageMock[slicedPath] = JSON.stringify(state);

        const result = getStateForRoute(route);

        expect(result).toEqual(state);
      });

      it("should use full path for SingleEntity routes when useFullPath is true", () => {
        const { getStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/library/entity/123");
        const state = createMockBaseLibraryState();
        sessionStorageMock[route.path] = JSON.stringify(state);

        const result = getStateForRoute(route, true);

        expect(result).toEqual(state);
      });

      it("should return undefined for non-existent route state", () => {
        const { getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");

        const result = getStateForRoute(route);

        expect(result).toBeUndefined();
      });
    });

    describe("updateStateForRoute", () => {
      it("should handle undefined route gracefully", () => {
        const { updateStateForRoute } = useStateManagement();
        const state = createMockBaseLibraryState();

        expect(() => updateStateForRoute(undefined, state)).not.toThrow();
      });

      it("should create new state when route has no existing state", () => {
        const { updateStateForRoute, getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const state = createMockBaseLibraryState();

        updateStateForRoute(route, state);

        const result = getStateForRoute(route, true);
        expect(result).toEqual(state);
      });

      it("should merge with existing route state", () => {
        const { setStateForRoute, updateStateForRoute, getStateForRoute } =
          useStateManagement();
        const route = createMockRoute("Library", "/library");
        const initialState = { entityCountOnPage: 10, totalEntityCount: 100 };
        const updateState = {
          entityCountOnPage: 20,
          queryVariables: createMockQueryVariables({ limit: 20 }),
        };

        setStateForRoute(route, initialState);
        updateStateForRoute(route, updateState);

        const result = getStateForRoute(route, true);
        expect(result).toEqual({
          entityCountOnPage: 20,
          totalEntityCount: 100,
          queryVariables: createMockQueryVariables({ limit: 20 }),
        });
      });

      it("should preserve state structure during updates", () => {
        const { updateStateForRoute, getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const originalState = createMockBaseLibraryState();
        const updateState = { entityCountOnPage: 20 };

        sessionStorageMock[route.path] = JSON.stringify(originalState);

        updateStateForRoute(route, updateState);

        const result = getStateForRoute(route, true);
        expect(result).toBeDefined();
        expect(result!.filterListItems).toEqual(originalState.filterListItems);
        expect(result!.entityCountOnPage).toBe(20);
      });

      it("should use structured clone for state updates", () => {
        const { updateStateForRoute, getStateForRoute } = useStateManagement();
        const route = createMockRoute("Library", "/library");
        const updateState = {
          filterListItems: [
            {
              isActive: false,
              isDisplayed: false,
              advancedFilter: {} as AdvancedFilter,
              inputFromState: {} as AdvancedFilterInput,
              selectedMatcher: "exact",
            },
          ],
        };

        updateStateForRoute(route, updateState);

        updateState.filterListItems[0].isActive = true;

        const result = getStateForRoute(route, true);
        expect(result).toBeDefined();
        expect(result!.filterListItems?.[0]?.isActive).toBe(false);
      });
    });
  });

  describe("Route Path Handling", () => {
    describe("sliceSingleEntityRoutePath", () => {
      it("should slice paths correctly for SingleEntity routes", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/library/entity/123");
        const panelState = {
          UIPanelStateCollapsed: [{ key: "panel1", value: true }] as [
            { key: string; value: boolean },
          ],
        };

        setStateForRoute(route, panelState);

        const slicedPath = "/library";
        expect(sessionStorageMock[slicedPath]).toBe(JSON.stringify(panelState));
        expect(sessionStorageMock[route.path]).toBeUndefined();
      });

      it("should handle complex entity paths correctly", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute(
          "SingleEntity",
          "/collections/subCollection/entity/456/edit",
        );
        const panelState = {
          UIPanelStateCollapsed: [{ key: "panel1", value: true }] as [
            { key: string; value: boolean },
          ],
        };

        setStateForRoute(route, panelState);

        const slicedPath = "/collections";
        expect(sessionStorageMock[slicedPath]).toBe(JSON.stringify(panelState));
      });

      it("should handle root level entity paths", () => {
        const { setStateForRoute } = useStateManagement();
        const route = createMockRoute("SingleEntity", "/entity/789");
        const panelState = {
          UIPanelStateCollapsed: [{ key: "panel1", value: true }] as [
            { key: string; value: boolean },
          ],
        };

        setStateForRoute(route, panelState);

        const slicedPath = "/entity";
        expect(sessionStorageMock[slicedPath]).toBe(JSON.stringify(panelState));
      });
    });
  });

  describe("Data Integrity", () => {
    it("should perform deep equality checks for state changes", () => {
      const { setGlobalState } = useStateManagement();
      const complexData = {
        nested: {
          array: [1, 2, { deep: "value" }],
          object: { key: "value" },
        },
      };

      setGlobalState("deepTest", complexData);
      const initialCallCount = (window.localStorage.setItem as any).mock.calls
        .length;

      const identicalData = {
        nested: {
          array: [1, 2, { deep: "value" }],
          object: { key: "value" },
        },
      };
      setGlobalState("deepTest", identicalData);

      expect((window.localStorage.setItem as any).mock.calls.length).toBe(
        initialCallCount,
      );
    });

    it("should detect changes in complex nested structures", () => {
      const { setGlobalState } = useStateManagement();
      const initialData = {
        nested: {
          array: [1, 2, { deep: "value" }],
          object: { key: "value" },
        },
      };

      setGlobalState("changeTest", initialData);
      const initialCallCount = (window.localStorage.setItem as any).mock.calls
        .length;

      const changedData = {
        nested: {
          array: [1, 2, { deep: "changed" }],
          object: { key: "value" },
        },
      };
      setGlobalState("changeTest", changedData);

      expect((window.localStorage.setItem as any).mock.calls.length).toBe(
        initialCallCount + 1,
      );
    });

    it("should maintain type safety with StateObject interface", () => {
      const { setStateForRoute, getStateForRoute } = useStateManagement();
      const route = createMockRoute("Library", "/library");
      const typedState = createMockBaseLibraryState();

      setStateForRoute(route, typedState);
      const retrievedState = getStateForRoute(route);

      expect(retrievedState).toEqual(typedState);
      expect(Array.isArray(retrievedState?.filterListItems)).toBe(true);
      expect(typeof retrievedState?.entityCountOnPage).toBe("number");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null route objects gracefully", () => {
      const { setStateForRoute, getStateForRoute, updateStateForRoute } =
        useStateManagement();
      const state = createMockBaseLibraryState();

      expect(() => {
        setStateForRoute(null as any, state);
        getStateForRoute(null as any);
        updateStateForRoute(null as any, state);
      }).not.toThrow();
    });

    it("should handle malformed JSON in sessionStorage", () => {
      const { getStateForRoute } = useStateManagement();
      const route = createMockRoute("Library", "/library");
      sessionStorageMock[route.path] = "invalid json {";

      expect(() => getStateForRoute(route)).toThrow();
    });

    it("should handle empty state objects", () => {
      const { setStateForRoute, getStateForRoute } = useStateManagement();
      const route = createMockRoute("Library", "/library");
      const emptyState = {};

      setStateForRoute(route, emptyState);
      const result = getStateForRoute(route);

      expect(result).toEqual(emptyState);
    });

    it("should handle routes with special characters in paths", () => {
      const { setStateForRoute, getStateForRoute } = useStateManagement();
      const route = createMockRoute(
        "Library",
        "/library%20with%20spaces/entity",
      );
      const state = createMockBaseLibraryState();

      setStateForRoute(route, state);
      const result = getStateForRoute(route);

      expect(result).toEqual(state);
    });

    it("should handle very large state objects", () => {
      const { setGlobalState, getGlobalState } = useStateManagement();
      const largeState = {
        largeArray: new Array(1000)
          .fill(0)
          .map((_, i) => ({ id: i, data: `item_${i}` })),
        largeString: "x".repeat(10000),
      };

      setGlobalState("largeState", largeState);
      const result = getGlobalState("largeState");

      expect(result).toEqual(largeState);
    });

    it("should handle circular references gracefully", () => {
      const { setGlobalState } = useStateManagement();
      const circularObject: any = { a: 1 };
      circularObject.self = circularObject;

      expect(() => setGlobalState("circular", circularObject)).toThrow();
    });
  });

  describe("clearStorage", () => {
    it("should clear sessionStorage completely", () => {
      const { setStateForRoute, clearStorage, getStateForRoute } =
        useStateManagement();
      const route1 = createMockRoute("Library", "/library");
      const route2 = createMockRoute("Collections", "/collections");
      const state = createMockBaseLibraryState();

      setStateForRoute(route1, state);
      setStateForRoute(route2, state);

      clearStorage();

      expect(getStateForRoute(route1)).toBeUndefined();
      expect(getStateForRoute(route2)).toBeUndefined();
      expect(window.sessionStorage.clear).toHaveBeenCalled();
    });

    it("should not affect localStorage", () => {
      const { setGlobalState, getGlobalState, clearStorage } =
        useStateManagement();
      const testData = { key: "value" };

      setGlobalState("localTest", testData);
      clearStorage();

      expect(getGlobalState("localTest")).toEqual(testData);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex workflow with multiple operations", () => {
      const {
        setGlobalState,
        getGlobalState,
        setStateForRoute,
        getStateForRoute,
        updateStateForRoute,
        updateGlobalState,
      } = useStateManagement();

      const globalData = { appVersion: "1.0.0", theme: "dark" };
      setGlobalState("appConfig", globalData);

      const route = createMockRoute("Library", "/library");
      const initialRouteState = {
        entityCountOnPage: 10,
        totalEntityCount: 100,
      };
      setStateForRoute(route, initialRouteState);

      const routeUpdate = {
        queryVariables: createMockQueryVariables({ limit: 20, skip: 20 }),
      };
      updateStateForRoute(route, routeUpdate);

      const globalUpdate = { lastLogin: "2023-01-01" };
      updateGlobalState("appConfig", globalUpdate);

      const finalGlobalState = getGlobalState("appConfig");
      const finalRouteState = getStateForRoute(route, true);

      expect(finalGlobalState).toEqual({
        appVersion: "1.0.0",
        theme: "dark",
        lastLogin: "2023-01-01",
      });

      expect(finalRouteState).toEqual({
        entityCountOnPage: 10,
        totalEntityCount: 100,
        queryVariables: createMockQueryVariables({ limit: 20, skip: 20 }),
      });
    });

    it("should maintain state isolation between different storage types", () => {
      const { setGlobalState, getGlobalState } = useStateManagement();
      const localData = { type: "localStorage" };
      const sessionData = { type: "sessionStorage" };

      setGlobalState("sameKey", localData, "localStorage");
      setGlobalState("sameKey", sessionData, "sessionStorage");

      const localResult = getGlobalState("sameKey", "localStorage");
      const sessionResult = getGlobalState("sameKey", "sessionStorage");

      expect(localResult).toEqual(localData);
      expect(sessionResult).toEqual(sessionData);
      expect(localResult).not.toEqual(sessionResult);
    });
  });
});
