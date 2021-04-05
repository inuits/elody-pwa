import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AssetLibrary from '../views/AssetLibrary.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'AssestLibrary',
    meta: {
      title: 'Asset Library'
    },
    component: AssetLibrary
  },
  {
    path: '/entity/:id',
    name: 'SingleEntity',
    meta: {
      title: 'Single Asset'
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/SingleEntity.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
