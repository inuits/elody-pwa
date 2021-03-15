import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import Home from "../views/Home.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    meta: {
      title: "Asset Library",
    },
    component: Home,
  },
  {
    path: "/entity/:id",
    name: "SingleEntity",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/SingleEntity.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
