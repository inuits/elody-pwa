// Stand-in for src/main.ts inside Storybook.
//
// Components import the live Apollo client, router and auth session from
// "@/main"; importing the real module would boot the whole application
// (OIDC redirect, app config fetch) as a side effect of rendering a story.
// The alias in .storybook/vite.config.ts points at this file instead.
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createRouter, createWebHistory } from "vue-router";

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
});

export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
});

export const auth = {
  isAuthenticated: { value: true },
  user: { value: { name: "Storybook" } },
  logout: () => undefined,
  redirectToLogin: () => undefined,
};

export const bulkSelectAllSizeLimit = 999999;
export const formattersSettings = {};
export const typeUrlMapping = { mapping: {}, reverseMapping: {} };
export const i18n = undefined;
