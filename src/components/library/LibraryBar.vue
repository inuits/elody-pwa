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
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { useImport } from "@/composables/useImport";

const props = withDefaults(
  defineProps<{
    setLimit: (limit: number) => void;
    selectedPaginationLimitOption: number;
    setSortKey: (sortKey: string) => void;
    setSortOrder: (sortOrder: string) => void;
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
const selectedPaginationLimitOption = ref<number>(
  props.selectedPaginationLimitOption,
);
const selectedSortOption = ref<any>();
const sortOptions = ref<DropdownOption[]>([]);
const sortOptionsPromiseIsResolved = ref<boolean>(false);
const selectedSortDirection = ref<any>();
const sortDirectionOptions = ref<DropdownOption[]>([
  { label: "library.desc", value: "desc", icon: DamsIcons.SortDown },
  { label: "library.asc", value: "asc", icon: DamsIcons.SortUp },
]);
const { getStateForRoute } = useStateManagement();
const { loadDocument } = useImport();
const { t } = useI18n();
const route = useRoute();

const setIsAsc = (sortDirection: "asc" | "desc") => {
  isAsc.value = sortDirection === "asc";
};

const paginationLimitOptionsPromise = async () => {
  return apolloClient
    .query<GetPaginationLimitOptionsQuery>({
      query: GetPaginationLimitOptionsDocument,
    })
    .then((result) => {
      paginationLimitOptions.value =
        result.data?.PaginationLimitOptions.options || [];

      const state = getStateForRoute(route, true);
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
  console.log(`%c[SortOptions] 🚀 Starting promise for entity: ${entityType}`, "color: #3498db; font-weight: bold;");

  return apolloClient
    .query({
      query: await determineSortOptionsQuery(),
      variables: { entityType },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      console.group(`[SortOptions] Results for ${entityType}`);
      
      const sortingOptionsResult = result.data?.EntityTypeSortOptions.sortOptions;
      console.log("1. Raw API Result:", sortingOptionsResult);

      sortOptions.value = sortingOptionsResult?.options || [];

      // Filtering Logic
      sortOptions.value = sortOptions.value.filter((option) => {
        const availabilityArray = option.availableInPages;
        if (!availabilityArray) return true;
        const isAvailable = availabilityArray.reduce((accumulator, currentValue) => {
          if (
            route.fullPath.includes(currentValue.entityType) &&
            currentValue.routeName === route.name
          )
            return true;
          return accumulator;
        }, false);
        return isAvailable;
      });
      console.log("2. Filtered Options List:", sortOptions.value);

      // State Retrieval
      const state = getStateForRoute(route, true);
      console.log("3. State from getStateForRoute:", state);
      console.log("4. Route used for lookup:", { name: route.name, path: route.fullPath });

      // Sort KEY Logic
      const stateSortKey = state?.queryVariables?.searchValue?.order_by;
      const defaultSortKey = sortOptions.value?.[0]?.value;
      const finalSortKey = stateSortKey || defaultSortKey;
      
      console.log("5. Sort Key Selection:", { 
        fromState: stateSortKey, 
        fallbackDefault: defaultSortKey, 
        chosen: finalSortKey 
      });

      selectedSortOption.value = sortOptions.value.find(
        (option) => option.value === finalSortKey,
      )?.value;
      
      props.setSortKey(finalSortKey);

      // Sort DIRECTION Logic
      const stateIsAsc = state?.queryVariables?.searchValue?.isAsc;
      const apiIsAsc = sortingOptionsResult?.isAsc?.toLowerCase() === "asc";
      
      const isAscFromState = stateIsAsc !== undefined ? stateIsAsc : apiIsAsc;

      console.log("6. Direction Selection:", { 
        stateIsAsc, 
        apiIsAsc, 
        finalIsAsc: isAscFromState 
      });

      const sortOrder = isAscFromState ? "asc" : "desc";
      const matchedOption = sortDirectionOptions.value.find(
        (option) => option.value === sortOrder,
      );
      
      console.log("7. UI Mapping:", { 
        targetOrder: sortOrder, 
        foundInUIOptions: !!matchedOption 
      });

      selectedSortDirection.value = matchedOption?.value;

      console.log(`8. Final Output -> Calling setIsAsc("${sortOrder}")`);
      setIsAsc(sortOrder);

      sortOptionsPromiseIsResolved.value = true;
      console.groupEnd();
    })
    .catch(err => {
      console.error("[SortOptions] Error in promise:", err);
      console.groupEnd();
    });
};

const determineSortOptionsQuery = async (): Promise<any> => {
  try {
    const query = route!.meta!.queries!.getSortOptions;
    return await loadDocument(query);
  } catch (error) {
    return await loadDocument("GetSortOptions");
  }
};

onMounted(() => {
  emit("paginationLimitOptionsPromise", paginationLimitOptionsPromise);
  emit("sortOptionsPromise", sortOptionsPromise);
});

watch(
  () => selectedPaginationLimitOption.value,
  async () =>
    await props.setLimit(
      selectedPaginationLimitOption.value,
      selectedPaginationLimitOption.value !== -1,
    ),
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
