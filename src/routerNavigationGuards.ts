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
) => {
  const { selectedTenant, getCodeById } = useTenant();

  if (!to.params.tenant && selectedTenant.value) {
    const tenant = getCodeById(selectedTenant.value) || selectedTenant.value;
    next({
      name: to.name as string,
      params: { ...to.params, tenant },
      query: to.query,
    });
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

  router.beforeEach((to, from, next) => {
    handleRequiresAuthFromOverviewPage(to, config, next, router);
    handleTenantParameterInUrl(to, next);
  });
};
