// Stand-in for src/main.ts inside Storybook.
//
// Components import the live Apollo client, router and auth session from
// "@/main"; importing the real module would boot the whole application
// (OIDC redirect, app config fetch) as a side effect of rendering a story.
// The alias in .storybook/vite.config.ts points at this file instead.
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createRouter, createWebHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import { designSystemMessages } from "@/i18n/designSystemMessages";

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

// helpers.ts reaches for `i18n.global.t` outside a component, so this has to
// be a real instance rather than a placeholder. preview.ts installs this same
// one on the app, so a story and a helper translate through one catalogue.
//
// Stories render component chrome, not translated product copy: an unknown key
// renders as itself so a story never depends on the translation service. The
// catalogue is the shared design-system copy the app also uses as fallback
// (src/i18n/designSystemMessages.ts) — one source, no drift.
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "nl",
  fallbackLocale: "en",
  messages: designSystemMessages,
  missingWarn: false,
  fallbackWarn: false,
  missing: (_locale, key) => key,
});
