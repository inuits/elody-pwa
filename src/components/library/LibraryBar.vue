<template>
  <div class="flex justify-between items-center">
    <div class="flex justify-start gap-x-3">
      <div class="w-32">
        <BaseDropdownNew
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="$t('library.items')"
          label-alignment="right"
          dropdown-style="default"
        />
      </div>
      <div class="w-72">
        <BaseDropdownNew
          class="py-1"
          v-model="selectedSortOption"
          :options="sortOptions"
          :label="$t('library.sort')"
          label-alignment="left"
          dropdown-style="default"
        />
      </div>
    </div>
    <div class="flex justify-end">
      <BasePaginationNew
        :skip="1"
        :limit="selectedPaginationLimitOption?.value ?? NaN"
        :total-items="31"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BasePaginationNew from "@/components/base/BasePaginationNew.vue";
import {
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
  ModalState,
  TypeModals,
  type DropdownOption,
  type GetPaginationLimitOptionsQuery,
  type GetSortOptionsQuery,
} from "@/generated-types/queries";
import { ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useQuery } from "@vue/apollo-composable";

const { getModal } = useAvailableModals();

const selectedPaginationLimitOption = ref<DropdownOption>();
const paginationLimitOptions = ref<DropdownOption[]>([]);
const { onResult: onPaginationLimitOptionsResult } =
  useQuery<GetPaginationLimitOptionsQuery>(GetPaginationLimitOptionsDocument);
onPaginationLimitOptionsResult((result) => {
  paginationLimitOptions.value = result.data.PaginationLimitOptions.options;
  selectedPaginationLimitOption.value = paginationLimitOptions.value[0];
});

const selectedSortOption = ref<DropdownOption>();
const sortOptions = ref<DropdownOption[]>([]);
const { onResult: onSortOptionsResult } = useQuery<GetSortOptionsQuery>(
  GetSortOptionsDocument
);
onSortOptionsResult((result) => {
  sortOptions.value = result.data.SortOptions.options;
  selectedSortOption.value = sortOptions.value[0];
});

watch(
  () => getModal(TypeModals.BulkOperations).modalState.value.state,
  () => {
    if (
      getModal(TypeModals.BulkOperations).modalState.value.state ===
      ModalState.Hide
    ) {
      selectedPaginationLimitOption.value = paginationLimitOptions.value[0];
      selectedSortOption.value = sortOptions.value[0];
    }
  }
);
</script>
