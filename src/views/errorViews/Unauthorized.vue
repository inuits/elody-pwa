<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="flex p-4 w-1/2">
      <img src="/logo.svg" alt="Elody logo" class="h-64" />
      <div class="px-4 pl-12">
        <h2 class="text-4xl font-bold py-4">
          {{ t("error-pages.unauthorized.title") }}
        </h2>
        <p>
          {{ t("error-pages.unauthorized.description") }}
        </p>
        <div
          class="flex bg-accent-normal text-neutral-white cursor-pointer p-4 mt-12 w-1/4 justify-center items-center"
          @click="logIn"
        >
          {{ t("navigation.log-in") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAuth } from "session-vue-3-oidc-library";
const auth = useAuth();
const { t } = useI18n();

const logIn = () => {
  auth.changeRedirectRoute(window.location.origin);
  auth.redirectToLogin();
};
</script>

<style scoped></style>
