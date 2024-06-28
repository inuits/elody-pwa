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
        :enableAdvancedFilters="true"
        :entityType="Entitytyping.SavedSearch"
        :enable-selection="true"
        :bulk-operations-context="
          BulkOperationsContextEnum.SavedSearchFilterModal
        "
        :enableSaveSearchFilters="false"
        :limit-selections="1"
        @confirm-selection="updateActiveFilter"
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
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";

// TODO(savedSearch): it doesn't request needed entities because baseLibrary uses queryVariables from session storage which is defined
// for other entities. I think we should use the useCustomQuery composable here. You can see it in useBaseLibrary from line #152

const { closeModal, getModalInfo } = useBaseModal();
const handleCloseModal = () => {
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.SavedSearchFilterModal
  );
  closeModal(TypeModals.SaveSearchPicker);
};
const { setActiveFilter } = useSaveSearchHepler();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const updateActiveFilter = (selectedItems: any[]) => {
  // TODO(savedSearch): define type and normalize filters
  // TODO(savedSearch): Entity picker should limit amount of selected entities to 1
  setActiveFilter({
    id: 13,
    title: "my filter from picker",
    value: [
      {
        type: "type",
        value: "asset",
        match_exact: true,
      },
      {
        type: "text",
        key: ["elody:1|metadata.title.value"],
        value: "2",
        match_exact: false,
      },
    ],
  });
  handleCloseModal();
};
</script>
