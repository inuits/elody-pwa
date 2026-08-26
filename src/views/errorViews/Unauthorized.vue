<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="flex p-4 w-1/2">
      <img src="/logo.svg" alt="Elody logo" class="h-64 max-w-xs" />
      <div class="px-4 pl-12">
        <h2 class="text-4xl font-bold py-4">
          {{ t("error-pages.unauthorized.title") }}
        </h2>
        <p>
          {{ t("error-pages.unauthorized.description") }}
        </p>
        <BaseButton
          class="mt-12"
          style="width: auto"
          button-style="primary"
          :label="t('navigation.log-in')"
          @click="logIn"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { auth } from "@/main";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { RouteNames } from "@/generated-types/queries";

const { t } = useI18n();
const router = useRouter();

const logIn = () => {
  auth.changeRedirectRoute(window.location.origin);
  auth.redirectToLogin();
};

onMounted(() => {
  if (auth.isAuthenticated.value) router.push({ name: RouteNames.Home });
});
</script>

<style scoped></style>
