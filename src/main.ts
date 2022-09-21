import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  ServerError,
} from '@apollo/client/core';
import { createUploadLink } from 'apollo-upload-client';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import Unicon from 'vue-unicons';
import { DefaultApolloClient } from '@vue/apollo-composable';

import { OpenIdConnectClient } from 'session-vue-3-oidc-library';
import App from './App.vue';
import { routes } from './views';
import { store } from './store';
import { Unicons } from './types';
import i18n from './helpers';

import { createHead } from '@vueuse/head';

import './registerServiceWorker';
import './index.css';
import { environment as _ } from './environment';

import { onError } from '@apollo/client/link/error';
import useGraphqlErrors from './composables/useGraphqlErrors';

import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

/*
import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Sentry.init({
  dsn: 'https://00370fd19c5a47a8b2afd25fef8f3fa0@sentry.inuits.io/100',
  integrations: [new Integrations.Vue({ Vue, attachProps: true })],
});
*/

Unicon.add(Object.values(Unicons));

const config = await fetch(
  process.env.VUE_APP_CONFIG_URL ? process.env.VUE_APP_CONFIG_URL : '/api/config',
).then((r) => r.json());
let auth: typeof OpenIdConnectClient | null;
auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));
console.log(`session-vue-3-oidc-library: v0.1.7`);

const head = createHead();

const router = createRouter({
  routes,
  history: createWebHistory(process.env.BASE_URL),
});

const authCode = new URLSearchParams(window.location.search).get('code');
auth.authCode = authCode;

const graphqlErrorInterceptor = onError((error: any) => {
  const errorHandler = useGraphqlErrors(error);
  errorHandler.logFormattedErrors();
  if (errorHandler.checkForDuplicateFileUpload() === true) {
    new Promise(async (resolve) => {
      resolve;
    });
  }

  if (errorHandler.checkForUnauthorized() === true) {
    new Promise(async (resolve, reject) => {
      await fetch('/api/logout');
      auth.resetAuthProperties();
      auth.redirectToLogin(router.currentRoute?.value.fullPath);
      resolve;
    });
  }
});

if (_.auth) {
  router.beforeEach(async (to, _from, next) => {
    await auth.verifyServerAuth();
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
      return next();
    }
    await auth.assertIsAuthenticated(to.fullPath, next);
  });
}

if (authCode) {
  auth.processAuthCode(authCode, router);
}

const app = createApp(App)
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
      link: graphqlErrorInterceptor.concat(
        //@ts-ignore
        createUploadLink({ uri: config.graphQlLink || '/api/graphql' }),
      ),
      cache: new InMemoryCache(),
    }),
  );

Sentry.init({
  app,
  sendClientReports: false,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: ['*']
    }),
  ],
  debug: true,
  dsn: 'https://00370fd19c5a47a8b2afd25fef8f3fa0@sentry.inuits.io/100',
});

app.mount('#app');
