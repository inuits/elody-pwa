<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <h2 class="text-4xl">{{ t("navigation.page-not-found") }}</h2>
    <div
      class="bg-accent-normal text-neutral-white cursor-pointer p-4 mt-24"
      @click="navigateHome"
    >
      {{ t("navigation.go-home") }}
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
