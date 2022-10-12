import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createUploadLink } from "apollo-upload-client";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import Unicon from "vue-unicons";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import App from "./App.vue";
import { routes } from "./views";
import { store } from "./store";
import { Unicons } from "./types";
import { i18n } from "./helpers";
import { createHead } from "@vueuse/head";

import "./assets/base.css";

import { onError } from "@apollo/client/link/error";
import useGraphqlErrors from "./composables/useGraphqlErrors";

import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

const start = async () => {
  Unicon.add(Object.values(Unicons));

  const config = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/config"
  ).then((r) => r.json());
  let auth: typeof OpenIdConnectClient | null;
  auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));
  console.log(`session-vue-3-oidc-library: v0.1.7`);

  const head = createHead();

  const router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL),
  });

  const authCode = new URLSearchParams(window.location.search).get("code");
  auth.authCode = authCode;

  const graphqlErrorInterceptor = onError((error: any) => {
    const errorHandler = useGraphqlErrors(error);
    errorHandler.logFormattedErrors();
    if (errorHandler.checkForDuplicateFileUpload() === true) {
      new Promise((resolve) => {
        resolve;
      });
    }

    if (errorHandler.checkForUnauthorized() === true) {
      new Promise((resolve) => {
        fetch("/api/logout").then(() => {
          auth.resetAuthProperties();
          auth.redirectToLogin(router.currentRoute?.value.fullPath);
          resolve;
        });
      });
    }
  });

  router.beforeEach(async (to, _from, next) => {
    await auth.verifyServerAuth();
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
      return next();
    }
    await auth.assertIsAuthenticated(to.fullPath, next);
  });

  if (authCode) {
    auth.processAuthCode(authCode, router);
  }

  const app = createApp(App)
    .use(i18n)
    .use(Unicon, {
      fill: "currentColor",
    })
    .use(store)
    .use(router)
    .use(auth)
    .use(head)
    .provide("config", config)
    .provide(
      DefaultApolloClient,
      new ApolloClient({
        link: graphqlErrorInterceptor.concat(
          //@ts-ignore
          createUploadLink({ uri: config.graphQlLink || "/api/graphql" })
        ),
        cache: new InMemoryCache(),
      })
    );

  if (config.SENTRY_ENABLED) {
    Sentry.init({
      app,
      sendClientReports: false,
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: ["*"],
        }),
      ],
      dsn: config.SENTRY_DSN_FRONTEND,
    });
  }
  app.mount("#app");
};
start();
