<template>
  <div v-if="isLoading" class="flex items-center justify-center">
    <SpinnerLoader theme="accent" :dimensions="10" />
  </div>
  <div v-if="showFilters" class="grow">
    <AutocompleteFilter
      v-if="useAutocomplete"
      ref="filterComponentRef"
      :filter="filter"
      :initial-input-value="lastTypedValue"
      :options="options"
      :is-loading="isLoadingOptions"
      @searchOptions="handleSearchOptions"
      @filterOptions="$emit('filterOptions', $event)"
      @updateValue="$emit('updateValue', $event)"
    />
    <CheckboxFilter
      v-else
      ref="filterComponentRef"
      :filter="filter"
      :options="options"
      :loading="false"
      @filterOptions="$emit('filterOptions', $event)"
      @updateValue="$emit('updateValue', $event)"
    />
  </div>
  <div v-if="!showFilters">
    {{ t("filters.noOptionsAvailable") }}
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  AutocompleteSelectionOptions,
  AdvancedFilterTypes,
} from "@/generated-types/queries";
import AutocompleteFilter from "./AutocompleteFilter.vue";
import CheckboxFilter from "./CheckboxFilter.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useFilterOptions } from "@/composables/useFilterOptions";
import { type FilterListItem } from "@/composables/useStateManagement";
import { useRoute } from "vue-router";
import type {
  AdvancedFilterInput,
  Entitytyping,
} from "@/generated-types/queries";

const props = defineProps<{
  filter: FilterListItem;
  lastTypedValue: string;
  isOpen: boolean;
  getNormalizedActiveFilters: () => any;
  refetchFilterOptions: boolean;
}>();

defineEmits(["updateValue", "filterOptions"]);

const {
  options,
  setFilters,
  getOptions,
  loadOptionsAndFacetsInParallel,
  init,
  loading: isLoadingOptions,
} = useFilterOptions();
const route = useRoute();

const isLoading = ref(true);
const initialAmountOfOptions = ref(0);
const hasFetchedOptions = ref(false);
const isInitialized = ref(false);
const filterComponentRef = ref();
const { t } = useI18n();

const useAutocomplete = computed(() => {
  if (
    props.filter.advancedFilter.selectionOption ===
    AutocompleteSelectionOptions.Autocomplete
  )
    return true;
  if (
    props.filter.advancedFilter.selectionOption ===
    AutocompleteSelectionOptions.Checkboxlist
  )
    return false;
  return (
    initialAmountOfOptions.value > 10 || initialAmountOfOptions.value === 0
  );
});

const showFilters = computed(() => {
  return !isLoading.value && initialAmountOfOptions.value !== 0;
});

const initialize = async () => {
  if (isInitialized.value) return;

  try {
    await init(
      (props.filter.advancedFilter?.entityType ||
        route.meta.entityType) as Entitytyping,
      props.filter.advancedFilter.filterOptionsMapping,
    );
    isInitialized.value = true;
  } catch (error) {
    console.error("Initialization failed:", error);
  }
};

const loadOptions = async () => {
  if (!isInitialized.value) {
    await initialize();
  }

  try {
    await fetchSelectionOptions(
      props.filter.advancedFilter.advancedFilterInputForRetrievingOptions,
    );
    initialAmountOfOptions.value = options.value.length;
    hasFetchedOptions.value = true;
    isLoading.value = false;
  } catch (error) {
    console.error("Failed to load options:", error);
    isLoading.value = false;
  }
};

const fetchSelectionOptions = async (filters?: AdvancedFilterInput[]) => {
  if (!filters) return;

  await setFilters(filters);
  await getSelectionOptions();
};

const handleSearchOptions = async (searchValue: string) => {
  const newFilters =
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions;
  const normalizedFilters = newFilters?.map(buildFilterForSearch(searchValue));

  if (!normalizedFilters) return;

  try {
    await setFilters(normalizedFilters);
    await getSelectionOptions();
  } catch (error) {
    console.error("Search failed:", error);
  }
};

const buildFilterForSearch =
  (searchValue: string) =>
  (filter: AdvancedFilterInput): AdvancedFilterInput => {
    if (filter.type !== AdvancedFilterTypes.Text) {
      return filter;
    }

    const shouldReplaceFilterValue = filter.value === "*";
    return {
      ...filter,
      value: shouldReplaceFilterValue ? searchValue || "*" : filter.value,
      match_exact: false,
    };
  };

const facetsFilters = computed(() => {
  return props.filter.advancedFilter.facets
    ? [
        ...props.filter.advancedFilter.facets,
        ...props.getNormalizedActiveFilters(),
      ]
    : undefined;
});

const getSelectionOptions = async () => {
  return props.filter.advancedFilter.useNewWayToFetchOptions
    ? loadOptionsAndFacetsInParallel(facetsFilters.value)
    : getOptions();
};

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && !hasFetchedOptions.value) {
      await loadOptions();
    }
  },
  { immediate: true },
);

watch(
  () => props.refetchFilterOptions,
  async (refetchFilterOptions) => {
    const hasToRefetchOptions =
      refetchFilterOptions &&
      (props.isOpen || (!props.isOpen && isInitialized.value)) &&
      !!props.filter.advancedFilter.facets;
    if (hasToRefetchOptions) {
      isLoading.value = true;
      await loadOptions();
    }
  },
);

const reset = () => {
  if (filterComponentRef.value) {
    filterComponentRef.value.reset();
  }
};

defineExpose({
  reset,
});
</script>
