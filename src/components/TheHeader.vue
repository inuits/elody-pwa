<template>
  <div
    class="w-full px-6 py-8 border-b border-neutral-50 z-10 flex items-center justify-between bg-neutral-0"
  >
    <div class="flex w-full items-center">
      <h1 class="text-lg font-semibold text-neutral-800 float-left">
        {{ pageTitle.routerTitle
        }}<span
          v-if="pageTitle.entityTitle !== '' && route.meta.showEntityTitle"
          class="text-neutral-400"
        >
          / {{ pageTitle.entityTitle }}</span
        >
      </h1>
      <EditToggle v-if="auth.isAuthenticated.value === true" />
    </div>
    <div class="float-right">
      <BaseButton
        v-if="auth.isAuthenticated.value === false"
        label="Log in"
        bg-color="main-light"
        txt-color="main-dark"
        class="whitespace-nowrap"
        @click="auth.redirectToLogin()"
      />
      <BaseButton
        v-if="auth.isAuthenticated.value === true"
        label="Log out"
        bg-color="main-light"
        txt-color="main-dark"
        class="whitespace-nowrap"
        @click="logout()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { usePageTitle } from "../composables/usePageTitle";
import { useAuth } from "session-vue-3-oidc-library";
import BaseButton from "../components/base/BaseButton.vue";
import EditToggle from "./EditButtons.vue";

const { pageTitle } = usePageTitle();
const auth = useAuth();
const route = useRoute();
const router = useRouter();

const logout = async () => {
  await auth.logout();
  router.push({ name: "Home" });
};
</script>
