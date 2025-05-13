import { ref } from "vue";
import type {
  AdvancedFilters,
  AdvancedFilterInput,
} from "@/generated-types/queries";

export const useFilterBasic = () => {
  const rawFilters = ref<AdvancedFilters>();

  const transformFilterInputIntoAdvancedFilters = (
    filters: AdvancedFilterInput[],
  ): AdvancedFilters => {
    return filters.reduce(
      (acc, current, idx) => ({
        ...acc,
        [`filterKey_${idx}`]: transformFilterInput(current),
      }),
      {} as AdvancedFilters,
    );
  };

  const transformFilterInput = (input: AdvancedFilterInput) => {
    return {
      type: input.type,
      key: input.key,
      isDisplayedByDefault: true,
      defaultValue: input.value,
      itemTypes: input.item_types,
      matchExact: input.match_exact,
      distinctBy: input.distinct_by,
      metadataKeyAsLabel: input.metadata_key_as_label,
      hidden: true,
    };
  };

  return {
    rawFilters,
    transformFilterInputIntoAdvancedFilters,
  };
};
