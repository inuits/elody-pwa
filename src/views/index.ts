import { RouteRecordRaw } from 'vue-router';
import History from './History.vue';

export type urlParams = 'id';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    meta: { title: 'Home', requiresAuth: true },
    component: () => import(/* webpackChunkName: "about" */ './Home.vue'),
    children: [
      {
        path: 'entity/:id',
        name: 'SingleEntity',
        meta: { title: 'Single Asset', requiresAuth: true },
        component: () => import(/* webpackChunkName: "about" */ './SingleEntity.vue'),
      },
    ],
  },
  {
    path: '/history',
    name: 'History',
    meta: { title: 'History', requiresAuth: true },
    component: History,
  },
];
