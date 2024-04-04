<template>
  <div
    v-if="
      paginationLimitOptionsPromiseIsResolved && sortOptionsPromiseIsResolved
    "
    class="flex justify-between items-center w-full"
  >
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
        :total-items="
          totalItems || getStateForRoute(props.route)?.totalEntityCount || 1
        "
        @update:skip="setSkip"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from "vue-router";
import {
  DamsIcons,
  Entitytyping,
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
  type DropdownOption,
  type GetPaginationLimitOptionsQuery,
  type GetSortOptionsQuery,
} from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BasePaginationNew from "@/components/base/BasePagination.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import { apolloClient } from "@/main";
import { onMounted, ref, toRefs, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";

const props = defineProps<{
  route: RouteLocationNormalizedLoaded;
  setLimit: Function;
  setSkip: Function;
  setSortKey: Function;
  setSortOrder: Function;
  totalItems: number;
}>();

const emit = defineEmits<{
  (
    event: "paginationLimitOptionsPromise",
    paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>
  ): void;
  (
    event: "sortOptionsPromise",
    sortOptionsPromise: (entityType: Entitytyping) => Promise<void>
  ): void;
}>();

const isAsc = ref<boolean>(true);
const paginationLimitOptions = ref<DropdownOption[]>([]);
const paginationLimitOptionsPromiseIsResolved = ref<boolean>(false);
const selectedPaginationLimitOption = ref<DropdownOption>();
const selectedSkip = ref<number>(1);
const selectedSortOption = ref<DropdownOption>();
const sortOptions = ref<DropdownOption[]>([]);
const sortOptionsPromiseIsResolved = ref<boolean>(false);
const { totalItems } = toRefs(props);
const { getStateForRoute } = useStateManagement();
const { t } = useI18n();

const paginationLimitOptionsPromise = async () => {
  return apolloClient
    .query<GetPaginationLimitOptionsQuery>({
      query: GetPaginationLimitOptionsDocument,
    })
    .then((result) => {
      paginationLimitOptions.value =
        result.data?.PaginationLimitOptions.options || [];

      const state = getStateForRoute(props.route);
      const limit =
        state?.queryVariables?.limit ||
        paginationLimitOptions.value?.[0].value ||
        20;
      const skip = state?.queryVariables?.skip || 1;

      selectedPaginationLimitOption.value = paginationLimitOptions.value.find(
        (option) => option.value === limit
      );
      selectedSkip.value = skip;
      props.setLimit(limit);
      props.setSkip(skip);
      paginationLimitOptionsPromiseIsResolved.value = true;
    });
};

const sortOptionsPromise = async (entityType: Entitytyping) => {
  return apolloClient
    .query<GetSortOptionsQuery>({
      query: GetSortOptionsDocument,
      variables: { entityType },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      const sortingOptionsResult = result.data?.EntityTypeSortOptions.sortOptions;
      sortOptions.value = sortingOptionsResult?.options || [];

      const state = getStateForRoute(props.route);
      const sortKey =
        state?.queryVariables?.searchValue.order_by ||
        sortOptions.value?.[0]?.value;
      selectedSortOption.value = sortOptions.value.find(
        (option) => option.value === sortKey
      );
      let sortOrder = sortingOptionsResult?.isAsc?.toLowerCase();
      if (!sortOrder) {
        sortOrder = state?.queryVariables?.searchValue.isAsc
          ? "asc"
          : "desc";
      }
      isAsc.value = sortOrder === "asc";

      props.setSortKey(sortKey);
      props.setSortOrder(sortOrder);
      sortOptionsPromiseIsResolved.value = true;
    });
};

onMounted(() => {
  emit("paginationLimitOptionsPromise", paginationLimitOptionsPromise);
  emit("sortOptionsPromise", sortOptionsPromise);
});

const setSkip = async (newSkip: number) => {
  await props.setSkip(newSkip, true);
}
watch(
  () => selectedPaginationLimitOption.value,
  async () =>
    await props.setLimit(selectedPaginationLimitOption.value?.value, true)
);
watch(
  () => selectedSortOption.value,
  async () => await props.setSortKey(selectedSortOption.value?.value, true)
);
watch(
  () => isAsc.value,
  async () => await props.setSortOrder(isAsc.value ? "asc" : "desc", true)
);
//watch(
//  () => getModalInfo(TypeModals.BulkOperations).state,
//  (bulkOperationsModalState: ModalState) => {
//    if (bulkOperationsModalState === ModalState.Hide) {
//      setDefaultOptions();
//      if (queryVariables.value) queryVariables.value.skip = 1;
//    }
//  }
//);
</script>
