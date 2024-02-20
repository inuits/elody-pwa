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
  entityCountOnPage: number;
  queryVariables: GetEntitiesQueryVariables;
  filterListItems: FilterListItem[];
};

type StateObject = BaseLibraryState;

export const useStateManagement = () => {
  const setGlobalState = (key: string, value: object) => {
    const state = JSON.stringify(value);
    if (window.localStorage.getItem(key) !== state)
      window.localStorage.setItem(key, state);
  };

  const updateGlobalState = (key: string, value: object) => {
    const state = value;
    const currentState = JSON.parse(window.localStorage.getItem(key));
    if (!currentState) {
      window.localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    const updatedState = JSON.stringify(Object.assign(currentState, state));
    window.localStorage.setItem(key, updatedState);
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
      if (window.localStorage.getItem(route.path) !== state)
        window.localStorage.setItem(route.path, state);
    }
  };

  const getStateForRoute = (
    route: RouteLocationNormalizedLoaded | undefined
  ): StateObject | undefined => {
    if (route) {
      const state = window.localStorage.getItem(route.path);
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
  };
};
