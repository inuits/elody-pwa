import { routerKey, type RouteRecordRaw } from "vue-router";
import History from "./History.vue";
import Mediafiles from "./MediaFiles.vue";
import { Collection } from "../queries";

export type urlParams = "id";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    meta: { title: "Home", type: Collection.Entities, requiresAuth: false },
    component: () => import(/* webpackChunkName: "about" */ "./Home.vue"),
    children: [
      {
        path: "entity/:id",
        name: "SingleEntity",
        meta: {
          title: "Single Asset",
          requiresAuth: false,
          showEntityTitle: true,
          type: Collection.Entities,
        },
        component: () =>
          import(/* webpackChunkName: "about" */ "./SingleEntity.vue"),
      },
    ],
  },
  {
    path: "/mediafiles",
    name: "Mediafiles",
    meta: {
      title: "Mediafiles",
      type: Collection.Mediafiles,
      requiresAuth: true,
    },
    component: Mediafiles,
    children: [
      {
        path: ":id",
        name: "SingleMediafile",
        meta: {
          title: "Single Mediafile",
          requiresAuth: true,
          showEntityTitle: true,
          type: Collection.Mediafiles,
        },
        component: () =>
          import(/* webpackChunkName: "about" */ "./SingleMediaFile.vue"),
      },
    ],
  },
  {
    path: "/history",
    name: "History",
    meta: { title: "History", requiresAuth: true },
    component: History,
  },
];
