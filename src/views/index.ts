import { RouteRecordRaw } from 'vue-router';
import AssetLibrary from './AssetLibrary.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'AssetLibrary',
    meta: { title: 'Asset Library', requiresAuth: true },
    component: AssetLibrary,
  },
  {
    path: '/entity/:id',
    name: 'SingleEntity',
    meta: { title: 'Single Asset', requiresAuth: true },
    component: () => import(/* webpackChunkName: "about" */ './SingleEntity.vue'),
  },
];
