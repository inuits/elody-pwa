<template>
  <!-- filter-panel.md: option-shaped skeleton rows while options load. -->
  <div v-if="loading" aria-busy="true" class="flex flex-col gap-2 py-1">
    <div
      v-for="row in 3"
      :key="row"
      data-cy="filter-options-skeleton"
      aria-hidden="true"
      class="flex items-center gap-2"
    >
      <span class="size-4 shrink-0 rounded-chip bg-surface-sunken animate-pulse" />
      <span class="h-3 flex-1 rounded-chip bg-surface-sunken animate-pulse" />
    </div>
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
  <div v-if="!showFilters && !loading">
    {{ t("filters.noOptionsAvailable") }}
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  AutocompleteSelectionOptions,
  AdvancedFilterTypes,
} from "@/generated-types/queries";
import AutocompleteFilter from "./AutocompleteFilter.vue";
import CheckboxFilter from "./CheckboxFilter.vue";
import { useFilterOptions } from "@/composables/useFilterOptions";
import { type FilterListItem } from "@/composables/useStateManagement";
import { useRoute } from "vue-router";
import type {
  AdvancedFilterInput,
  Entitytyping,
} from "@/generated-types/queries";
import { extractOrderKeyFromFilters } from "./helpers";

const props = defineProps<{
  filter: FilterListItem;
  lastTypedValue: string;
  isOpen: boolean;
  getNormalizedActiveFilters: () => any;
  refetchFilterOptions: boolean;
}>();

const parentEntity: any = inject("ParentEntityProvider", undefined);

const emit = defineEmits(["updateValue", "filterOptions", "newInputValue"]);

const {
  options,
  setFilters,
  getOptions,
  loadOptionsAndFacetsInParallel,
  init,
  updateSelectedOptions,
  setPredefinedOptions,
  loading: isLoadingOptions,
} = useFilterOptions();
const route = useRoute();

const isLoading = ref(true);
const initialAmountOfOptions = ref(0);
const hasFetchedOptions = ref(false);
const isInitialized = ref(false);
const hasResolvedOptionIds = ref(false);
const filterComponentRef = ref();
const { t } = useI18n();

const shouldResolveOptionIds = computed(() =>
  props.filter.advancedFilter.advancedFilterInputForRetrievingOptions?.some(
    (input) => input.resolveDefaultValueToOptionIds,
  ),
);

const autoFillParentWithOptionIds = () => {
  if (hasResolvedOptionIds.value || !shouldResolveOptionIds.value) return;
  hasResolvedOptionIds.value = true;

  const optionIds = options.value.map((option) => option.value);
  if (optionIds.length) emit("updateValue", optionIds);
};

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

const selectedOptions = computed(() => {
  return props.filter.inputFromState?.value || [];
});

const hasWildcardTextFilter = computed(() => {
  const filters =
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions;
  return filters?.some(
    (f: AdvancedFilterInput) =>
      f.type === AdvancedFilterTypes.Text && f.value === "*",
  );
});

// Nothing to show yet (first load, or a refetch before any options): show
// skeletons, never "no options". An autocomplete searching as you type keeps
// its field instead.
const loading = computed(
  () => isLoading.value || (!!isLoadingOptions.value && !showFilters.value),
);

const showFilters = computed(() => {
  return (
    !isLoading.value &&
    (initialAmountOfOptions.value !== 0 || hasWildcardTextFilter.value)
  );
});

const initialize = async () => {
  if (isInitialized.value) return;

  try {
    await init({
      entityType: (props.filter.advancedFilter?.entityType ||
        route.meta.entityType) as Entitytyping,
      filterOptionsMapping: props.filter.advancedFilter.filterOptionsMapping,
      limitConfig: props.filter.advancedFilter.limitConfig,
      selectedOptions: selectedOptions.value,
      parentEntity,
    });
    isInitialized.value = true;
  } catch (error) {
    console.error("Initialization failed:", error);
  }
};

const loadOptions = async () => {
  if (!isInitialized.value) {
    await initialize();
  }

  const predefinedOptions = props.filter.advancedFilter.options;
  if (predefinedOptions?.length) {
    setPredefinedOptions(predefinedOptions);
    initialAmountOfOptions.value = predefinedOptions.length;
    hasFetchedOptions.value = true;
    isLoading.value = false;
    return;
  }

  if (
    props.filter.advancedFilter.selectionOption ===
      AutocompleteSelectionOptions.Autocomplete &&
    hasWildcardTextFilter.value
  ) {
    initialAmountOfOptions.value = 0;
    hasFetchedOptions.value = true;
    isLoading.value = false;
    return;
  }

  try {
    await fetchSelectionOptions(
      props.filter.advancedFilter.advancedFilterInputForRetrievingOptions,
    );
    autoFillParentWithOptionIds();
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
  await getSelectionOptions(extractOrderKeyFromFilters(filters));
};

const handleSearchOptions = async (searchValue: string) => {
  if (!searchValue && useAutocomplete.value) {
    options.value = [];
    return;
  }

  const newFilters =
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions;
  const normalizedFilters = newFilters?.map(buildFilterForSearch(searchValue));

  if (!normalizedFilters) return;

  try {
    await setFilters(normalizedFilters);
    await getSelectionOptions(extractOrderKeyFromFilters(newFilters));
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

const isEnableOldWayToFetch = computed(() => {
  return props.filter.advancedFilter.useOldWayToFetchOptions || false;
});

const getSelectionOptions = async (orderKey: string = "") => {
  return isEnableOldWayToFetch.value
    ? getOptions()
    : loadOptionsAndFacetsInParallel(facetsFilters.value, orderKey);
};

watch(
  () => props.isOpen,
  async (isOpen) => {
    if ((isOpen || shouldResolveOptionIds.value) && !hasFetchedOptions.value) {
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
  // A checkbox list needs the panel's full width (FiltersListItemPanel).
  // Loading counts as a list: the skeleton rows need the full width.
  rendersList: computed(
    () => loading.value || (showFilters.value && !useAutocomplete.value),
  ),
});

watch(selectedOptions, () => {
  updateSelectedOptions(selectedOptions.value);
});
</script>
