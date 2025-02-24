<template>
  <BaseModal
    :modal-type="TypeModals.Search"
    :cancel-button-availabe="false"
    @hide-modal="closeModal(TypeModals.Search)"
  >
    <div class="bg-neutral-lightest h-full">
      <search-bar
        :input-enabled="true"
        @updateFilters="updateBaseLibraryFilters"
        @update-advanced-search-filters="updateAdvancedSearchFilters"
      />
      <div class="overflow-y-scroll h-full">
        <base-library
          v-if="isModalOpened && !entitiesLoading"
          :bulk-operations-context="BulkOperationsContextEnum.SearchModal"
          list-item-route-name="SingleEntity"
          :enable-advanced-filters="false"
          :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
          :enable-bulk-operations="true"
          :filters="filters"
          :is-search-library="true"
          :predefinedEntities="hasAdvancedSearchEnabled ? items : undefined"
          :ignore-fetching-data="hasAdvancedSearchEnabled"
        ></base-library>
        <div v-else >
          <div
            data-cy="base-library-grid-container"
            id="gridContainer"
          >
            <ViewModesList
              :entities="createPlaceholderEntities(20) as Entity[]"
              :entities-loading="true"
              :mode="'list'"
            />
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  type AdvancedFilterInput,
  type Entity,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import SearchBar from "@/components/SearchBar.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { ref, inject, computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  useAdvancedSearch,
  type AdvancedSearchFilters,
} from "@/composables/useAdvancedSearch";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import { createPlaceholderEntities } from "@/helpers";

const config: any = inject("config");
const { closeModal } = useBaseModal();
const { setFilters, getEntities, items, entitiesLoading } = useAdvancedSearch(config);
const filters = ref<AdvancedFilterInput[]>([]);

const hasAdvancedSearchEnabled = computed(() => {
  return !!config.features.advancedSearch;
});

const isModalOpened = ref<boolean>(false);

const updateBaseLibraryFilters = (
  updatedFilters: AdvancedFilterInput[],
  isOpenModal: boolean,
) => {
  if (hasAdvancedSearchEnabled.value) return;
  filters.value = updatedFilters;
  isModalOpened.value = isOpenModal;
};

const updateAdvancedSearchFilters = async (
  newFilters: AdvancedSearchFilters,
  isOpenModal: boolean,
) => {
  if (!hasAdvancedSearchEnabled.value || !isOpenModal) return;

  setFilters(newFilters as AdvancedSearchFilters);
  await getEntities();
  isModalOpened.value = isOpenModal;
};
</script>
