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
    });

    items.value = response.data.EntitiesByAdvancedSearch.results;
  };

  const setFilters = (newFilters: AdvancedSearchFilters) => {
    filters.value = newFilters;
  };

  const getFiltersForAdvancedSearch = (value: string) => {
    return {
      q: value.trim() === "" ? "*" : value,
      query_by: "metadata.value",
      filter_by: "",
    };
  };

  return {
    items,
    getEntities,
    setFilters,
    getFiltersForAdvancedSearch,
  };
};
