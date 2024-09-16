<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="flex p-4 w-1/2">
      <img src="/logo.svg" alt="Elody logo" class="h-64" />
      <div class="px-4 pl-12">
        <h2 class="text-4xl font-bold py-4">
          {{ t("error-pages.not-found.title") }}
        </h2>
        <p>
          {{ t("error-pages.not-found.description") }}
        </p>
        <div
          class="flex bg-accent-normal text-neutral-white cursor-pointer p-4 mt-12 w-1/4 justify-center items-center"
          @click="navigateHome"
        >
          {{ t("navigation.go-home") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const navigateHome = () => {
  router.push("/Home");
};
</script>

<style scoped></style>
