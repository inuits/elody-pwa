<template>
  <BaseModal
    class="bg-background-normal"
    :modal-type="TypeModals.Search"
    :cancel-button-availabe="false"
    @hide-modal="closeModal(TypeModals.Search)"
  >
    <div class="bg-background-normal h-full">
      <h1 class="title pb-4 text-center">
        {{ t("search.simple-search") }}
      </h1>
      <search-bar
        :input-enabled="true"
        @updateFilters="updateBaseLibraryFilters"
      />
      <div
        v-if="isModalOpened && filters.length"
        class="overflow-y-scroll h-full"
      >
        <base-library
          :bulk-operations-context="BulkOperationsContextEnum.SearchModal"
          list-item-route-name="SingleEntity"
          :enable-advanced-filters="false"
          :search-input-type-on-drawer="SearchInputType.AdvancedInputType"
          :enable-bulk-operations="true"
          :filters="filters"
          :should-use-state-for-route="false"
          :is-search-library="true"
          :entity-type="
            filters.find((filter) => filter.type === AdvancedFilterTypes.Type)
              ?.value || Entitytyping.BaseEntity
          "
        ></base-library>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {
  type AdvancedFilterInput,
  Entitytyping,
  SearchInputType,
  TypeModals,
  AdvancedFilterTypes,
} from "@/generated-types/queries";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import SearchBar from "@/components/SearchBar.vue";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import { ref } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { closeModal } = useBaseModal();
const filters = ref<AdvancedFilterInput[]>([]);
const isModalOpened = ref<boolean>(false);

const updateBaseLibraryFilters = (
  updatedFilters: AdvancedFilterInput[],
  isOpenModal: boolean,
) => {
  filters.value = updatedFilters;
  isModalOpened.value = isOpenModal;
};
</script>
