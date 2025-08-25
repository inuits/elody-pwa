import type { RouteLocationNormalizedLoaded } from "vue-router";
import type {
  AdvancedFilter,
  AdvancedFilterInput,
  GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import type { SavedSearchType } from "@/composables/useSaveSearchHepler";

export type FilterListItem = {
  isActive: boolean;
  isDisplayed: boolean;
  advancedFilter: AdvancedFilter;
  inputFromState: AdvancedFilterInput | undefined;
  selectedMatcher: string | undefined;
};

type BaseLibraryState = {
  entityCountOnPage?: number;
  totalEntityCount?: number;
  queryVariables?: GetEntitiesQueryVariables;
  filterListItems?: FilterListItem[];
  lastUsedFilters?: SavedSearchType[];
  lastUsedFilter?: SavedSearchType;
  UIPanelStateCollapsed?: [{ key: string; value: boolean }];
};

type StateObject = BaseLibraryState;

const sliceSingleEntityRoutePath = (path): string => {
  return path.slice(0, path.indexOf("/", 1));
};

export const useStateManagement = () => {
  const setGlobalState = (
    key: string,
    value: object,
    storageType: "localStorage" | "sessionStorage" = "localStorage",
  ) => {
    const state = JSON.stringify(value);
    if (storageType === "localStorage") {
      if (window.localStorage.getItem(key) !== state)
        window.localStorage.setItem(key, state);
    }
    if (storageType === "sessionStorage") {
      if (window.sessionStorage.getItem(key) !== state)
        window.sessionStorage.setItem(key, state);
    }
  };

  const updateGlobalState = (
    key: string,
    value: object,
    storageType: "localStorage" | "sessionStorage" = "localStorage",
  ) => {
    const state = getGlobalState(key, storageType);
    if (!state) setGlobalState(key, value, storageType);
    else setGlobalState(key, Object.assign(state, value), storageType);
  };

  const getGlobalState = (
    key: string,
    storageType: "localStorage" | "sessionStorage" = "localStorage",
  ) => {
    if (storageType === "localStorage") {
      const state = window.localStorage.getItem(key);
      if (state) return JSON.parse(state);
      return undefined;
    }
    if (storageType === "sessionStorage") {
      const state = window.sessionStorage.getItem(key);
      if (state) return JSON.parse(state);
      return undefined;
    }
  };

  const setStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined,
    stateObject: StateObject,
  ) => {
    if (!route) return;
    if (route.name !== "SingleEntity" && route.name !== "SingleMediafile") {
      const state = JSON.stringify(stateObject);
      if (window.sessionStorage.getItem(route.path) !== state)
        window.sessionStorage.setItem(route.path, state);
    } else if (
      Object.keys(stateObject).length === 1 &&
      Object.keys(stateObject)[0] === "UIPanelStateCollapsed"
    ) {
      const path = sliceSingleEntityRoutePath(route.path);
      window.sessionStorage.setItem(path, JSON.stringify(stateObject));
    }
  };

  const updateStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined,
    stateObject: StateObject,
  ) => {
    if (!route) return;
    const state = getStateForRoute(route, true);
    const copyOfState = structuredClone(stateObject);
    if (!state) setStateForRoute(route, copyOfState);
    else setStateForRoute(route, Object.assign(state, copyOfState));
  };

  const getStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined,
    useFullPath: boolean = false,
  ): StateObject | undefined => {
    if (!route) return;
    if (route.name !== "SingleEntity") {
      const state = window.sessionStorage.getItem(route.path);
      if (state) return JSON.parse(state);
    } else {
      const path = useFullPath
        ? route.path
        : sliceSingleEntityRoutePath(route.path);
      const state = window.sessionStorage.getItem(path);
      if (state) return JSON.parse(state);
    }
    return undefined;
  };

  const clearStorage = () => {
    window.sessionStorage.clear();
  };

  return {
    getGlobalState,
    getStateForRoute,
    setGlobalState,
    setStateForRoute,
    updateGlobalState,
    updateStateForRoute,
    clearStorage,
  };
};
