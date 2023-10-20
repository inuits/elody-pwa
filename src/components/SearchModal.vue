<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Search).state"
    :modal-position="getModalInfo(TypeModals.Search).modalPosition"
    modal-width-style="w-7/12"
    @hide-modal="closeModal(TypeModals.Search)"
  >
    <div class="bg-neutral-lightest h-full">
      <search-bar
        :input-enabled="true"
        @updateFilters="updateBaseLibraryFilters"
      />
      <div class="overflow-y-scroll h-full">
        <base-library
          v-if="getModalInfo(TypeModals.Search).state === ModalState.Show"
          :bulk-operations-context="BulkOperationsContextEnum.SearchModal"
          list-item-route-name="SingleEntity"
          :enable-advanced-filters="false"
          :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
          :enable-bulk-operations="false"
          :filters="filters"
          :is-search-library="true"
        ></base-library>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  AdvancedFilterInput,
  ModalState,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import SearchBar from "@/components/SearchBar.vue";
import { ref } from "vue";

const { getModalInfo, closeModal } = useBaseModal();
const filters = ref<AdvancedFilterInput[]>([]);

const updateBaseLibraryFilters = (updatedFilters: AdvancedFilterInput[]) => {
  filters.value = updatedFilters;
};
</script>
