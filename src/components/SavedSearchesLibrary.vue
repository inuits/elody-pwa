<template>
  <BaseLibrary
    :isSavedSearches="true"
    :hasFilters="false"
    :has-simple-search="true"
    :search-input-type="SearchInputType.AdvancedSavedSearchType"
    :list-item-route-name="'SavedSearch'"
    :search-placeholder="'Search Saved Searches...'"
    :advanced-filters-choice="'entityFilters'"
    @add-selection="addSelection"
    :enable-selection="enableSelection"
  />
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent } from "vue";
import { SearchInputType } from "@/queries";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";

export default defineComponent({
  name: "SavedSearchesLibrary",
  props: {
    enableSelection: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["addSelection"],
  components: {
    BaseLibrary,
  },
  setup: (props, { emit }) => {
    const { pickedSavedSearch, closeSearchSavedSearchesModal } =
      useSavedSearchHelper();

    const addSelection = (entity: any) => {
      pickedSavedSearch.value = entity;
      closeSearchSavedSearchesModal();
    };

    return {
      SearchInputType,
      addSelection,
    };
  },
});
</script>
