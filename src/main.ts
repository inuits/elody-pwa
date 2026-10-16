import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  type NormalizedCacheObject,
  createHttpLink,
  from,
} from "@apollo/client/core";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";
import "./assets/main.css";
import App from "./App.vue";
import Unicon from "vue-unicons";
import { addComponentToRoutes } from "./views/router";
import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import { createRouter, createWebHistory, type Router } from "vue-router";
import { DefaultApolloClient } from "@vue/apollo-composable";
import {
  getApplicationDetails,
  getFormattersSettings,
  setupI18n,
  graphqlErrorInterceptor,
} from "@/helpers";
import { OpenIdConnectClient } from "session-vue-3-oidc-library";
import { setListingCountCap } from "@/composables/useResultCount";
import { Unicons } from "./types";
import { addRouterNavigationGuards } from "./routerNavigationGuards";
import Notifications from "@kyvg/vue3-notification";
import { type I18n } from "vue-i18n";

import { setContext } from "@apollo/client/link/context";
import { useServiceVersionManager } from "@/composables/useServiceVersionManager";
import { ElodyServices } from "@/generated-types/queries";
import { useInputValidation } from "@/composables/useInputValidation";
import { useApp } from "@/composables/useApp";
import { aliasAsKeyTransform } from "@/aliasAsKeyTransform";
import {
  identifyInBrowserTracing,
  initBrowserTracing,
} from "@/tracing/browserTracing";
import { getSessionId } from "@/observability/sessionId";
import { createSessionLink } from "@/observability/sessionLink";
import {
  createUsageLink,
  identifyUser,
  initUsageAnalytics,
  libraryOf,
} from "@/analytics/usageAnalytics";

export let auth: typeof OpenIdConnectClient | null;
export let apolloClient: ApolloClient<NormalizedCacheObject>;
export let i18n: I18n<any>;
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

  const applicationDetails = await getApplicationDetails();
  const { translations, version, urlMapping } = applicationDetails;
  let { config } = applicationDetails;
  // one id per tab, shared by the traces, the usage events and the error reports
  const sessionId = getSessionId();
  await initBrowserTracing(config, undefined, sessionId);
  i18n = setupI18n(translations, config.customization.applicationLocale);

  typeUrlMapping = urlMapping;
  const { setVersion, getPwaVersion } = useServiceVersionManager();

  const { initializeInputValidation } = useInputValidation();

  setVersion(version["apollo-graphql-version"], ElodyServices.ApolloGraphql);
  setVersion(await getPwaVersion(), ElodyServices.Pwa);
  initializeInputValidation(translations);

  if (config.customization) applyCustomization(config.customization);
  auth = auth != null ? auth : (auth = new OpenIdConnectClient(config.oidc));

  const head = createHead();
  router = createRouter({
    routes: addComponentToRoutes(config.routerConfig),
    history: createWebHistory(import.meta.env.BASE_URL),
  });

  auth.changeRedirectRoute(window.location.origin + window.location.pathname);

  const authCode = new URLSearchParams(window.location.search).get("code");
  auth.authCode = authCode;

  if (authCode) {
    await auth.processAuthCode(authCode);
    if (!config.allowAnonymousUsers && !auth.isAuthenticated.value)
      await auth.redirectToLogin();
    config = (await getApplicationDetails()).config;
  } else {
    await auth.verifyServerAuth();
  }

  await initUsageAnalytics(config, sessionId);

  bulkSelectAllSizeLimit = config.bulkSelectAllSizeLimit;

  // Keep the frontend cap in sync with collection-api's LISTING_COUNT_CAP so
  // capped totals render as "<cap>+" instead of the raw `cap + 1` sentinel.
  setListingCountCap(config.listingCountCap || 0);

  const apqLink = createPersistedQueryLink({
    sha256,
    useGETForHashedQueries: false,
  });

  const httpLink = createHttpLink({
    uri: config.graphQlLink || "/api/graphql",
    headers: { "Apollo-Require-Preflight": "true" },
  });

  const authLink = setContext((_, { headers }) => {
    const tenantId = sessionStorage.getItem("active_tenant_id");

    return {
      headers: {
        ...headers,
        "X-Tenant-ID": tenantId || "",
      },
    };
  });

  const authCheckLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      const authStatus = response.extensions?.authStatus;

      if (authStatus === "UNAUTHENTICATED" && auth?.isAuthenticated.value) {
        auth.logout();
        if (!config.allowAnonymousUsers) auth.redirectToLogin();
      }

      return response;
    });
  });

  apolloClient = new ApolloClient({
    link: from([
      graphqlErrorInterceptor,
      authCheckLink,
      authLink,
      // with tracing on, the backend's spans name the tab's session too
      ...(config.browserTracing ? [createSessionLink(sessionId)] : []),
      createUsageLink(),
      apqLink,
      httpLink,
    ]),
    cache: new InMemoryCache(),
    documentTransform: aliasAsKeyTransform,
  });

  const [formattersSettingsResult] = await Promise.all([
    getFormattersSettings(),
  ]);
  formattersSettings = formattersSettingsResult;

  await useApp().initApp(auth, config, apolloClient);

  addRouterNavigationGuards(router, config);

  const app = createApp(App)
    .use(i18n)
    .use(Unicon as any, {
      fill: "currentColor",
    })
    .use(Notifications)
    .use(router)
    .use(auth)
    .use(head)
    .provide("config", config)
    .provide(DefaultApolloClient, apolloClient);

  // the user by pseudonym only: in the usage events and in the traces, errors
  // and replays (with their library), never by name or e-mail address
  const user = auth.isAuthenticated.value ? auth.user : undefined;
  const pseudonym = await identifyUser(user);
  if (pseudonym)
    identifyInBrowserTracing({ pseudonym, library: libraryOf(user?.email) });

  app.mount("#app");
};
start();
