import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
// Registering instrumentations
registerInstrumentations({
  instrumentations: [
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation({
      // propagateTraceHeaderCorsUrls: [
      //     /.+/g, //Regex to match your backend urls. This should be updated.
      // ]
    }),
    new FetchInstrumentation()
  ],
});

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
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

import init from './otel/tracer';

const serviceName = 'Dams frontend';
const { provider } = init(serviceName, BatchSpanProcessor);

Unicon.add(Object.values(Unicons));

const config = await fetch(
  process.env.VUE_APP_CONFIG_URL ? process.env.VUE_APP_CONFIG_URL : '../config.json',
).then((r) => r.json());
const auth = new OpenIdConnectClient(config.oidc);
const head = createHead();

const router = createRouter({
  routes,
  history: createWebHistory(process.env.BASE_URL),
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
      link: createHttpLink({ uri: config.graphQlLink || '/api/graphql' }),
      cache: new InMemoryCache(),
    }),
  )
  .mount('#app');
