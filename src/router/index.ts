import { Ref, watch, WatchStopHandle } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import AssetLibrary from '@/views/AssetLibrary.vue';
import { OpenIdConnectPlugin } from '@/OpenIdConnectPlugin';

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
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
      component: () => import(/* webpackChunkName: "about" */ '../views/SingleEntity.vue'),
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  if (!to.matched.some((route) => route.meta.requiresAuth)) {
    return next();
  }
  const auth = OpenIdConnectPlugin.instance;
  while (true) {
    await waitTillFalse(auth.loading);
    if (auth.isAuthenticated.value) {
      return next();
    }
    auth?.login();
  }
});

async function waitTillFalse(x: Ref<unknown>): Promise<void> {
  return new Promise((resolve, _reject) => {
    if (!x.value) {
      return resolve();
    }
    /* eslint-disable prefer-const */
    let stopWatch: WatchStopHandle;
    stopWatch = watch(x, (loading) => {
      if (!loading) {
        stopWatch();
        resolve();
      }
    });
  });
}
