import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Operator,
} from "@/generated-types/queries";

export const buildEntityPickerSearchFilters = (
  searchTerm: string,
  metadataKeys: string[],
): AdvancedFilterInput[] => {
  if (!searchTerm || metadataKeys.length === 0) return [];
  return metadataKeys.map((key) => ({
    key: [key],
    value: searchTerm,
    type: AdvancedFilterTypes.Text,
    operator: Operator.Or,
    match_exact: false,
  }));
};

export const buildEntityPickerTypeFilter = (
  searchAcceptedTypes: string[],
): AdvancedFilterInput[] => {
  if (searchAcceptedTypes.length <= 1) return [];
  return [{
    key: "type",
    value: searchAcceptedTypes,
    type: AdvancedFilterTypes.Selection,
    match_exact: true,
  }];
};
