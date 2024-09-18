import type { Router, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import HomeWrapper from "@/views/HomeWrapper.vue";
import ManifestViewer from "@/components/ManifestViewer.vue";
import SingleEntity from "@/views/SingleEntity.vue";
import NotFound from "@/views/errorViews/NotFound.vue";
import AccessDenied from "@/views/errorViews/AccessDenied.vue";
import Unauthorized from "@/views/errorViews/Unauthorized.vue";
import { auth } from "@/main";

export type urlParams = "id";

type RouteComponentConfig = {
  routeName: string;
  routeComponent: any;
};

const routeComponentConfig: RouteComponentConfig[] = [
  { routeName: "Home", routeComponent: Home },
  { routeName: "HomeWrapper", routeComponent: HomeWrapper },
  { routeName: "SingleEntity", routeComponent: SingleEntity },
  { routeName: "Manifest", routeComponent: ManifestViewer },
  { routeName: "Unauthorized", routeComponent: Unauthorized },
  { routeName: "AccessDenied", routeComponent: AccessDenied },
  { routeName: "NotFound", routeComponent: NotFound },
];

const getComponentForRoute = (route: RouteRecordRaw): any => {
  const routeName = route.component;
  if (!routeName) {
    return;
  }
  const config = routeComponentConfig.find(
    (configItem) => configItem.routeName === routeName?.toString()
  );
  if (!config) {
    throw Error(
      `Could not find config item for route with name ${routeName?.toString()}`
    );
  }
  return config.routeComponent;
};

export const addComponentToRoutes = (
  routeConfig: RouteRecordRaw[]
): RouteRecordRaw[] => {
  const router: RouteRecordRaw[] = [];
  routeConfig.forEach((route: RouteRecordRaw) => {
    route.component = getComponentForRoute(route);
    if (route.children) {
      route.children.forEach((childRoute: RouteRecordRaw) => {
        childRoute.component = getComponentForRoute(childRoute);
      });
    }
    router.push(route);
  });
  return router;
};

export const handleRequiredAuthenticationForRoutes = (router: Router) => {
  router.afterEach(() => {
    if (
      router.currentRoute.value.meta.requiresAuth &&
      !auth.isAuthenticated.value
    )
      router.push("/unauthorized");
  });
};
