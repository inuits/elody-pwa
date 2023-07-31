<template>
  <BaseLibrary
    :bulk-operations-context="route.name as Context"
    :search-input-type-on-drawer="
      route.meta.type === 'mediafiles'
        ? SearchInputType.AdvancedInputMediaFilesType
        : SearchInputType.AdvancedInputType
    "
    :enable-bulk-operations="true"
    list-item-route-name="SingleEntity"
  />
</template>

<script lang="ts" setup>
import type { Context } from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { SearchInputType } from "@/generated-types/queries";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
