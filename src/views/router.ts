import { routerKey, type RouteRecordRaw } from "vue-router";
import History from "./History.vue";
import Home from "./Home.vue";
import Mediafiles from "./MediaFiles.vue";
import SingleEntity from "./SingleEntity.vue";
import { Collection } from "../generated-types/queries";
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

// export const routes: RouteRecordRaw[] = [
//   {
//     path: "/",
//     name: "Home",
//     meta: { title: "Home", type: Collection.Entities, requiresAuth: false },
//     component: () => import(/* webpackChunkName: "about" */ "./Home.vue"),
//     children: [
//       {
//         path: "entity/:id",
//         name: "SingleEntity",
//         meta: {
//           title: "Single Asset",
//           requiresAuth: false,
//           showEntityTitle: true,
//           type: Collection.Entities,
//         },
//         component: () =>
//           import(/* webpackChunkName: "about" */ "./SingleEntity.vue"),
//       },
//     ],
//   },
//   {
//     path: "/mediafiles",
//     name: "Mediafiles",
//     meta: {
//       title: "Mediafiles",
//       type: Collection.Mediafiles,
//       requiresAuth: true,
//     },
//     component: Mediafiles,
//     children: [
//       {
//         path: ":id",
//         name: "SingleMediafile",
//         meta: {
//           title: "Single Mediafile",
//           requiresAuth: true,
//           showEntityTitle: true,
//           type: Collection.Mediafiles,
//         },
//         component: () =>
//           import(/* webpackChunkName: "about" */ "./SingleMediaFile.vue"),
//       },
//     ],
//   },
//   {
//     path: "/mirador",
//     name: "Mirador",
//     meta: { title: "Mirador", requiresAuth: false },
//     component: ManifestViewer,
//   },
//   {
//     path: "/history",
//     name: "History",
//     meta: { title: "History", requiresAuth: true },
//     component: History,
//   },
//   { path: "/home", redirect: "/" },
// ];
