import { AdvancedInputType } from "@/queries";
import type { FilterInput, MinMaxInput, MultiSelectInput } from "@/queries";

export type FilterInList = { isActive: boolean; input: FilterInput };

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
  value: MultiSelectInput = { value: [], AndOrValue: true }
): FilterInList => {
  const filterObj: FilterInList = {
    isActive: value.value && value.value.length !== 0 ? true : false,
    input: {
      type: AdvancedInputType.MultiSelectInput,
      key,
      multiSelectInput: value,
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
      case AdvancedInputType.MultiSelectInput:
        // @ts-ignore
        if (input[index]?.input?.multiSelectInput?.value) {
          // @ts-ignore
          if (
            input[index].input?.multiSelectInput.value !== acceptedEntityTypes
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
