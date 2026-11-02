<template>
  <BaseModal
    class="bg-surface h-[70vh]"
    :modal-type="TypeModals.Search"
    :cancel-button-availabe="false"
    :title="t('search.simple-search')"
    @hide-modal="closeModal(TypeModals.Search)"
  >
    <!-- the results scroll inside the modal, under the field -->
    <div class="flex flex-col gap-4 h-full min-h-0 p-4">
      <search-bar
        :input-enabled="true"
        @search="handleSearch"
      />
      <div
        v-if="isModalOpened && filters.length"
        class="flex-1 min-h-0 overflow-y-auto"
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
          :force-list-view="true"
          :entity-type="
            filters.find((filter) => filter.type === AdvancedFilterTypes.Type)
              ?.value || Entitytyping.BaseEntity
          "
        />
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
import { provide, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useSimpleSearch } from "@/composables/useSimpleSearch";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();
const { buildFilters } = useSimpleSearch();
const isModalOpened = ref<boolean>(false);
// the modal is the chrome: no grey well or band of the list's own (L25)
provide("InsidePanel", true);
const filters = ref<AdvancedFilterInput[]>([]);

const handleSearch = (term: string) => {
  filters.value = buildFilters(term);
  isModalOpened.value = true;
};

watch(
  () => getModalInfo(TypeModals.Search).open,
  (modalIsOpen: boolean | undefined) => {
    if (!modalIsOpen) {
      filters.value = [];
      isModalOpened.value = false;
    }
  },
);
</script>
