import type { ApolloClient } from "@apollo/client/core";
import {
  Entitytyping,
  GetEntitiesTotalCountDocument,
  SearchInputType,
  type AdvancedFilterInput,
  type GetEntitiesTotalCountQueryVariables,
} from "@/generated-types/queries";
import { ref } from "vue";

export const useTotalCount = (apolloClient: ApolloClient<any>) => {
  let abortController: any | null = null;
  
  let entityType: Entitytyping = Entitytyping.BaseEntity;
  const entitiesLoading = ref<boolean>(false);
  const totalEntityCount = ref<number>(0);
  const queryVariables: GetEntitiesTotalCountQueryVariables = {
    type: entityType,
    limit: 20,
    skip: 1,
    searchValue: {
      value: "",
      isAsc: false,
      key: "title",
      order_by: "",
    },
    advancedSearchValue: [],
    advancedFilterInputs: [],
    searchInputType: SearchInputType.AdvancedInputType,
  };

  const setEntityType = (type: Entitytyping): void => {
    entityType = type;
    queryVariables.type = type;
  };

  const setAdvancedFilters = async (
    filters: AdvancedFilterInput[]
  ): Promise<void> => {
    queryVariables.advancedFilterInputs = [];
    queryVariables.advancedFilterInputs = filters;
    queryVariables.skip = 1;
  };

  const getEntitiesTotalCount = async (): Promise<void> => {
    if (entitiesLoading.value) return;
    entitiesLoading.value = true;
    totalEntityCount.value = 0;
    const variables = queryVariables;

    // await apolloClient
    //   .query({
    //     query: GetEntitiesTotalCountDocument,
    //     variables,
    //     fetchPolicy: "no-cache",
    //     notifyOnNetworkStatusChange: true,
    //   })
    //   .then((result) => {
    //     const fetchedEntities = result.data.Entities;
    //     totalEntityCount.value = fetchedEntities?.count || 0;
    //     entitiesLoading.value = false;
    //   })
    //   .catch(() => {
    //     totalEntityCount.value = 0;
    //     entitiesLoading.value = false;
    //   });
  };

  return {
    entitiesLoading,
    getEntitiesTotalCount,
    setEntityType,
    setAdvancedFilters,
    totalEntityCount,
  };
};
