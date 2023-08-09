<template>
  <div class="flex justify-between items-center w-full">
    <div class="flex justify-start gap-x-3">
      <div class="w-32">
        <BaseDropdownNew
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
          label-alignment="right"
          dropdown-style="default"
        />
      </div>
      <div class="w-72">
        <BaseDropdownNew
          class="py-1"
          v-model="selectedSortOption"
          :options="sortOptions"
          :label="t('library.sort')"
          label-alignment="left"
          dropdown-style="default"
        />
      </div>
      <div class="py-1 flex items-center">
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
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
  ModalState,
  TypeModals,
  type DropdownOption,
  type GetPaginationLimitOptionsQuery,
  type GetSortOptionsQuery,
  type GetEntitiesQueryVariables,
} from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BasePaginationNew from "@/components/base/BasePaginationNew.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import { computed, ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  totalItems: number;
  queryVariables?: GetEntitiesQueryVariables;
}>();

const { t } = useI18n();
const { getModal } = useAvailableModals();
const skip = ref<number>(1);
const isAsc = ref<boolean>(false);
const route = useRoute();
const queryVariablesRef = ref<GetEntitiesQueryVariables | undefined>(
  props.queryVariables
);

const selectedPaginationLimitOption = ref<DropdownOption>();
const paginationLimitOptions = ref<DropdownOption[]>([]);
const { onResult: onPaginationLimitOptionsResult } =
  useQuery<GetPaginationLimitOptionsQuery>(
    GetPaginationLimitOptionsDocument,
    undefined,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );
onPaginationLimitOptionsResult((result) => {
  paginationLimitOptions.value =
    result.data?.PaginationLimitOptions.options ?? [];
  selectedPaginationLimitOption.value = paginationLimitOptions.value[0];
});

const selectedSortOption = ref<DropdownOption>();
const sortOptions = ref<DropdownOption[]>([]);
const entityType = computed(() => route.meta.entityType || "BaseLibrary");
const { onResult: onSortOptionsResult, refetch: refetchSortOptions } =
  useQuery<GetSortOptionsQuery>(
    GetSortOptionsDocument,
    { entityType: entityType.value },
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    }
  );
onSortOptionsResult((result) => {
  sortOptions.value =
    result.data?.EntityTypeSortOptions?.sortOptions?.options ?? [];
  selectedSortOption.value = sortOptions.value[0];
});

watch(skip, () => {
  if (queryVariablesRef.value) {
    queryVariablesRef.value.skip = skip.value;
  }
});
watch(isAsc, () => {
  if (queryVariablesRef.value) {
    queryVariablesRef.value.searchValue.isAsc = isAsc.value;
  }
});
watch(
  () => selectedSortOption.value,
  () => {
    if (queryVariablesRef.value) {
      queryVariablesRef.value.searchValue.order_by =
        selectedSortOption.value?.value;
    }
  }
);
watch(
  () => entityType.value,
  () => refetchSortOptions({ entityType: entityType.value })
);
watch(selectedPaginationLimitOption, () => {
  if (queryVariablesRef.value) {
    queryVariablesRef.value.skip = 1;
    queryVariablesRef.value.limit = selectedPaginationLimitOption.value?.value;
  }
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
      if (queryVariablesRef.value) {
        queryVariablesRef.value.skip = 1;
      }
    }
  }
);
</script>
