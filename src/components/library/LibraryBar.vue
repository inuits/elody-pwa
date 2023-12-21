<template>
  <div class="flex justify-between items-center w-full">
    <div class="flex justify-start gap-x-3">
      <div v-if="paginationLimitOptions">
        <BaseDropdownNew
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
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
        v-model:skip="skip"
        :limit="selectedPaginationLimitOption?.value ?? NaN"
        :total-items="totalItems"
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
import { ref, toRefs, watch } from "vue";
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

const {
  paginationLimitOptions,
  sortOptions,
  queryVariables,
  libraryBarInitializationStatus,
} = toRefs(props);
const { getModalInfo } = useBaseModal();
const { setSelectedPaginationLimitOption, selectedPaginationLimitOption } = useLibraryBar();
const { t } = useI18n();
const skip = ref<number>(1);
const isAsc = ref<boolean>(false);

const selectedSortOption = ref<DropdownOption>();

const setDefaultOptions = () => {
  setSelectedPaginationLimitOption(paginationLimitOptions.value?.[0]);
  selectedSortOption.value = sortOptions.value?.[0];
};

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
watch(skip, () => {
  if (queryVariables.value) queryVariables.value.skip = skip.value;
});
watch(
  () => queryVariables.value?.skip,
  () => {
    if (queryVariables.value.skip) skip.value = queryVariables.value.skip;
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
