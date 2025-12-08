import {
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  type Entity,
  type GetEntitiesQuery,
} from "@/generated-types/queries";
import { ref } from "vue";
import type { ApolloClient } from "@apollo/client/core";

export const useVirtualPagination = (apolloClient: ApolloClient<any>) => {
  const PAGE_SIZE = 200;
  const MAX_ROWS = 20000;

  const internalEntities = ref<Entity[]>([]);
  const internalLoading = ref(false);

  let abortController: AbortController | null = null;

  const loadPaginatedEntities = async (
    variables: GetEntitiesQueryVariables,
  ) => {
    if (!variables) return;
    if (variables.skip) delete variables["skip"];
    if (variables.limit) delete variables["limit"];

    internalLoading.value = true;
    internalEntities.value = [];
    let offset = 0;
    let allRows: Entity[] = [];

    abortController = new AbortController();

    const fetchPage = async () => {
      const previousItemAmount = allRows.length;
      if (abortController?.signal.aborted) return;

      const queryVariables = {
        ...variables,
        limit: PAGE_SIZE,
      };

      if (offset > 0) variables.skip = offset;

      const { data } = await apolloClient.query<GetEntitiesQuery>({
        query: GetEntitiesDocument,
        variables: queryVariables,
        fetchPolicy: "network-only",
      });

      const items: Entity[] = data?.Entities?.results ?? [];
      allRows.push(...items);

      internalEntities.value = [...allRows];

      if (items.length < PAGE_SIZE || allRows.length >= MAX_ROWS) {
        internalLoading.value = false;
        return;
      }

      offset += PAGE_SIZE;
      await fetchPage();
    };

    fetchPage();
  };

  const abortEntitiesLoading = () => {
    abortController?.abort();
  };

  return {
    internalEntities,
    internalLoading,
    loadPaginatedEntities,
    abortEntitiesLoading,
  };
};
