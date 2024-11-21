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
  const { selectedTenant, getCodeById, getLabelById } = useTenant();

  if (!to.params.tenant && selectedTenant.value) {
    const tenant = getCodeById(selectedTenant.value) || getLabelById(selectedTenant.value) || selectedTenant.value
    next({
      name: to.name as string,
      params: { ...to.params, tenant },
      query: to.query,
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
