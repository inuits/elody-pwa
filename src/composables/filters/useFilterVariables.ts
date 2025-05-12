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

  const extractValueFromObject = (object: any, path: string): unknown => {
    const segments = path.split(".");
    let current = object;

    for (let i = 0; i < segments.length; i++) {
      if (current == null) return undefined;

      const segment = segments[i];

      if (Array.isArray(current)) {
        const remainingPath = segments.slice(i).join(".");
        const results = current
          .map((item) => extractValueFromObject(item, remainingPath))
          .filter((val) => val !== undefined || val !== "");

        return results.length ? results : undefined;
      }

      current = current[segment];
    }

    return current;
  };

  return {
    variables,
    setVariables,
    extractValueFromObject,
  };
};
