<template>
  <base-modal
    :modal-state="getModalInfo(TypeModals.SaveSearchPicker).state"
    :modal-position="getModalInfo(TypeModals.SaveSearchPicker).modalPosition"
    modal-width-style="w-10/12"
    modal-color="bg-neutral-white"
    modalHeightStyle="h-[75vh] my-[12.5vh]"
    @hide-modal="handleCloseModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col overflow-auto">
      <BaseLibrary
        v-if="
          getModalInfo(TypeModals.SaveSearchPicker).state === ModalState.Show
        "
        :search-input-type="SearchInputType.AdvancedSavedSearchType"
        :search-placeholder="$t('saved-searches.search-saved-searches')"
        :confirm-selection-button="true"
        :enable-navigation="false"
        :enable-bulk-operations="true"
        :disable-new-entity-previews="true"
        :enableAdvancedFilters="false"
        :entityType="Entitytyping.Asset"
        :enable-selection="true"
        :bulk-operations-context="
          BulkOperationsContextEnum.SavedSearchFilterModal
        "
        @confirm-selection="
          async (selectedItems) => {
            // TODO(savedSearch): update active filter
          }
        "
      />
    </div>
  </base-modal>
</template>
<script setup lang="ts">
import BaseModal from "./base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  TypeModals,
  ModalState,
  Entitytyping,
  SearchInputType,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

const { closeModal, getModalInfo } = useBaseModal();
const handleCloseModal = () => {
  closeModal(TypeModals.SaveSearchPicker);
};
</script>
