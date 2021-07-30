import { authGuard } from './AuthGuard';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AssetLibrary from '../views/AssetLibrary.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'AssetLibrary',
    beforeEnter: authGuard,
    meta: { title: 'Asset Library' },
    component: AssetLibrary,
  },
  {
    path: '/entity/:id',
    name: 'SingleEntity',
    beforeEnter: authGuard,
    meta: { title: 'Single Asset' },
    component: () => import(/* webpackChunkName: "about" */ '../views/SingleEntity.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
