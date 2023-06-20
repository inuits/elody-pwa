<template>
  <BaseLibrary
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
    :list-item-route-name="'SingleEntity'"
    :search-placeholder="$t('search.asset-library')"
    :advanced-filters-choice="entityType"
    :accepted-entity-types="acceptedEntityTypes"
    :bulk-operations-context="route.name as Context"
  />
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent, computed } from "vue";
import type { PropType } from "vue";
import { SearchInputType, type Maybe } from "@/generated-types/queries";
import { useRoute } from "vue-router";
import type { Context } from "@/composables/useBulkOperations";

export default defineComponent({
  name: "AssetLibrary",
  components: { BaseLibrary },
  props: {
    acceptedEntityTypes: {
      type: Array as PropType<Maybe<string>[]>,
      default: () => [],
      required: false,
    },
  },
  emits: ["addSelection"],
  setup: () => {
    const route = useRoute();

    const entityType = computed<string>(() => {
      return route.meta.entityType ? route.meta.EntityType : "baseEntity";
    });

    return {
      SearchInputType,
      route,
      entityType,
      Context,
    };
  },
});
</script>
