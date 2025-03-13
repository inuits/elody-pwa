<template>
  <BaseModal
    :modal-type="TypeModals.SearchAi"
    :cancel-button-availabe="false"
    @hide-modal="closeModal(TypeModals.SearchAi)"
  >
    <div class="bg-neutral-lightest h-full">
      <search-bar-ai
        :input-enabled="true"
        @updateFilters="updateBaseLibraryFilters"
        @update-ai-search-filters="updateAiSearchFilters"
      />
      <div class="overflow-y-scroll h-full">
        <base-library
          v-if="isModalOpened && !entitiesLoading"
          :bulk-operations-context="BulkOperationsContextEnum.SearchModalAi"
          list-item-route-name="SingleEntity"
          :enable-advanced-filters="false"
          :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
          :enable-bulk-operations="true"
          :filters="filters"
          :is-search-library="true"
          :predefinedEntities="hasAiSearchEnabled ? items : undefined"
          :ignore-fetching-data="hasAiEnabled"
        ></base-library>
        <div v-else>
          <div data-cy="base-library-grid-container" id="gridContainer">
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
import SearchBarAi from "@/components/SearchBarAi.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { ref, inject, computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useAiSearch, type AiSearchFilters } from "@/composables/useAiSearch";
import ViewModesList from "@/components/library/view-modes/ViewModesList.vue";
import { createPlaceholderEntities } from "@/helpers";

const config: any = inject("config");
const { closeModal } = useBaseModal();
const { setFilters, getEntities, items, entitiesLoading } = useAiSearch(config);
const filters = ref<AdvancedFilterInput[]>([]);

const hasAiSearchEnabled = computed(() => {
  return !!config.features?.aiSearch?.hasAiSearch;
});

const isModalOpened = ref<boolean>(false);

const updateBaseLibraryFilters = (
  updatedFilters: AdvancedFilterInput[],
  isOpenModal: boolean,
) => {
  if (hasAiSearchEnabled.value) return;
  filters.value = updatedFilters;
  isModalOpened.value = isOpenModal;
};

const updateAiSearchFilters = async (
  newFilters: AiSearchFilters,
  isOpenModal: boolean,
) => {
  if (!hasAiSearchEnabled.value || !isOpenModal) return;

  setFilters(newFilters as AiSearchFilters);
  await getEntities();
  isModalOpened.value = isOpenModal;
};
</script>
