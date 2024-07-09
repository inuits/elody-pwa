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
          getModalInfo(TypeModals.SaveSearchPicker).state === ModalState.Show &&
          isAdvancedFiltersUpdated
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
        @confirm-selection="updateActiveFilter"
        :ignore-state-for-route="true"
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
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import { ref, inject, watch } from "vue";
import type { ApolloClient } from "@apollo/client/core";
import { DefaultApolloClient } from "@vue/apollo-composable";

// TODO(savedSearch): it doesn't request needed entities because baseLibrary uses queryVariables from session storage which is defined
// for other entities. I think we should use the useCustomQuery composable here. You can see it in useBaseLibrary from line #152

const { closeModal, getModalInfo } = useBaseModal();
const isAdvancedFiltersUpdated = ref<boolean>(false);
const apolloClient = inject(DefaultApolloClient);
const { setAdvancedFilters } = useBaseLibrary(
  apolloClient as ApolloClient<any>
);
const handleCloseModal = () => {
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.SavedSearchFilterModal
  );
  closeModal(TypeModals.SaveSearchPicker);
};
const { normalizeSavedSearchFromEntity } = useSaveSearchHepler();
const { dequeueAllItemsForBulkProcessing, setBulkSelectionLimit } =
  useBulkOperations();
setBulkSelectionLimit(BulkOperationsContextEnum.SavedSearchFilterModal, 1);
const updateActiveFilter = (selectedItems: any[]) => {
  // TODO(savedSearch): define type and normalize filters
  // TODO(savedSearch): Entity picker should limit amount of selected entities to 1
  console.log('selected: ', selectedItems);
  // setActiveFilter(normalizeSavedSearchFromEntity(selectedItems[0]));
  handleCloseModal();
};

watch(
  () => getModalInfo(TypeModals.SaveSearchPicker).state,
  async () => {
    if (getModalInfo(TypeModals.SaveSearchPicker).state === ModalState.Show) {
      dequeueAllItemsForBulkProcessing(
        BulkOperationsContextEnum.SavedSearchFilterModal
      );
      setAdvancedFilters([
        {
          type: "type",
          value: "savedSearch",
          match_exact: true,
        },
      ] as AdvancedFilterInput[]);
      isAdvancedFiltersUpdated.value = true;
    } else {
      isAdvancedFiltersUpdated.value = false;
    }
  },
  { immediate: true }
);
</script>
