import type {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { auth } from "@/main";
import useTenant from "@/composables/useTenant";
import { getFromExpressEndpoint } from "@/helpers";
import { ElodyServices } from "@/generated-types/queries";
import { useServiceVersionManager } from "@/composables/useServiceVersionManager";
import { getChildrenOfHomeRoutes, requiresAuthForEntity } from "@/helpers";
import { usePermissions } from "@/composables/usePermissions";

const handleRequiredAuthentication = (router: Router) => {
  if (
    router.currentRoute.value.meta.requiresAuth &&
    !auth.isAuthenticated.value
  )
    router.push("/unauthorized");
};

const handleTenantParameterInUrl = (
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router,
) => {
  const { selectedTenant, getCodeById } = useTenant();

  if (!to.params.tenant && selectedTenant.value && !to.path.includes("not-found")) {
    const tenant = getCodeById(selectedTenant.value) || selectedTenant.value;
    router.replace({ path: `/${tenant}${to.path}`, query: to.query })
  } else {
    next();
  }
};

const handleRequiresAuthFromOverviewPage = (
  to: RouteLocationNormalized,
  config: any,
  next: NavigationGuardNext,
  router: Router,
) => {
  const metaOfChildRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta,
  );
  const type = to.params["type"] ? String(to.params["type"]) : undefined;
  if (!type) return next();

  if (requiresAuthForEntity(type, metaOfChildRoutes)) {
    return router.push("/unauthorized");
  } else {
    return next();
  }
};

const handleAlternativeRoutes = async (
  to: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const toData = to.matched[to.matched.length - 1];
  const toMeta = toData?.meta || {};

  const permission: string[] | undefined = toMeta.can as string[] | undefined;

  if (!permission) {
    return next();
  }

  const { fetchAdvancedPermission } = usePermissions();
  const isPermitted = await fetchAdvancedPermission(permission);

  const alternativeRoutes: { [role: string]: string } | undefined =
    toMeta.alternativeRoutes as { [role: string]: string } | undefined;

  if (isPermitted || !alternativeRoutes) {
    return next();
  }

  const userRole = auth.user?.role || "fallback";
  const alternativeRoute = alternativeRoutes[userRole];

  if (
    alternativeRoute === to.fullPath ||
    to.fullPath.includes(alternativeRoute)
  ) {
    return next();
  }

  return next(alternativeRoute);
};

const checkForNewVersion = async (): Promise<void> => {
  const { setVersion } = useServiceVersionManager();
  const version = await getFromExpressEndpoint("version");
  if (!version) return;
  setVersion(version["apollo-graphql-version"], ElodyServices.ApolloGraphql);
};

export const addRouterNavigationGuards = (router: Router, config: any) => {
  router.afterEach(() => {
    handleRequiredAuthentication(router);
    auth.changeRedirectRoute(window.location.origin + window.location.pathname);
    checkForNewVersion();
  });

  router.beforeEach(async (to, from, next) => {
    await handleAlternativeRoutes(to, next);
    await handleRequiresAuthFromOverviewPage(to, config, next, router);
    handleTenantParameterInUrl(to, next, router);
  });
};
