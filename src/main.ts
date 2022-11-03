import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { createUploadLink } from "apollo-upload-client";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import Unicon from "vue-unicons";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import App from "./App.vue";
import { routes } from "./views/router";
import { store } from "./store";
import { Unicons } from "./types";
import { i18n } from "./helpers";
import { createHead } from "@vueuse/head";
import "./assets/base.css";
import { onError } from "@apollo/client/link/error";
import useGraphqlErrors from "./composables/useGraphqlErrors";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { setIgnorePermissions } from "./composables/usePermissions";

export let auth: typeof OpenIdConnectClient | null;

const start = async () => {
  Unicon.add(Object.values(Unicons));

  const config = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/config"
  ).then((r) => r.json());
  auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));

  const head = createHead();
  const router = createRouter({
    routes,
    history: createWebHistory(import.meta.env.BASE_URL),
  });

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
    auth.changeRedirectRoute(window.location.origin + to.fullPath);
    await auth.verifyServerAuth();
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
      return next();
    }
    await auth.assertIsAuthenticated(to.fullPath, next);
  });

  auth.changeRedirectRoute(window.location.origin + window.location.pathname);
  const authCode = new URLSearchParams(window.location.search).get("code");
  auth.authCode = authCode;

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
      environment: config.NOMAD_NAMESPACE,
    });
  }
  setIgnorePermissions(config.IGNORE_PERMISSIONS);
  app.mount("#app");
};
start();
