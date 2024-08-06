<template>
  <BaseModal
    :modal-type="TypeModals.Search"
    :cancel-button-availabe="false"
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
          v-if="getModalInfo(TypeModals.Search).open"
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
import {
  type AdvancedFilterInput,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import SearchBar from "@/components/SearchBar.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { ref } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";

const { getModalInfo, closeModal } = useBaseModal();
const filters = ref<AdvancedFilterInput[]>([]);

const updateBaseLibraryFilters = (updatedFilters: AdvancedFilterInput[]) => {
  filters.value = updatedFilters;
};
</script>
