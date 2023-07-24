import { computed, ref, watch } from "vue";
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

export const useBreadcrumbs = () => {
  const { selectedMenuItem } = useMenuHelper();
  const previousRoute = computed<VisitedRoute | undefined>(() =>
    visitedRoutes.value.length == 2
      ? visitedRoutes.value[0]
      : visitedRoutes.value[visitedRoutes.value.length - 2]
  );

  const setCurrentRouteTitle = (title: string): void => {
    currentRouteTitle.value = title;
  };

  const addVisitedRoute = (route: VisitedRoute): void => {
    if (!visitedRoutes.value.includes(route)) {
      visitedRoutes.value.push(route);
    }
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
    currentRouteTitle.value = to.meta.title as string;
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
