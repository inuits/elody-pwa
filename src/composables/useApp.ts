import type { ApolloClient } from "@apollo/client/core";
import useTenant from "@/composables/useTenant";
import { ref } from "vue";
import { router } from "@/main";

const showSplashScreen = ref<boolean>(true);
const currentTenant = ref<string | undefined>();

export const useApp = () => {
  const initApp = async (
    auth: any,
    config: any,
    apolloClient: ApolloClient<any>,
  ) => {
    const { initTenants, selectedTenantName } = useTenant(
      apolloClient as ApolloClient<any>,
      config,
    );

    showSplashScreen.value = true;
    if (auth.isAuthenticated.value || config.allowAnonymousUsers) {
      await initTenants(router.currentRoute.value.params);
      currentTenant.value = selectedTenantName.value;
      showSplashScreen.value = false;
    } else {
      await auth.redirectToLogin();
    }
  };

  return { initApp, showSplashScreen, currentTenant };
};
