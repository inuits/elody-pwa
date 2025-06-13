<template>
  <base-modal
    :modal-type="TypeModals.SaveSearchPicker"
    modal-color="bg-neutral-white"
    @hide-modal="handleCloseModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col overflow-auto">
      <BaseLibrary
        v-if="getModalInfo(TypeModals.SaveSearchPicker).open"
        :search-input-type="SearchInputType.AdvancedSavedSearchType"
        :search-placeholder="$t('saved-searches.search-saved-searches')"
        :confirm-selection-button="true"
        :enable-navigation="false"
        :enable-bulk-operations="true"
        :disable-new-entity-previews="true"
        :enableAdvancedFilters="true"
        :entityType="Entitytyping.SavedSearch"
        :enable-selection="true"
        :bulk-operations-context="
          BulkOperationsContextEnum.SavedSearchFilterModal
        "
        :enable-save-search-filters="false"
        :should-use-state-for-route="false"
        @confirm-selection="updateActiveFilter"
      />
    </div>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "../base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  TypeModals,
  Entitytyping,
  SearchInputType,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";

const { closeModal, getModalInfo } = useBaseModal();
const handleCloseModal = () => {
  closeModal(TypeModals.SaveSearchPicker);
};
const {
  normalizeSavedSearchFromEntity,
  fetchSavedSearchById,
  setActiveFilter,
} = useSaveSearchHepler();
const { dequeueAllItemsForBulkProcessing, setBulkSelectionLimit } =
  useBulkOperations();

setBulkSelectionLimit(BulkOperationsContextEnum.SavedSearchFilterModal, 1);

const updateActiveFilter = async (selectedItems: InBulkProcessableItem[]) => {
  const savedFilter = await fetchSavedSearchById(selectedItems[0].id);
  setActiveFilter(normalizeSavedSearchFromEntity(savedFilter));
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.SavedSearchFilterModal,
  );
  handleCloseModal();
};
</script>
