import type { RouteRecordRaw } from "vue-router";
import History from "./History.vue";
import Home from "./Home.vue";
import Mediafiles from "./MediaFiles.vue";
import SingleEntity from "./SingleEntity.vue";
import ManifestViewer from "@/components/ManifestViewer.vue";

export type urlParams = "id";

type RouteComponentConfig = {
  routeName: string;
  routeComponent: any;
};

const routeComponentConfig: RouteComponentConfig[] = [
  { routeName: "Home", routeComponent: Home },
  { routeName: "SingleEntity", routeComponent: SingleEntity },
  { routeName: "Mediafiles", routeComponent: Mediafiles },
  { routeName: "SingleMediafile", routeComponent: SingleEntity },
  { routeName: "History", routeComponent: History },
  { routeName: "Mirador", routeComponent: ManifestViewer },
];

const getComponentForRoute = (route: RouteRecordRaw): any => {
  const routeName = route.name;
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
