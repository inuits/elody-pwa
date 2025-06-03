<template>
  <div
    v-if="
      paginationLimitOptionsPromiseIsResolved && sortOptionsPromiseIsResolved
    "
    class="flex justify-between items-center w-full"
    :class="[
      { 'flex-wrap': filtersAvailableOnDetailPage },
      { 'flex-nowrap': !filtersAvailableOnDetailPage },
    ]"
  >
    <div class="flex justify-start gap-x-3">
      <div v-if="paginationLimitOptions.length > 0">
        <AdvancedDropdown
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
        />
      </div>
      <div v-if="sortOptions.length > 0" class="w-auto">
        <AdvancedDropdown
          data-cy="sort-options"
          v-model="selectedSortOption"
          :options="sortOptions"
          :label="t('library.sort')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
        />
      </div>
      <div v-if="sortOptions.length > 0" class="flex items-center">
        <AdvancedDropdown
          data-cy="sort-toggle"
          v-model="selectedSortDirection"
          :options="sortDirectionOptions"
          :label="t('library.sort-direction')"
          :clearable="false"
          :add-icon-to-value="true"
          label-position="inline"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import {
  DamsIcons,
  type DropdownOption,
  type Entitytyping,
  GetPaginationLimitOptionsDocument,
  type GetPaginationLimitOptionsQuery,
  GetSortOptionsDocument,
  type GetSortOptionsQuery,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

const props = withDefaults(
  defineProps<{
    setLimit: Function;
    setSortKey: Function;
    setSortOrder: Function;
    filtersAvailableOnDetailPage?: boolean;
  }>(),
  {
    filtersAvailableOnDetailPage: false,
  },
);

const emit = defineEmits<{
  (
    event: "paginationLimitOptionsPromise",
    paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
  (
    event: "sortOptionsPromise",
    sortOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
}>();

const isAsc = ref<boolean>(false);
const paginationLimitOptions = ref<DropdownOption[]>([]);
const paginationLimitOptionsPromiseIsResolved = ref<boolean>(false);
const selectedPaginationLimitOption = ref<number>();
const selectedSortOption = ref<any>();
const sortOptions = ref<DropdownOption[]>([]);
const sortOptionsPromiseIsResolved = ref<boolean>(false);
const selectedSortDirection = ref<any>();
const sortDirectionOptions = ref<DropdownOption[]>([
  { label: "library.desc", value: "desc", icon: DamsIcons.SortDown },
  { label: "library.asc", value: "asc", icon: DamsIcons.SortUp },
]);
const { getStateForRoute } = useStateManagement();
const { t } = useI18n();
const route = useRoute();

const setIsAsc = (sortDirection: 'asc' | 'desc') => {
  isAsc.value = sortDirection === 'asc';
}

const paginationLimitOptionsPromise = async () => {
  return apolloClient
    .query<GetPaginationLimitOptionsQuery>({
      query: GetPaginationLimitOptionsDocument,
    })
    .then((result) => {
      paginationLimitOptions.value =
        result.data?.PaginationLimitOptions.options || [];

      const state = getStateForRoute(route);
      const limit =
        state?.queryVariables?.limit ||
        paginationLimitOptions.value?.[0].value ||
        20;

      selectedPaginationLimitOption.value = paginationLimitOptions.value.find(
        (option) => option.value === limit,
      )?.value;
      props.setLimit(limit);
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
      const sortingOptionsResult =
        result.data?.EntityTypeSortOptions.sortOptions;
      sortOptions.value = sortingOptionsResult?.options || [];

      sortOptions.value = sortOptions.value.filter((option) => {
        const availabilityArray = option.availableInPages;
        if (!availabilityArray) return true;
        return availabilityArray.reduce((accumulator, currentValue) => {
          if (
            route.fullPath.includes(currentValue.entityType) &&
            currentValue.routeName === route.name
          )
            return true;
          return accumulator;
        }, false);
      });

      const state = getStateForRoute(route);
      const sortKey =
        state?.queryVariables?.searchValue.order_by ||
        sortOptions.value?.[0]?.value;
      selectedSortOption.value = sortOptions.value.find(
        (option) => option.value === sortKey,
      )?.value;
      props.setSortKey(sortKey);
      const isAscFromState =
        state?.queryVariables?.searchValue.isAsc !== undefined
          ? state?.queryVariables?.searchValue.isAsc
          : sortingOptionsResult?.isAsc?.toLowerCase() === "asc";
      const sortOrder = isAscFromState ? "asc" : "desc";
      selectedSortDirection.value = sortDirectionOptions.value.find(
        (option) => option.value === sortOrder
      )?.value;
      setIsAsc(sortOrder);
      sortOptionsPromiseIsResolved.value = true;
    });
};

onMounted(() => {
  emit("paginationLimitOptionsPromise", paginationLimitOptionsPromise);
  emit("sortOptionsPromise", sortOptionsPromise);
});

watch(
  () => selectedPaginationLimitOption.value,
  async () => await props.setLimit(selectedPaginationLimitOption.value, true),
  { deep: true },
);
watch(
  () => selectedSortOption.value,
  async () => await props.setSortKey(selectedSortOption.value, true),
  { deep: true },
);
watch(
  () => selectedSortDirection.value,
  async () => setIsAsc(selectedSortDirection.value),
  { deep: true },
);
watch(
  () => isAsc.value,
  async () => await props.setSortOrder(isAsc.value, true),
);
</script>
