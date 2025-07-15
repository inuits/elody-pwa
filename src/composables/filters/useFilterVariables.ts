import { ref } from "vue";
import type { Entitytyping, Entity } from "@/generated-types/queries";

type FilterVariables = {
  parentIds?: string[] | string;
  entityType?: Entitytyping | string;
  entity?: Entity;
};

export const useFilterVariables = () => {
  const variables = ref<FilterVariables>({});

  const setVariables = (newVariables: FilterVariables) => {
    variables.value = newVariables;
  };

  return {
    variables,
    setVariables,
  };
};
