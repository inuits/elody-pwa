<template>
  <BaseLibrary
    :bulk-operations-context="route.name as Context"
    :search-input-type-on-drawer="
      route.meta.type === 'mediafiles'
        ? SearchInputType.AdvancedInputMediaFilesType
        : SearchInputType.AdvancedInputType
    "
    :enable-bulk-operations="config.features.hasBulkSelect"
    :list-item-route-name="RouteNames.SingleEntity"
    :filter-type="entityType"
  />
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import type { Context } from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { RouteNames, SearchInputType } from "@/generated-types/queries";
import { useRoute } from "vue-router";

const route = useRoute();
const config = inject("config");

const entityType = computed<string | "not-set">(() =>
  route.meta.entityType ? (route.meta.entityType as string) : "not-set"
);
</script>
