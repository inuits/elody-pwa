<template>
  <BaseLibrary
    :bulk-operations-context="route.name as Context"
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
    :enable-bulk-operations="config.features.hasBulkOperations"
    :list-item-route-name="RouteNames.SingleEntity"
    :filter-type="entityType"
  />
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, provide } from "vue";
import type { Context } from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { RouteNames, SearchInputType } from "@/generated-types/queries";
import { useRoute } from "vue-router";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const route = useRoute();
const config = inject("config");
const { getRouteBreadcrumbsOfEntity, clearBreadcrumbPathAndAddOverviewPage } =
  useBreadcrumbs(config);
const { addMediafileSelectionStateContext } = useEntityMediafileSelector();

provide("mediafileViewerContext", "mediafilesContext");
addMediafileSelectionStateContext("mediafilesContext");

const entityType = computed<string | "not-set">(() =>
  route.meta.entityType ? (route.meta.entityType as string) : "not-set",
);

onMounted(() => {
  const routeBreadcrumbs = getRouteBreadcrumbsOfEntity(entityType.value);
  console.log(routeBreadcrumbs);
  if (routeBreadcrumbs)
    clearBreadcrumbPathAndAddOverviewPage(
      routeBreadcrumbs[routeBreadcrumbs.length - 1].title as string,
    );
});
</script>
