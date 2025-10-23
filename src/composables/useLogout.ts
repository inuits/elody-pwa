import { inject } from "vue";
import { useRoute } from "vue-router";
import { auth } from "@/main";
import { useApp } from "@/composables/useApp";
import { useStateManagement } from "@/composables/useStateManagement";
import { resetAdvancedPermissions } from "@/composables/usePermissions";
import useTenant from "@/composables/useTenant";
import { useBaseModal } from "@/composables/useBaseModal";

export const useLogout = () => {
  const route = useRoute();
  const { initApp } = useApp();
  const { setTennantInSession } = useTenant();
  const { clearStorage } = useStateManagement();
  const { closeAllModals } = useBaseModal();

  const config = inject<{
    features: { hasTenantSelect: boolean };
    allowAnonymousUsers: boolean;
  }>("config");

  const clearAppState = (): void => {
    resetAdvancedPermissions();
    clearStorage();
    setTennantInSession("");
    closeAllModals();
  };

  const performLogout = async (): Promise<void> => {
    try {
      await auth.logout();
      clearAppState();

      if (route.meta.requiresAuth) {
        await auth.redirectToLogin();
      }

      await initApp(auth, config);
    } catch (error) {
      console.error("[Logout Error]", error);
    }
  };

  return {
    performLogout,
  };
}
