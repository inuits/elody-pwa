<template>
  <template v-if="pageName === 'Fallback'">
    <access-denied v-if="pageStatus === PageStatus.Forbidden" />
    <unauthorized v-else-if="pageStatus === PageStatus.Unauthorized" />
    <AssetLibrary v-else />
  </template>
  <Home v-if="pageName === 'SingleEntity'" />
</template>

<script lang="ts" setup>
import AssetLibrary from "@/components/library/AssetLibrary.vue";
import Home from "@/views/Home.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePageStatus } from "@/composables/usePageStatus";
import { PageStatus } from "@/generated-types/queries";
import AccessDenied from "@/views/errorViews/AccessDenied.vue";
import Unauthorized from "@/views/errorViews/Unauthorized.vue";

const route = useRoute();
const { pageStatus } = usePageStatus();

const pageName = computed(() => {
  const singleEntityNames = [
    "SingleEntity",
    "SingleMediafile",
    "EmbeddedViewer",
    "HistoryComparison",
  ];
  if (
    singleEntityNames.includes(route.name as string) ||
    (route.meta as any)?.multiEntityLayout
  )
    return "SingleEntity";
  return "Fallback";
});
</script>
