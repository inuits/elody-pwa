import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";

export type AdvancedSearchFilters = {
  q: string;
  filter_by: string;
  query_by: string;
};

export const useAdvancedSearch = (config: any) => {
  const { loadDocument } = useImport();

  const items = ref<any | undefined>(undefined);
  const filters = ref<AdvancedSearchFilters | undefined>(undefined);

  const getEntities = async (): Promise<void> => {
    const query = await loadDocument("GetEntitiesByAdvancedSearch");
    const response = await apolloClient.query({
      query,
      variables: {
        ...filters.value,
      },
      fetchPolicy: "no-cache",
    });

    items.value = response.data.EntitiesByAdvancedSearch.results;
  };

  const setFilters = (newFilters: AdvancedSearchFilters) => {
    filters.value = newFilters;
  };


  const getFiltersForAdvancedSearch = (value: string) => {
    if (!config.features.advancedSearch) return {}
    return {
        q: value.trim() === "" ? "*" : value,
        query_by: config.features.advancedSearch.queryBy,
        filter_by: config.features.advancedSearch.filterBy ,
        query_by_weights: config.features.advancedSearch.queryByWeights,
        sort_by: config.features.advancedSearch.sortBy,
        limit: config.features.advancedSearch.limit,
        per_page: config.features.advancedSearch.perPage,
    };
  };

  return {
    items,
    getEntities,
    setFilters,
    getFiltersForAdvancedSearch,
  };
};
