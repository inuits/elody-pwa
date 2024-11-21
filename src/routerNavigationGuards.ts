import type {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { auth } from "@/main";
import useTenant from "@/composables/useTenant";

const handleRequiredAuthentication = (router: Router) => {
  if (
    router.currentRoute.value.meta.requiresAuth &&
    !auth.isAuthenticated.value
  )
    router.push("/unauthorized");
};

const handleTenantInUrl = (
  to: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { selectedTenant } = useTenant();

  if (!to.params.tenant && selectedTenant.value) {
    next({
      name: to.name as string, // Use the route name to preserve named routing
      params: { ...to.params, tenant: selectedTenant.value }, // Add the tenant param
      query: to.query, // Preserve existing query parameters
    });
  } else {
    next();
  }
};

export const addRouterNavigationGuards = (router: Router) => {
  router.afterEach(() => {
    handleRequiredAuthentication(router);
    auth.changeRedirectRoute(window.location.origin + window.location.pathname);
  });

  router.beforeEach((to, from, next) => {
    handleTenantInUrl(to, next);
  });
};
