import { ref } from "vue";
import { useRouter } from "vue-router";

export type VisitedRoute = {
  id: string;
  routeName: string;
};

const currentRouteTitle = ref<string>("");
const visitedRoutes = ref<VisitedRoute[]>([]);

export const useBreadcrumbs = () => {
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

  useRouter().afterEach((to) => {
    currentRouteTitle.value = to.meta.title as string;
    if (to.name === "Home") resetVisitedRoutes();
  });

  return {
    currentRouteTitle,
    setCurrentRouteTitle,
    resetVisitedRoutes,
    addVisitedRoute,
    visitedRoutes,
  };
};
