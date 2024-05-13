import type { RouteLocationNormalizedLoaded } from "vue-router";
import type {
  AdvancedFilter,
  AdvancedFilterInput,
  DropdownOption,
  GetEntitiesQueryVariables,
} from "@/generated-types/queries";

export type FilterListItem = {
  isActive: boolean;
  isDisplayed: boolean;
  advancedFilter: AdvancedFilter;
  inputFromState: AdvancedFilterInput | undefined;
  selectedMatcher: DropdownOption | undefined;
};

type BaseLibraryState = {
  entityCountOnPage?: number;
  totalEntityCount?: number;
  queryVariables?: GetEntitiesQueryVariables;
  filterListItems?: FilterListItem[];
  UIPanelStateCollapsed?: [ { key: string, value: boolean } ];
};

type StateObject = BaseLibraryState;

const sliceSingleEntityRoutePath = (path): string => {
  return path.slice(0, path.indexOf("/", 1));
}

export const useStateManagement = () => {
  const setGlobalState = (key: string, value: object) => {
    const state = JSON.stringify(value);
    if (window.localStorage.getItem(key) !== state)
      window.localStorage.setItem(key, state);
  };

  const updateGlobalState = (key: string, value: object) => {
    const state = getGlobalState(key);
    if (!state) setGlobalState(key, value);
    else setGlobalState(key, Object.assign(state, value));
  };

  const getGlobalState = (key: string) => {
    const state = window.localStorage.getItem(key);
    if (state) return JSON.parse(state);
    return undefined;
  };

  const setStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined,
    stateObject: StateObject
  ) => {
    if (!route) return;
    if (route.name !== "SingleEntity") {
      const state = JSON.stringify(stateObject);
      if (window.sessionStorage.getItem(route.path) !== state)
        window.sessionStorage.setItem(route.path, state);
    }
    else if (Object.keys(stateObject).length === 1 && Object.keys(stateObject)[0] === "UIPanelStateCollapsed") {
      const path = sliceSingleEntityRoutePath(route.path);
      window.sessionStorage.setItem(path, JSON.stringify(stateObject));
    }
  };

  const updateStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined,
    stateObject: StateObject
  ) => {
    const state = getStateForRoute(route);
    if (!state) setStateForRoute(route, stateObject);
    else setStateForRoute(route, Object.assign(state, stateObject));
  };

  const getStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined
  ): StateObject | undefined => {
    if (!route) return;
    if (route.name !== "SingleEntity") {
      const state = window.sessionStorage.getItem(route.path);
      if (state) return JSON.parse(state);
    }
    else {
      const state = window.sessionStorage.getItem(sliceSingleEntityRoutePath(route.path));
      if (state) return JSON.parse(state);
    }
    return undefined;
  };

  return {
    getGlobalState,
    getStateForRoute,
    setGlobalState,
    setStateForRoute,
    updateGlobalState,
    updateStateForRoute,
  };
};
