import {
  ApolloClient,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import "./assets/base.css";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import Unicon from "vue-unicons";
import useGraphqlErrors from "./composables/useGraphqlErrors";
import { addComponentToRoutes } from "./views/router";
import { BrowserTracing } from "@sentry/tracing";
import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createRouter, createWebHistory } from "vue-router";
import { createUploadLink } from "apollo-upload-client";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { getApplicationDetails, i18n } from "@/helpers";
import { onError } from "@apollo/client/link/error";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import { setIgnorePermissions } from "./composables/usePermissions";
import { Unicons } from "./types";
import { useFormHelper } from "@/composables/useFormHelper";

export let auth: typeof OpenIdConnectClient | null;
export let apolloClient: ApolloClient<NormalizedCacheObject>;
export let bulkSelectAllSizeLimit: number = 999999;

const applyCustomization = (rulesObject: any) => {
  if (rulesObject.applicationTitle)
    document.title = rulesObject.applicationTitle;
};

const start = async () => {
  Unicon.add(Object.values(Unicons));

  const { config, translations } = await getApplicationDetails();
  const { defineValidationRules } = useFormHelper();

  defineValidationRules();

  if (config.customization) applyCustomization(config.customization);
  auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));
  bulkSelectAllSizeLimit = config.bulkSelectAllSizeLimit;

  const head = createHead();
  const router = createRouter({
    routes: addComponentToRoutes(config.routerConfig),
    history: createWebHistory(import.meta.env.BASE_URL),
  });

  const graphqlErrorInterceptor = onError((error: any) => {
    const errorHandler = useGraphqlErrors(error);
    errorHandler.logFormattedErrors();
  });

  router.beforeEach(async (to, _from) => {
    await auth.verifyServerAuth();
    if (!to.matched.some((route) => route.meta.requiresAuth)) {
      return;
    } else {
      await auth.assertIsAuthenticated(to.fullPath);
    }
  });

  router.afterEach(() => {
    auth.changeRedirectRoute(window.location.origin + window.location.pathname);
  });

  auth.changeRedirectRoute(window.location.origin + window.location.pathname);
  const authCode = new URLSearchParams(window.location.search).get("code");
  auth.authCode = authCode;

  if (authCode) {
    auth.processAuthCode(authCode, router);
  }

  apolloClient = new ApolloClient({
    link: graphqlErrorInterceptor.concat(
      createUploadLink({
        uri: config.graphQlLink || "/api/graphql",
        headers: { "Apollo-Require-Preflight": "true" },
      })
    ),
    cache: new InMemoryCache(),
  });

  const app = createApp(App)
    .use(i18n(translations, config.customization.applicationLocale))
    .use(Unicon, {
      fill: "currentColor",
    })
    .use(router)
    .use(auth)
    .use(head)
    .provide("config", config)
    .provide(DefaultApolloClient, apolloClient);

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
