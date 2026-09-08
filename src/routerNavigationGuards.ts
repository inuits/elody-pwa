import type {
  Router,
  RouteLocationNormalized,
  RouteLocationRaw,
} from "vue-router";
import { auth } from "@/main";
import useTenant from "@/composables/useTenant";
import { getFromExpressEndpoint } from "@/helpers";
import { ElodyServices, RouteNames } from "@/generated-types/queries";
import { useServiceVersionManager } from "@/composables/useServiceVersionManager";
import { getChildrenOfHomeRoutes, requiresAuthForEntity } from "@/helpers";
import type { OpenIdConnectClient } from "session-vue-3-oidc-library";
import { usePageStatus } from "@/composables/usePageStatus";

type RouteVerdicts = { [routeKey: string]: boolean };

const routeKey = (route: { name?: unknown; path?: string }): string =>
  String(route.name ?? route.path ?? "");

// The graphql layer resolved every route `can` into `meta.permitted` when it
// served the config. The router was built from the config fetched before the
// auth code was processed, so the verdicts are read from the config handed to
// the guards instead of from the router's own meta.
const collectRouteVerdicts = (
  routes: any[] | undefined,
  verdicts: RouteVerdicts = {},
): RouteVerdicts => {
  for (const route of routes ?? []) {
    if (typeof route?.meta?.permitted === "boolean")
      verdicts[routeKey(route)] = route.meta.permitted;
    if (route?.children) collectRouteVerdicts(route.children, verdicts);
  }
  return verdicts;
};

const checkAlternativeRoutes = (
  to: RouteLocationNormalized,
  routeVerdicts: RouteVerdicts,
): RouteLocationRaw | null => {
  const toData = to.matched[to.matched.length - 1];
  const toMeta = toData?.meta || {};

  if (routeVerdicts[routeKey(toData ?? {})] !== false) return null;

  const alternativeRoutes = toMeta.alternativeRoutes as
    | { [role: string]: string }
    | undefined;

  if (!alternativeRoutes) return null;

  const authManager = auth as unknown as OpenIdConnectClient;
  const userRole = authManager.user?.role || "fallback";
  const alternativeRoute = alternativeRoutes[userRole];

  if (
    alternativeRoute === to.fullPath ||
    to.fullPath.includes(alternativeRoute)
  ) {
    return null;
  }

  return alternativeRoute;
};

const checkRequiresAuthFromOverview = (
  to: RouteLocationNormalized,
  config: any,
): RouteLocationRaw | null => {
  const metaOfChildRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta,
  );
  const type = to.params["type"] ? String(to.params["type"]) : undefined;

  if (!type) return null;

  if (requiresAuthForEntity(type, metaOfChildRoutes)) {
    return "/unauthorized";
  }

  return null;
};

const checkTenantParameter = async (
  to: RouteLocationNormalized,
): Promise<RouteLocationRaw | null> => {
  const {
    selectedTenant,
    getCodeById,
    getIdFromCode,
    setTennant,
    getLabelById,
  } = (useTenant as any)();

  const isGeneric = ["Unauthorized", "AccessDenied", "NotFound"].includes(
    to.name as string,
  );
  if (isGeneric) return null;

  const urlParam = to.params.tenant;

  if (urlParam) {
    const urlCode = Array.isArray(urlParam)
      ? String(urlParam[0])
      : String(urlParam);
    const targetTenantId = getIdFromCode(urlCode);

    if (targetTenantId) {
      if (selectedTenant.value !== targetTenantId) {
        const label = getLabelById(targetTenantId);
        await setTennant(label || "", targetTenantId);
      }
    } else {
      if (selectedTenant.value) {
        const selectedCode =
          getCodeById(selectedTenant.value) || selectedTenant.value;
        if (urlCode !== selectedCode && !to.path.includes("not-found")) {
          return { name: "Home", params: { tenant: selectedCode } };
        }
      }
    }
  }

  if (!urlParam && selectedTenant.value && !to.path.includes("not-found")) {
    const tenant = getCodeById(selectedTenant.value) || selectedTenant.value;
    return { path: `/${tenant}${to.path}`, query: to.query };
  }

  return null;
};

const handleRequiredAuthentication = (router: Router) => {
  const authManager = auth as unknown as OpenIdConnectClient;
  if (
    router.currentRoute.value.meta.requiresAuth &&
    !authManager.isAuthenticated.value
  ) {
    router.push("/unauthorized");
  }
};

const getRedirectUrl = (route: RouteLocationNormalized): string | undefined => {
  if (route.meta.ignoreRedirect) {
    if (route.name === RouteNames.NotFound) return window.location.origin + "/";
  }
  if (
    route.name === RouteNames.AccessDenied ||
    route.name === RouteNames.Unauthorized
  )
    return undefined;
  return window.location.origin + window.location.pathname;
};

const checkForNewVersion = async (): Promise<void> => {
  const { setVersion } = useServiceVersionManager();
  const version = await getFromExpressEndpoint("version");
  if (!version) return;
  setVersion(version["apollo-graphql-version"], ElodyServices.ApolloGraphql);
};

export const addRouterNavigationGuards = (router: Router, config: any) => {
  const routeVerdicts = collectRouteVerdicts(config?.routerConfig);

  router.afterEach(() => {
    handleRequiredAuthentication(router);
    const authManager = auth as unknown as OpenIdConnectClient;

    const authRedirectUrl = getRedirectUrl(router.currentRoute.value);
    if (authRedirectUrl) authManager.changeRedirectRoute(authRedirectUrl);

    checkForNewVersion();
  });

  router.beforeEach(async (to, from, next) => {
    try {
      const { resetPageStatus } = usePageStatus();
      resetPageStatus();

      const alternativeRedirect = checkAlternativeRoutes(to, routeVerdicts);
      if (alternativeRedirect) return next(alternativeRedirect);

      const authRedirect = checkRequiresAuthFromOverview(to, config);
      if (authRedirect) return next(authRedirect);

      const tenantRedirect = await checkTenantParameter(to);
      if (tenantRedirect) return next(tenantRedirect);

      next();
    } catch (error) {
      console.error("Router Guard Error:", error);
      next();
    }
  });
};
