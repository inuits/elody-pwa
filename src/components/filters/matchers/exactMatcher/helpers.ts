import type { AdvancedFilterInput } from "@/generated-types/queries";
import { AdvancedFilterTypes } from "@/generated-types/queries";

export const extractOrderKeyFromFilters = (
  filters: AdvancedFilterInput[],
): string => {
  const textFilter = filters.filter(
    (filter: AdvancedFilterInput) => filter.type === AdvancedFilterTypes.Text,
  );
  if (!textFilter) return "";
  return textFilter[0]?.distinct_by || "";
};
