import {
  ApolloClient,
  InMemoryCache,
  type NormalizedCacheObject,
  createHttpLink,
} from "@apollo/client/core";
import "./assets/base.css";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import Unicon from "vue-unicons";
import { addComponentToRoutes } from "./views/router";
import { BrowserTracing } from "@sentry/tracing";
import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createRouter, createWebHistory, type Router } from "vue-router";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { getApplicationDetails, getFormattersSettings, i18n } from "@/helpers";
import { onError } from "@apollo/client/link/error";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import { setIgnorePermissions } from "./composables/usePermissions";
import { Unicons } from "./types";
import { useFormHelper } from "@/composables/useFormHelper";
import { useErrorCodes } from "@/composables/useErrorCodes";
import { addRouterNavigationGuards } from "./routerNavigationGuards";

import type { GraphQLError } from "graphql/error";
import { useServiceVersionManager } from "@/composables/useServiceVersionManager";
import { ElodyServices } from "@/generated-types/queries";

export let auth: typeof OpenIdConnectClient | null;
export let apolloClient: ApolloClient<NormalizedCacheObject>;
export let bulkSelectAllSizeLimit: number = 999999;
export let formattersSettings: any = {};
export let router: Router;
export let typeUrlMapping:
  | {
      mapping: { [type: string]: string };
      reverseMapping: { [type: string]: string };
    }
  | undefined;

const applyCustomization = (rulesObject: any) => {
  if (rulesObject.applicationTitle)
    document.title = rulesObject.applicationTitle;
};

const start = async (): Promise<void> => {
  Unicon.add(Object.values(Unicons));

  const { config, translations, version, urlMapping } =
    await getApplicationDetails();
  typeUrlMapping = urlMapping;
  const { setVersion, getPwaVersion } = useServiceVersionManager();

  const { defineValidationRules } = useFormHelper();

  setVersion(version["apollo-graphql-version"], ElodyServices.ApolloGraphql);
  setVersion(await getPwaVersion(), ElodyServices.Pwa);
  defineValidationRules();

  if (config.customization) applyCustomization(config.customization);
  auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));

  const head = createHead();
  router = createRouter({
    routes: addComponentToRoutes(config.routerConfig),
    history: createWebHistory(import.meta.env.BASE_URL),
  });

  auth.changeRedirectRoute(window.location.origin + window.location.pathname);
  addRouterNavigationGuards(router, config);

  const authCode = new URLSearchParams(window.location.search).get("code");
  auth.authCode = authCode;

  if (authCode) {
    await auth.processAuthCode(authCode);
    if (!config.allowAnonymousUsers && !auth.isAuthenticated.value)
      await auth.redirectToLogin();
  } else {
    await auth.verifyServerAuth();
  }

  bulkSelectAllSizeLimit = config.bulkSelectAllSizeLimit;

  const graphqlErrorInterceptor = onError((error: GraphQLError) => {
    const { handleGraphqlError } = useErrorCodes();
    handleGraphqlError(error);
  });

  apolloClient = new ApolloClient({
    link: graphqlErrorInterceptor.concat(
      createHttpLink({
        uri: config.graphQlLink || "/api/graphql",
        headers: { "Apollo-Require-Preflight": "true" },
      }),
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
  const [formattersSettingsResult] = await Promise.all([
    getFormattersSettings(),
  ]);
  formattersSettings = formattersSettingsResult;
  app.mount("#app");
};
start();
