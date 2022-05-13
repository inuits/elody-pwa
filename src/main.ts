import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache, ServerError } from '@apollo/client/core';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import Unicon from 'vue-unicons';
import { DefaultApolloClient } from '@vue/apollo-composable';

import { OpenIdConnectClient } from 'session-vue-3-oidc-library';
import App from './App.vue';
import { routes } from './views';
import { store } from './store';
import { Unicons } from './types';
import { i18n } from './helpers';

import { createHead } from '@vueuse/head';

import './registerServiceWorker';
import './index.css';
import { environment as _ } from './environment';

import { onError } from '@apollo/client/link/error';

Unicon.add(Object.values(Unicons));

const config = await fetch(
  process.env.VUE_APP_CONFIG_URL ? process.env.VUE_APP_CONFIG_URL : '../config.json',
).then((r) => r.json());
let auth: typeof OpenIdConnectClient | null;
auth != null ? auth : auth = new OpenIdConnectClient(config.oidc);

const head = createHead();

const router = createRouter({
  routes,
  history: createWebHistory(process.env.BASE_URL),
});

const graphqlErrorInterceptor = onError((error) => {
  console.log({ error });

  // FIXME: express sends response.status(401)
  if (error.networkError) {
    const network = error.networkError as ServerError;
    console.log('auth before login auth', auth);
    if (network && network.statusCode === 401 || network.statusCode === 400 && auth != null) {
      console.log('Catched network error with statuscode 401 Unauthorized');
      auth.redirectToLogin('/');
    }
  };

  // FIXME: express does not send response.status(401). response from call is 401
  if (error.response?.errors && error.response?.errors[0]) {
    console.log('STATUS', error.response?.errors[0].extensions!.response.status);
    fetch('/api/logout')
      .then(async (response) => {
        console.log(`STEP 1 | WEB LOGOUT | status response `, response.status);
        router.push('/');
        console.log(`STEP 1 | WEB LOGOUT | going back to home page /`);
        window.location.reload();

      })
      .catch((error) => console.log(`WEB | Couldn't logout`, error));
  }
});

if (_.auth) {
  router.beforeEach(async (to, _from, next) => {
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
      return next();
    }
    await auth.assertIsAuthenticated(to.fullPath, next);
  });
}

const authCode = new URLSearchParams(window.location.search).get('code');
if (authCode) {
  auth.processAuthCode(authCode, router);
}

createApp(App)
  .use(Unicon, {
    fill: 'currentColor',
  })
  .use(store)
  .use(router)
  .use(auth)
  .use(i18n)
  .use(head)
  .provide('config', config)
  .provide(
    DefaultApolloClient,
    new ApolloClient({
      link: graphqlErrorInterceptor.concat(createHttpLink({ uri: config.graphQlLink || '/api/graphql' })),
      cache: new InMemoryCache(),
    }),
  )
  .mount('#app');
