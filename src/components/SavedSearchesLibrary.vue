<template>
  <BaseLibrary
    :hasFilters="false"
    :has-simple-search="true"
    :search-input-type="SearchInputType.AdvancedSavedSearchType"
    :list-item-route-name="'SavedSearch'"
    :search-placeholder="$t('saved-searches.search-saved-searches')"
    :advanced-filters-choice="'entityFilters'"
    @add-selection="addSelection"
    :enable-selection="true"
    :isHideFilters="true"
    bulk-operations-context="savedSearches"
  />
</template>

<script lang="ts">
import BaseLibrary from "@/components/base/BaseLibrary.vue";
import { defineComponent } from "vue";
import { SearchInputType } from "@/generated-types/queries";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";

export default defineComponent({
  name: "SavedSearchesLibrary",
  components: {
    BaseLibrary,
  },
  props: {
    enableSelection: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["addSelection"],
  setup: () => {
    const { closeSearchSavedSearchesModal, setPickedSavedSearch } =
      useSavedSearchHelper();

    const addSelection = (entity: any) => {
      setPickedSavedSearch(entity);
      closeSearchSavedSearchesModal();
    };

    return {
      SearchInputType,
      addSelection,
    };
  },
});
</script>
