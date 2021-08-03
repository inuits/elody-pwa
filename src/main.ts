import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
import { createApp } from 'vue';
import Unicon from 'vue-unicons';
import { DefaultApolloClient } from '@vue/apollo-composable';

import App from './App.vue';
import { router } from './router';
import { store } from './store';
import { Unicons } from './types';
import { OpenIdConnectPlugin } from '@/OpenIdConnectPlugin';

import './registerServiceWorker';
import './index.css';

Unicon.add(Object.values(Unicons));

const config = await fetch('../config.json').then((r) => r.json());

createApp(App)
  .use(Unicon)
  .use(store)
  .use(router)
  .use(OpenIdConnectPlugin.build(router, config.oidc))
  .provide(
    DefaultApolloClient,
    new ApolloClient({
      link: createHttpLink({ uri: config.graphQlLink }),
      cache: new InMemoryCache(),
    }),
  )
  .mount('#app');
