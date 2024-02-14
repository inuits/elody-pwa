<template>
  <div class="flex justify-between items-center w-full">
    <div class="flex justify-start gap-x-3">
      <div v-if="paginationLimitOptions">
        <BaseDropdownNew
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
          :select-first-option-by-default="false"
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
          :select-first-option-by-default="false"
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
import { useI18n } from "vue-i18n";
import { useLibraryBar } from "@/composables/useLibraryBar";

const props = defineProps<{
  paginationLimitOptions: DropdownOption[];
  sortOptions: DropdownOption[];
  totalItems: number;
  queryVariables: GetEntitiesQueryVariables;
  entitiesLoading: boolean;
  libraryBarInitializationStatus:
    | "not-initialized"
    | "inProgress"
    | "initialized";
}>();

const { entitiesLoading, libraryBarInitializationStatus } = toRefs(props);
const { getModalInfo } = useBaseModal();
const { t } = useI18n();
const {
  isAsc,
  queryVariables,
  selectedPaginationLimitOption,
  selectedSkip,
  selectedSortOption,
  setIsAsc,
  setQueryVariables,
  setSelectedPaginationLimitOption,
  setSelectedSkip,
  setSelectedSortOption,
  setTotalItemsCount,
  totalItemsCount,
} = useLibraryBar();

const setDefaultOptions = () => {
  setQueryVariables(props.queryVariables);
  setSelectedPaginationLimitOption(
    props.paginationLimitOptions.find(
      (option) => option.value === props.queryVariables.limit
    )
  );
  setSelectedSkip(props.queryVariables.skip || 1);
  setSelectedSortOption(
    props.sortOptions.find(
      (option) => option.value === props.queryVariables.searchValue.order_by
    )
  );
  setIsAsc(props.queryVariables.searchValue.isAsc || isAsc.value);
  if (!Number.isNaN(props.totalItems)) setTotalItemsCount(props.totalItems);
};

watch(
  () => props.totalItems,
  () => setTotalItemsCount(props.totalItems)
);
watch(
  () => [libraryBarInitializationStatus.value, entitiesLoading.value],
  () => {
    if (
      libraryBarInitializationStatus.value === "initialized" &&
      !entitiesLoading.value
    )
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
  if (queryVariables.value)
    queryVariables.value.limit = selectedPaginationLimitOption.value?.value;
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
