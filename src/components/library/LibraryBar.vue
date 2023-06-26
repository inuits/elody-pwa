<template>
  <div class="flex justify-between items-center w-full">
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
      <div class="py-1 flex items-center">
        <SingleIconToggle
          :icon-on="Unicons.AngleUp.name"
          :icon-off="Unicons.AngleDown.name"
          @update:checked="isAsc = !isAsc"
        />
      </div>
    </div>
    <div class="flex justify-end">
      <BasePaginationNew
        v-model:skip="skip"
        :limit="selectedPaginationLimitOption?.value ?? NaN"
        :total-items="totalItems"
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
import SingleIconToggle from "../toggles/SingleIconToggle.vue";
import { Unicons } from "../../types";

defineProps<{
  totalItems: number;
}>();

const emit = defineEmits<{
  (event: "update:skip", skip: number): void;
  (event: "update:limit", limit: number): void;
  (event: "update:sortKey", limit: any): void;
  (event: "update:isAsc", limit: any): void;
}>();

const skip = ref<number>(1);
const { getModal } = useAvailableModals();

const selectedPaginationLimitOption = ref<DropdownOption>();
const paginationLimitOptions = ref<DropdownOption[]>([]);
const { onResult: onPaginationLimitOptionsResult } =
  useQuery<GetPaginationLimitOptionsQuery>(GetPaginationLimitOptionsDocument);
onPaginationLimitOptionsResult((result) => {
  paginationLimitOptions.value =
    result.data?.PaginationLimitOptions.options ?? [];
  selectedPaginationLimitOption.value = paginationLimitOptions.value[0];
});

const selectedSortOption = ref<DropdownOption>();
const sortOptions = ref<DropdownOption[]>([]);
const { onResult: onSortOptionsResult, refetch: refetchSortOptions } =
  useQuery<GetSortOptionsQuery>(GetSortOptionsDocument);
onSortOptionsResult((result) => {
  sortOptions.value = result.data?.SortOptions.options ?? [];
  selectedSortOption.value = sortOptions.value[0];
});

const isAsc = ref<boolean>(false);

watch(skip, () => emit("update:skip", skip.value));
watch(isAsc, () => emit("update:isAsc", isAsc.value));
watch(
  () => selectedSortOption.value,
  () => {
    emit("update:sortKey", selectedSortOption.value?.value);
  }
);
watch(selectedPaginationLimitOption, () => {
  skip.value = 1;
  emit("update:limit", selectedPaginationLimitOption.value?.value);
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
      skip.value = 1;
    }
  }
);
</script>
