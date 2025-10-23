import { watch, onUnmounted, inject } from "vue";
import { auth, apolloClient } from "@/main";
import { useLogout } from "./useLogout";
import { resetAdvancedPermissions } from "./usePermissions";
import { useApp } from "@/composables/useApp";

type ActionType = "login" | "logout" | (string & {});

export const useCrossTabAuthSync = () => {
  const channel = new BroadcastChannel("auth");
  const { performLogout } = useLogout();
  const config = inject("config");

  watch(
    auth!.isAuthenticated,
    (newValue) => {
      channel.postMessage({ action: newValue ? "login" : "logout" });
    },
    { immediate: true },
  );

  channel.onmessage = (e) => {
    const { action } = e.data as { action: ActionType };

    if (action === "logout") {
      performLogout();
    }
    if (action === "login" && auth!.isAuthenticated.value === false) {
      resetAdvancedPermissions();
      auth.verifyServerAuth();
      useApp().initApp(auth, config, apolloClient);
    }
  };

  onUnmounted(() => {
    channel.close();
  });
};
