<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <div class="flex p-4 w-1/2">
      <img src="/logo.svg" alt="Elody logo" class="h-64 max-w-xs" />
      <div class="px-4 pl-12">
        <h2 class="text-4xl font-bold py-4">
          {{ t("error-pages.access-denied.title") }}
        </h2>
        <p>
          {{ t("error-pages.access-denied.description") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped></style>
