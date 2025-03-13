import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";

export type AiSearchFilters = {
  input: string;
};

export const useAiSearch = (config: any) => {
  const { loadDocument } = useImport();

  const entitiesLoading = ref<boolean>(false);
  const items = ref<any | undefined>(undefined);
  const filters = ref<AiSearchFilters | undefined>(undefined);

  const getEntities = async (): Promise<void> => {
    entitiesLoading.value = true;
    const query = await loadDocument("GetEntitiesByAiSearch");
    const response = await apolloClient.query({
      query,
      variables: {
        ...filters.value,
      },
      fetchPolicy: "no-cache",
    });

    items.value = response.data.EntitiesByAiSearch.results;
    entitiesLoading.value = false;
  };

  const setFilters = (newFilters: AiSearchFilters) => {
    filters.value = newFilters;
  };


  const getFiltersForAiSearch = (value: string) => {
    if (!config.features.advancedSearch) return {}
    return {
        input: value.trim(),
    };
  };

  return {
    items,
    getEntities,
    setFilters,
    getFiltersForAiSearch,
    entitiesLoading,
  };
};
