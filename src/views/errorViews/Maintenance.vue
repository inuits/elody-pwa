<template>
  <main
    class="bg-background-normal text-text-body w-full h-screen flex flex-col justify-center items-center gap-6 p-4 text-center"
  >
    <img src="/logo.svg" :alt="applicationTitle" class="h-48 max-w-xs" />
    <h1 class="text-4xl font-bold text-accent-normal">
      {{ t("maintenance.title") }}
    </h1>
    <p class="max-w-md">
      {{ t("maintenance.description", { applicationTitle }) }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{ applicationTitle: string }>();

const { t } = useI18n();
</script>
