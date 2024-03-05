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
};

type StateObject = BaseLibraryState;

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
    if (route && route.name !== "SingleEntity") {
      const state = JSON.stringify(stateObject);
      if (window.sessionStorage.getItem(route.path) !== state)
        window.sessionStorage.setItem(route.path, state);
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
    if (route) {
      const state = window.sessionStorage.getItem(route.path);
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
