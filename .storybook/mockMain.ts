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
// Stand-in tenant config: pill colours are declared per client, so a story
// showing a configured pill needs a group to look its colours up in.
export const formattersSettings = {
  pill: {
    concept: { background: "#E8EEF0", text: "#003A52" },
    gepubliceerd: { background: "#DAF1DC", text: "#15803d" },
    vervallen: { background: "#FDEBD7", text: "#B95000" },
  },
};
export const typeUrlMapping = { mapping: {}, reverseMapping: {} };
export const i18n = undefined;
