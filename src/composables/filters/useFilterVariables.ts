import { ref } from "vue";
import type { Entitytyping, Entity } from "@/generated-types/queries";

type FilterVariables = {
  parentIds?: string[] | string;
  entityType?: Entitytyping | string;
  entity?: Entity;
  dateToday?: string;
  // callers may hand extra named values for declared "$<name>" references
  // (e.g. the pipeline port picker's portShapeIris)
  [extra: string]: unknown;
};

export const useFilterVariables = () => {
  const variables = ref<FilterVariables>({});

  const setVariables = (newVariables: FilterVariables) => {
    variables.value = { ...variables.value, ...newVariables };
  };

  return {
    variables,
    setVariables,
  };
};
