<template>
  <BaseLibrary
    :has-simple-search="false"
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
    :search-input-type="SearchInputType.SimpleInputtype"
    :list-item-route-name="'SingleEntity'"
    :search-placeholder="$t('search.asset-library')"
    :advanced-filters-choice="'entityFilters'"
    @add-selection="addSelection"
    :enable-selection="enableSelection"
    :accepted-entity-types="acceptedEntityTypes"
    :bulk-operations-context="route.name as Context"
  />
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { SearchInputType, type Maybe } from "@/generated-types/queries";
import { useRoute } from "vue-router";
import type { Context } from "@/composables/useBulkOperations";

export default defineComponent({
  name: "AssetLibrary",
  components: { BaseLibrary },
  props: {
    enableSelection: {
      type: Boolean,
      default: false,
    },
    acceptedEntityTypes: {
      type: Array as PropType<Maybe<string>[]>,
      default: () => [],
      required: false,
    },
  },
  emits: ["addSelection"],
  setup: (props, { emit }) => {
    const route = useRoute();
    const addSelection = (id: string) => {
      emit("addSelection", id);
    };

    return {
      SearchInputType,
      addSelection,
      route,
    };
  },
});
</script>
