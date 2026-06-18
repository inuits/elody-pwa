import { inject, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { apolloClient, auth } from "@/main";
import { useApp } from "@/composables/useApp";
import { useStateManagement } from "@/composables/useStateManagement";
import { resetAdvancedPermissions } from "@/composables/usePermissions";
import useTenant from "@/composables/useTenant";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type BaseEntity,
  GetElodyUserDocument,
} from "@/generated-types/queries";

const elodyUser = shallowRef<BaseEntity | null>(null);

export const useAuth = () => {
  const route = useRoute();
  const { initApp } = useApp();
  const { setTenantInSessionStorage } = useTenant();
  const { clearStorage } = useStateManagement();
  const { closeAllModals } = useBaseModal();

  apolloClient
    .query({ query: GetElodyUserDocument })
    .then((result) => {
      const user = result.data?.getElodyUser;
      elodyUser.value = user ? JSON.parse(JSON.stringify(user)) : null;
    })
    .catch((e) => {
      console.error("[fetchElodyUser] error", e);
      elodyUser.value = null;
    });

  const config = inject<{
    features: { hasTenantSelect: boolean };
    allowAnonymousUsers: boolean;
  }>("config");

  const getUserName = (): string => {
    if (!auth.user) return "unknown";
    const user = auth.user;
    return user.name || user.given_name || user.email || user.family_name;
  };

  const getUserEmail = (): string => {
    if (!auth.user) return "unknown";
    return auth.user.email;
  };

  const performLogout = async (): Promise<void> => {
    try {
      await auth.logout();
      resetAdvancedPermissions();
      clearStorage();
      setTenantInSessionStorage("");
      closeAllModals();

      if (route.meta.requiresAuth) {
        await auth.redirectToLogin();
      }

      await initApp(auth, config);
    } catch (error) {
      console.error("[Logout Error]", error);
    }
  };

  return { getUserName, getUserEmail, performLogout, elodyUser };
};
