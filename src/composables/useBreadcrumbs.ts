import { computed, ref, watch, inject } from "vue";
import { useRouter } from "vue-router";
import { useMenuHelper } from "@/composables/useMenuHelper";
import type { DamsIcons } from "@/generated-types/queries";

export type VisitedRoute = {
  id: string;
  routeName: string;
  icon?: DamsIcons;
};

const currentRouteTitle = ref<string>("");
const visitedRoutes = ref<VisitedRoute[]>([]);

export const useBreadcrumbs = (config: any) => {
  const { selectedMenuItem } = useMenuHelper();
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
    document.title = `${config.customization.applicationTitle} | ${title}`;
  };

  const addVisitedRoute = (route: VisitedRoute): void => {
    const visited: boolean = visitedIds.value.includes(route.id);
    if (visited) resetVisitedRoutes();
    visitedRoutes.value.push(route);
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
        visitedRoutes.value.unshift(parentView);
      }
    }
  );

  useRouter().afterEach((to) => {
    setCurrentRouteTitle(to.meta.title as string);
    if (to.name === "Home") {
      resetVisitedRoutes();
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
