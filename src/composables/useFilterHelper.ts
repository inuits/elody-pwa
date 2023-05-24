import { AdvancedInputType, type Definition } from "@/generated-types/queries";
import type {
  FilterInput,
  MinMaxInput,
  SelectionInput,
} from "@/generated-types/queries";
import { useSavedSearchHelper } from "./useSavedSearchHelper";

export type FilterInList = { isActive: boolean; input: FilterInput };

export type FilterOptions = { label: string; value: string }[];

export type AdvancedFilter = {
  key: string;
  label: string;
  type: "text" | "selection" | "checklist" | "minmax";
  isRelation: boolean;
  options: { label: string; value: string }[];
};

export const defaultReturnTextObject = (
  key: string,
  value: string | undefined | null = undefined
): FilterInList => {
  return {
    isActive: value && value != "" ? true : false,
    input: {
      type: AdvancedInputType.TextInput,
      key,
      textInput: { value: value },
    },
  };
};

export const defaultReturnMultiSelectObject = (
  key: string,
  value: SelectionInput = { value: [], AndOrValue: true }
): FilterInList => {
  const filterObj: FilterInList = {
    isActive: value.value && value.value.length !== 0 ? true : false,
    input: {
      type: AdvancedInputType.SelectionInput,
      key,
      selectionInput: value,
    },
  };
  return filterObj;
};

const checkIfMinMaxActive = (value: MinMaxInput | undefined): boolean => {
  if (
    value === undefined ||
    (value.min === 0 && value.max === 0) ||
    (value.min === undefined && value.max === undefined) ||
    (value.min === 0 && value.max === undefined) ||
    (value.min === undefined && value.max === 0)
  ) {
    return false;
  } else {
    return true;
  }
};

export const defaultReturnMinMaxObject = (
  key: string,
  value: MinMaxInput = { min: undefined, max: undefined }
) => {
  return {
    isActive: checkIfMinMaxActive(value),
    input: {
      type: AdvancedInputType.MinMaxInput,
      key,
      minMaxInput: value,
    },
  };
};

export const clearAdvancedSearchInput = (
  input: FilterInList[],
  acceptedEntityTypes: string[]
): FilterInList[] => {
  input.forEach((filter: FilterInList, index: number) => {
    switch (filter.input.type) {
      case AdvancedInputType.MinMaxInput:
        input[index] = defaultReturnMinMaxObject(filter.input.key);
        break;
      case AdvancedInputType.SelectionInput:
        // @ts-ignore
        if (input[index]?.input?.selectionInput?.value) {
          // @ts-ignore
          if (
            input[index]?.input?.selectionInput?.value !== acceptedEntityTypes
          ) {
            input[index] = defaultReturnMultiSelectObject(filter.input.key);
          }
        }
        break;
      default:
        input[index] = defaultReturnTextObject(filter.input.key);
        break;
    }
  });

  return input;
};

export const getActiveFilters = (input: FilterInList[]) =>
  input.filter((filter: FilterInList) => filter.isActive === true);

export const setSelectedSavedSearchOnFilters = (filters: FilterInList[]) => {
  const { pickedSavedSearch } = useSavedSearchHelper();

  pickedSavedSearch.value?.definition?.forEach((filter) => {
    filters.forEach((inFilter) => {
      if (filter?.key === inFilter.input.key) {
        inFilter.input = filterToInputFilter(filter);
        inFilter.isActive = true;
      }
    });
  });
};

const filterToInputFilter = (filter: Definition): FilterInput => {
  const filterInput: FilterInput = {
    key: filter.key,
    type: AdvancedInputType[filter.type as keyof typeof AdvancedInputType],
  };
  switch (AdvancedInputType[filter.type as keyof typeof AdvancedInputType]) {
    case AdvancedInputType.TextInput:
      filterInput.textInput = filter.textInput;
      break;
    case AdvancedInputType.SelectionInput:
      filterInput.selectionInput = filter.selectionInput;
      break;
    case AdvancedInputType.MinMaxInput:
      filterInput.minMaxInput = filter.minMaxInput;
      break;
    default:
      break;
  }
  return filterInput;
};
