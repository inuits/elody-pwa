import type { ApolloClient } from "@apollo/client/core";
import useTenant from "@/composables/useTenant";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { inject, ref, watch } from "vue";

const showSplashScreen = ref<boolean>(true);

export const useApp = () => {
  const initApp = async (auth: any, config: any) => {
    const apolloClient = inject(DefaultApolloClient);
    const { initTenants, selectedTenant, tenantsLoaded } = useTenant(apolloClient as ApolloClient<any>, config);

    showSplashScreen.value = true;

    if (auth.isAuthenticated.value || config.allowAnonymousUsers) {
      await initTenants();
      showSplashScreen.value = false;

      if (config.features.hasTenantSelect) {
        watch(
          [selectedTenant, tenantsLoaded],
          async () => {
            showSplashScreen.value = true;
            if (tenantsLoaded.value === "loaded")
              if (auth.isAuthenticated.value || config.allowAnonymousUsers) {
                await initTenants();
                showSplashScreen.value = false;
              } else {
                await auth.redirectToLogin();
              }
          }
        );
      }
    } else {
      await auth.redirectToLogin();
    }
  };

  return { initApp, showSplashScreen };
};
