import { computed, ref, watch, inject } from "vue";
import { useRouter } from "vue-router";
import { useMenuHelper } from "@/composables/useMenuHelper";
import type { DamsIcons } from "@/generated-types/queries";

export type VisitedRoute = {
  id: string;
  routeName: string;
  icon?: DamsIcons;
  path?: string;
};

const currentRouteTitle = ref<string>("");
const visitedRoutes = ref<VisitedRoute[]>([]);

export const useBreadcrumbs = (config: any, t: any) => {
  const { selectedMenuItem, selectedMenuItemPath, getMenuDestinations } =
    useMenuHelper();
  const previousRoute = computed<VisitedRoute | undefined>(() =>
    visitedRoutes.value.length == 2
      ? visitedRoutes.value[0]
      : visitedRoutes.value[visitedRoutes.value.length - 2]
  );
  const visitedIds = computed(() =>
    visitedRoutes.value.map((route: VisitedRoute) => route.id)
  );

  const setCurrentRouteTitle = (title: string): void => {
    currentRouteTitle.value = title;
    document.title = `${config.customization.applicationTitle} | ${t(title)}`;
  };

  const addVisitedRoute = (route: VisitedRoute): void => {
    const visited: boolean = visitedIds.value.includes(route.id);
    if (visited) {
      removeVisitedRoutesUntilReachedCurrentRoute(route);
      return;
    }
    visitedRoutes.value.push(route);
  };

  const removeVisitedRoutesUntilReachedCurrentRoute = (
    route: VisitedRoute
  ): void => {
    let counter = visitedRoutes.value.length - 1;
    do {
      if (route.id === visitedRoutes.value[counter].id) break;
      visitedRoutes.value.pop();
      counter--;
    } while (counter >= 0);
  };

  const resetVisitedRoutes = (): void => {
    visitedRoutes.value = [];
  };

  watch(
    () => visitedRoutes.value.length,
    () => {
      const parentView: VisitedRoute = {
        id: "",
        routeName: selectedMenuItem.value?.label as string,
        icon: selectedMenuItem.value?.icon as unknown as DamsIcons,
      };
      if (
        visitedRoutes.value.length === 1 &&
        !visitedRoutes.value.includes(parentView)
      ) {
        if (selectedMenuItemPath.value)
          parentView.path = selectedMenuItemPath.value;
        visitedRoutes.value.unshift(parentView);
      }
    }
  );

  useRouter().afterEach((to) => {
    setCurrentRouteTitle(to.meta.title as string);
    if (to.meta.entityType === "manifest")
      setCurrentRouteTitle("navigation.entities");
    if (to.name === "Home") resetVisitedRoutes();
  });

  useRouter().beforeEach((to, from) => {
    let route: VisitedRoute = {
      id: "",
      routeName: from.meta.title,
      path: from.path,
    };
    if (visitedRoutes.value.length === 0) {
      addVisitedRoute(route);
      return;
    }
    const valueToMatch = to.path.slice(1);
    const destinations = getMenuDestinations().value;
    route = {
      id: "",
      routeName: to.meta.title,
      path: to.path,
    };
    if (destinations.includes(valueToMatch)) {
      resetVisitedRoutes();
      addVisitedRoute(route);
    }
  });

  return {
    currentRouteTitle,
    setCurrentRouteTitle,
    resetVisitedRoutes,
    addVisitedRoute,
    visitedRoutes,
    previousRoute,
  };
};
