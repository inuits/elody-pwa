<template>
  <BaseLibrary
    :has-simple-search="true"
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
    :search-input-type="SearchInputType.SimpleInputtype"
    :list-item-route-name="'SingleEntity'"
    :search-placeholder="$t('search.asset-library')"
    :advanced-filters-choice="'entityFilters'"
    @add-selection="addSelection"
    :enable-selection="enableSelection"
    :accepted-entity-types="acceptedEntityTypes"
  />
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import {
  SearchInputType,
  type Maybe,
} from "@/generated-types/generated-types/queries";

export default defineComponent({
  name: "AssetLibrary",
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
  components: {
    BaseLibrary,
  },
  setup: (props, { emit }) => {
    const addSelection = (id: string) => {
      emit("addSelection", id);
    };

    return {
      SearchInputType,
      addSelection,
    };
  },
});
</script>
