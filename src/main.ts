import {
  ApolloClient,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import { createUploadLink } from "apollo-upload-client";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import Unicon from "vue-unicons";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import App from "./App.vue";
import { addComponentToRoutes } from "./views/router";
import { Unicons } from "./types";
import { i18n } from "@/helpers";
import { createHead } from "@vueuse/head";
import "./assets/base.css";
import { onError } from "@apollo/client/link/error";
import useGraphqlErrors from "./composables/useGraphqlErrors";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { setIgnorePermissions } from "./composables/usePermissions";

export let auth: typeof OpenIdConnectClient | null;
export let apolloClient: ApolloClient<NormalizedCacheObject>;
export let bulkSelectAllSizeLimit: number = 999999;

const applyCustomization = (rulesObject: any) => {
  if (rulesObject.applicationTitle)
    document.title = rulesObject.applicationTitle;
};

const getApplicationDetails = async () => {
  const config = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/config"
  ).then((r) => r.json());
  const translations = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/translation"
  ).then((r) => r.json());
  const validationSchema = await fetch(
    import.meta.env.VUE_APP_CONFIG_URL
      ? import.meta.env.VUE_APP_CONFIG_URL
      : "/api/validation"
  ).then((r) => r.json());
  return { config, translations, validationSchema };
};

const start = async () => {
  Unicon.add(Object.values(Unicons));

  const { config, translations, validationSchema } =
    await getApplicationDetails();

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
    .provide("validationSchema", validationSchema)
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
