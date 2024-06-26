<template>
  <BaseLibrary
    :search-input-type="SearchInputType.AdvancedSavedSearchType"
    :search-placeholder="$t('saved-searches.search-saved-searches')"
    :confirm-selection-button="true"
    :enable-navigation="false"
    :enable-bulk-operations="true"
    :disable-new-entity-previews="true"
    :enableAdvancedFilters="false"
    @add-selection="addSelection"
    :entityType="Entitytyping.Asset"
    :enable-selection="true"
    :bulk-operations-context="BulkOperationsContextEnum.SavedSearchFilterModal"
  />
</template>

<script setup lang="ts">
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { Entitytyping, SearchInputType } from "@/generated-types/queries";
import { useSavedSearchHelper } from "@/composables/useSavedSearchHelper";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

const { closeSearchSavedSearchesModal, setPickedSavedSearch } =
  useSavedSearchHelper();

const addSelection = (entity: any) => {
  setPickedSavedSearch(entity);
  closeSearchSavedSearchesModal();
  // TODO(savedSearch): remove this component
};
</script>
