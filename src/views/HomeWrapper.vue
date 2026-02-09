<template>
  <AssetLibrary v-if="pageName === 'Fallback'" />
  <Home v-if="pageName === 'SingleEntity'" />
</template>

<script lang="ts" setup>
import AssetLibrary from "@/components/library/AssetLibrary.vue";
import Home from "@/views/Home.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const pageName = computed(() => {
  const singleEntityNames = [
    "SingleEntity",
    "SingleMediafile",
    "EmbeddedViewer",
  ];
  if (singleEntityNames.includes(route.name as string)) return "SingleEntity";
  return "Fallback";
});
</script>
