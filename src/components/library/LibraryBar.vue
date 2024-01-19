<template>
  <div class="flex justify-between items-center w-full">
    <div class="flex justify-start gap-x-3">
      <div v-if="paginationLimitOptions">
        <BaseDropdownNew
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
          :select-first-option-by-default="true"
          label-position="inline"
          label-alignment="right"
          dropdown-style="default"
        />
      </div>
      <div v-if="sortOptions" class="w-auto">
        <BaseDropdownNew
          v-model="selectedSortOption"
          :options="sortOptions"
          :label="t('library.sort')"
          :select-first-option-by-default="true"
          label-position="inline"
          label-alignment="left"
          dropdown-style="default"
        />
      </div>
      <div v-if="sortOptions" class="flex items-center">
        <BaseToggle
          v-model="isAsc"
          :icon-on="DamsIcons.AngleUp"
          :icon-off="DamsIcons.AngleDown"
          :icon-height="24"
        />
      </div>
    </div>
    <div class="flex justify-end">
      <BasePaginationNew
        v-model:skip="selectedSkip"
        :limit="selectedPaginationLimitOption?.value ?? NaN"
        :total-items="totalItemsCount"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  DamsIcons,
  ModalState,
  TypeModals,
  type DropdownOption,
  type GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BasePaginationNew from "@/components/base/BasePaginationNew.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import { toRefs, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useLibraryBar } from "@/composables/useLibraryBar";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  paginationLimitOptions: DropdownOption[];
  sortOptions: DropdownOption[];
  totalItems: number;
  queryVariables: GetEntitiesQueryVariables;
  libraryBarInitializationStatus:
    | "not-initialized"
    | "inProgress"
    | "initialized";
}>();

const { libraryBarInitializationStatus } = toRefs(props);
const { getModalInfo } = useBaseModal();
const {
  setSelectedPaginationLimitOption,
  selectedPaginationLimitOption,
  setSelectedSkip,
  selectedSkip,
  setSelectedSortOption,
  selectedSortOption,
  setQueryVariables,
  queryVariables,
  setTotalItemsCount,
  totalItemsCount,
  isAsc,
} = useLibraryBar();
const { t } = useI18n();

const setDefaultOptions = () => {
  setQueryVariables(props.queryVariables);
  setSelectedPaginationLimitOption(props.paginationLimitOptions.value?.[0]);
  setSelectedSkip(1);
  setSelectedSortOption(props.sortOptions.value?.[0]);
  if (!Number.isNaN(props.totalItems))
    setTotalItemsCount(props.totalItems);
};

watch(
  () => props.totalItems,
  () => setTotalItemsCount(props.totalItems)
);
watch(
  () => libraryBarInitializationStatus.value,
  () => {
    if (libraryBarInitializationStatus.value === "initialized")
      setDefaultOptions();
  }
);
watch(
  () => selectedSortOption.value,
  () => {
    if (queryVariables.value) {
      queryVariables.value.searchValue.order_by =
        selectedSortOption.value?.value;
    }
  }
);
watch(selectedPaginationLimitOption, () => {
  if (queryVariables.value) {
    queryVariables.value.limit = selectedPaginationLimitOption.value?.value;
    queryVariables.value.skip = 1;
  }
});
watch(isAsc, () => {
  if (queryVariables.value) {
    queryVariables.value.searchValue.isAsc = isAsc.value;
  }
});
watch(selectedSkip, () => {
  if (queryVariables.value)
    queryVariables.value.skip = selectedSkip.value?.value;
});
watch(
  () => queryVariables.value?.skip,
  () => {
    if (queryVariables.value?.skip)
      selectedSkip.value = {
        label: `${queryVariables.value.skip}`,
        value: queryVariables.value.skip,
      };
  }
);
watch(
  () => getModalInfo(TypeModals.BulkOperations).state,
  (bulkOperationsModalState: ModalState) => {
    if (bulkOperationsModalState === ModalState.Hide) {
      setDefaultOptions();
      if (queryVariables.value) queryVariables.value.skip = 1;
    }
  }
);
</script>
