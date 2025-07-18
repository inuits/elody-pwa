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
          :predefinedEntities="hasAdvancedSearchEnabled ? items : undefined"
          :ignore-fetching-data="hasAdvancedSearchEnabled"
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
import { computed, inject, ref } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type AdvancedSearchFilters,
  useAdvancedSearch,
} from "@/composables/useAdvancedSearch";

const config: any = inject("config");
const { closeModal } = useBaseModal();
const { setFilters, getEntities, items } = useAdvancedSearch(config);
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
