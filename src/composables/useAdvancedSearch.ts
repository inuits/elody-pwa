import { apolloClient } from "@/main";
import { ref } from "vue";
import { useImport } from "./useImport";

export type AdvancedSearchFilters = {
  q: string;
  filter_by: string;
  query_by: string;
};

export const useAdvancedSearch = () => {
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
    return {
      q: value.trim() === "" ? "*" : value,
      query_by: "sort.title,relsort.hasPerson",
      filter_by: "type:expression",
      query_by_weights: "4,2",
      sort_by: "_eval(nr_items:>7):desc"
    };
  };

  return {
    items,
    getEntities,
    setFilters,
    getFiltersForAdvancedSearch,
  };
};
