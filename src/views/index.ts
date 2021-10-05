import { RouteRecordRaw } from 'vue-router';
import AssetLibrary from './AssetLibrary.vue';
import History from "./History.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "AssetLibrary",
    meta: { title: "Asset Library", requiresAuth: true },
    component: AssetLibrary,
  },
  {
    path: "/entity/:id",
    name: "SingleEntity",
    meta: { title: "Single Asset", requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "about" */ "./SingleEntity.vue"),
  },
  {
    path: "/history",
    name: "History",
    meta: { title: "History", requiresAuth: true },
    component: History,
  },
];
