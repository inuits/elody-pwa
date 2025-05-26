<template>
  <div v-if="isLoading" class="flex items-center justify-center">
    <SpinnerLoader />
  </div>
  <div v-else class="grow">
    <AutocompleteFilter
      v-if="useAutocomplete"
      :filter="filter"
      :initial-input-value="lastTypedValue"
      :options="options"
      @searchOptions="searchOptions"
      @filterOptions="$emit('filterOptions', $event)"
      @updateValue="$emit('updateValue', $event)"
    />
    <CheckboxFilter
      v-else
      :filter="filter"
      :options="options"
      @filterOptions="$emit('filterOptions', $event)"
      @updateValue="$emit('updateValue', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
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
}>();

defineEmits(["updateValue", "filterOptions"]);

const { options, setFilters, getOptions, getBaseOptions, init } =
  useFilterOptions();
const route = useRoute();

const isLoading = ref<boolean>(true);
const initialAmountOfOptions = ref<number>(0);

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

onMounted(async () => {
  try {
    isLoading.value = true;
    await init(
      (props.filter.advancedFilter?.entityType ||
        route.meta.entityType) as Entitytyping,
      props.filter.advancedFilter.filterOptionsMapping,
    );

    await fetchSelectionOptions(
      props.filter.advancedFilter.advancedFilterInputForRetrievingOptions,
    );
    initialAmountOfOptions.value = options.value.length;
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
});

const fetchSelectionOptions = async (filters?: AdvancedFilterInput[]) => {
  if (!filters) return;

  await setFilters(filters);
  await getSelectionOptions();
};

const searchOptions = async (searchValue: string) => {
  const newFilters =
    props.filter.advancedFilter.advancedFilterInputForRetrievingOptions;
  const normalizedFitlers = newFilters?.map(buildFilterForSearch(searchValue));

  if (!normalizedFitlers) return;

  await setFilters(normalizedFitlers);
  await getSelectionOptions();
};

const buildFilterForSearch =
  (searchValue: string) =>
  (filter: AdvancedFilterInput): AdvancedFilterInput => {
    if (filter.type !== AdvancedFilterTypes.Text) {
      return filter;
    }

    const shouldReplaceFilterValue = filter.value === "*";
    const updatedFilter = { ...filter };
    updatedFilter.value = shouldReplaceFilterValue
      ? searchValue || "*"
      : filter.value;
    updatedFilter.match_exact = false;

    return updatedFilter;
  };

const getSelectionOptions = async () => {
  const useNewWayToFetchOptions =
    props.filter.advancedFilter.useNewWayToFetchOptions;

  if (useNewWayToFetchOptions) {
    return getBaseOptions();
  }

  return getOptions();
};
</script>
