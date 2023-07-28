<template>
  <BaseLibrary
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
    :list-item-route-name="'SingleEntity'"
    :enable-bulk-operations="true"
    :bulk-operations-context="route.name as Context"
  />
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { SearchInputType } from "@/generated-types/queries";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
