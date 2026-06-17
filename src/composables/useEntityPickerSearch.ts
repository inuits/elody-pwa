import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Operator,
} from "@/generated-types/queries";

export function buildEntityPickerSearchFilters(
  searchTerm: string,
  metadataKeys: string[],
): AdvancedFilterInput[] {
  if (!searchTerm || metadataKeys.length === 0) return [];
  return metadataKeys.map((key) => ({
    key: [key],
    value: searchTerm,
    type: AdvancedFilterTypes.Text,
    operator: Operator.Or,
    match_exact: false,
  }));
}
