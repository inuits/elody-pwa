/* eslint-disable @typescript-eslint/no-explicit-any -- test/storybook harness: jsdom polyfills and untyped third-party surfaces */
// Storybook stand-in for src/main.ts. That module bootstraps the whole app
// (auth, config fetch, router) at import time; ~50 composables import
// singletons from it. The vite alias in .storybook/main.ts points "@/main"
// here so stories get inert singletons instead of the real bootstrap.
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import { createI18n } from "vue-i18n";
import {
  createMemoryHistory,
  createRouter,
  type Router,
} from "vue-router";
import { ref } from "vue";

// Minimal translations for components rendered in isolation; extend as
// stories need them. Missing keys render as their key (missingWarn: false).
const messages = {
  en: {
    actions: {
      "progress-bar": {
        percentage: "{0}% complete",
        steps: "Step {0} of {1}",
      },
    },
    metadata: {
      labels: {
        yes: "Yes",
        no: "No",
      },
    },
  },
};

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
  messages,
  missingWarn: false,
  fallbackWarn: false,
});

// Stories render components in isolation: no baseGraphql behind them. Any
// query a component fires resolves to empty data instead of hitting the
// network. Operations whose result shape a component dereferences without
// guards get a minimal empty fixture here; extend the map when a story
// needs real-looking query results.
const operationFixtures: Record<string, Record<string, unknown>> = {
  // usePermissions iterates result.data.PermissionMappingEntityDetail.length
  GetPermissionMappingEntityDetail: { PermissionMappingEntityDetail: [] },
  // BulkOperationsExportCsv iterates result.data.BulkOperationCsvExportKeys.options
  GetBulkOperationCsvExportKeys: {
    BulkOperationCsvExportKeys: { options: [] },
  },
};

export const apolloClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          observer.next({
            data: operationFixtures[operation.operationName] ?? {},
          });
          observer.complete();
        }),
    ),
    cache: new InMemoryCache(),
  });

// Some components query generated documents that only exist in certain
// client builds (e.g. ImportFromNetworkDrive's GetUploadMagazinesWith*).
// When the document is absent from this repo's codegen output the component
// would pass `query: undefined` and Apollo throws "query option is
// required"; resolve with empty data instead so such stories stay inert.
const realQuery = apolloClient.query.bind(apolloClient);
apolloClient.query = ((options: any) =>
  options?.query
    ? realQuery(options)
    : Promise.resolve({ data: {} })) as typeof apolloClient.query;

export const auth: any = {
  isAuthenticated: ref(true),
  user: { name: "storybook" },
  changeRedirectRoute: () => {},
  verifyServerAuth: async () => {},
  redirectToLogin: async () => {},
  logout: () => {},
};

export const router: Router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/:pathMatch(.*)*",
      name: "storybook",
      component: { template: "<div />" },
    },
  ],
});

export const bulkSelectAllSizeLimit: number = 999999;
export const formattersSettings: any = {};
export const typeUrlMapping = undefined;