<template>
  <div>
    <div
      class="flex flex-row items-center fixed bottom-8 left-4 hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === false"
        @click="auth.redirectToLogin()"
        :name="Unicons.UserCircle.name"
        height="21"
        class="mt-1 ml-4"
      />
      <transition v-if="isExpanded">
        <span
          v-if="auth.isAuthenticated.value === false"
          @click="auth.redirectToLogin()"
          class="overflow-hidden px-4 font-bold"
          ss
        >
          {{ t("navigation.log-in") }}
        </span>
      </transition>
    </div>

    <div
      class="flex flex-row items-center fixed bottom-8 left-4 hover:text-accent-accent cursor-pointer"
    >
      <unicon
        v-if="auth.isAuthenticated.value === true"
        @click="async () => await performLogout()"
        :name="Unicons.SignOut.name"
        height="20"
        class="mt-1 ml-4"
      />
      <transition v-if="isExpanded">
        <span
          v-if="auth.isAuthenticated.value === true"
          @click="async () => await performLogout()"
          class="overflow-hidden px-4 font-bold"
        >
          {{ t("navigation.log-out") }}
        </span>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { Unicons } from "@/types";
import { useApp } from "@/composables/useApp";
import { useAuth } from "session-vue-3-oidc-library";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

defineProps({
  isExpanded: Boolean,
});

const auth = useAuth();
const config = inject<{
  features: { hasTenantSelect: boolean };
  allowAnonymousUsers: boolean;
}>("config");

const route = useRoute();
const { initApp } = useApp();
const { t } = useI18n();

const performLogout = async () => {
  await auth.logout();
  if (route.meta.requiresAuth === true)
    await auth.redirectToLogin();
  await initApp(auth, config);
};
</script>

<style></style>
