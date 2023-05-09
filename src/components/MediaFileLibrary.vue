<template>
  <BaseLibrary
    :hasSimpleSearch="false"
    :search-input-type-on-drawer="SearchInputType.AdvancedInputMediaFilesType"
    :search-input-type="SearchInputType.AdvancedInputMediaFilesType"
    :list-item-route-name="'SingleMediafile'"
    :search-placeholder="$t('search.mediafile-library')"
    :advanced-filters-choice="'mediaFileFilters'"
    :enable-selection="enableSelection"
    :already-added-metadata="selectedRelationFieldMetadata"
    bulk-operations-context="mediafilesPage"
    @add-selection="addSelection"
  />
</template>

<script lang="ts">
import BaseLibrary from "./base/BaseLibrary.vue";
import { defineComponent } from "vue";
import { SearchInputType } from "../generated-types/queries";
import selectedRelationFieldMetadata from "../composables/useOldFormHelpers";

export default defineComponent({
  name: "MediaFileLibrary",
  components: {
    BaseLibrary,
  },
  emits: ["addSelection"],
  props: {
    enableSelection: {
      type: Boolean,
      default: false,
    },
  },
  setup: (props, { emit }) => {
    const addSelection = (entity: any) => {
      emit("addSelection", entity);
    };

    return {
      SearchInputType,
      addSelection,
      selectedRelationFieldMetadata,
    };
  },
});
</script>
