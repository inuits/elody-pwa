import { defineAsyncComponent } from "vue";
import type { RouteRecordRaw } from "vue-router";
// import Home from "@/views/Home.vue";
// import HomeWrapper from "@/views/HomeWrapper.vue";
// import ManifestViewer from "@/components/ManifestViewer.vue";
// import SingleEntity from "@/views/SingleEntity.vue";
// import NotFound from "@/views/errorViews/NotFound.vue";
// import AccessDenied from "@/views/errorViews/AccessDenied.vue";
// import Unauthorized from "@/views/errorViews/Unauthorized.vue";

export type urlParams = "id";

type RouteComponentConfig = {
  routeName: string;
  routeComponent: () => Promise<typeof import("*.vue")>;
};

const routeComponentConfig: RouteComponentConfig[] = [
  { routeName: "Home", routeComponent: () => import("@/views/Home.vue") },
  {
    routeName: "HomeWrapper",
    routeComponent: () => import("@/views/HomeWrapper.vue"),
  },
  {
    routeName: "SingleEntity",
    routeComponent: () => import("@/views/SingleEntity.vue"),
  },
  {
    routeName: "Manifest",
    routeComponent: () => import("@/components/ManifestViewer.vue"),
  },
  {
    routeName: "Unauthorized",
    routeComponent: () => import("@/views/errorViews/Unauthorized.vue"),
  },
  {
    routeName: "AccessDenied",
    routeComponent: () => import("@/views/errorViews/AccessDenied.vue"),
  },
  {
    routeName: "NotFound",
    routeComponent: () => import("@/views/errorViews/NotFound.vue"),
  },
];

const getComponentForRoute = (route: RouteRecordRaw): any => {
  const routeName = route.component;
  if (!routeName) {
    return;
  }
  const config = routeComponentConfig.find(
    (configItem) => configItem.routeName === routeName?.toString(),
  );
  if (!config) {
    throw Error(
      `Could not find config item for route with name ${routeName?.toString()}`,
    );
  }
  return defineAsyncComponent(config.routeComponent);
};

export const addComponentToRoutes = (
  routeConfig: RouteRecordRaw[],
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
