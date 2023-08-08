import {
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  type Entity,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { createPlaceholderEntities } from "@/helpers";
import type { ApolloClient } from "@apollo/client/core";
import { ref, watch } from "vue";

export const useBaseLibrary = (apolloClient: ApolloClient<any>) => {
  const queryVariables = ref<GetEntitiesQueryVariables | undefined>(undefined);
  const entities = ref<Entity[]>([]);
  const entitiesLoading = ref<boolean>(true);
  const totalEntityCount = ref<number>(0);

  const __setEntitiesLoading = (isLoading: boolean) =>
    (entitiesLoading.value = isLoading);

  const setQueryVariables = (
    newQueryVariables: GetEntitiesQueryVariables
  ): void => {
    queryVariables.value = newQueryVariables;
  };

  const setAdvancedFilters = (newFilterInputs: AdvancedFilterInput[]): void => {
    if (
      !queryVariables.value ||
      newFilterInputs === queryVariables.value.advancedFilterInputs
    ) {
      console.warn(
        "QueryVariables are not yet initialized or value has not been changed"
      );
      return;
    }

    queryVariables.value.advancedFilterInputs = newFilterInputs;
    getEntities();
  };

  const setEntities = (newEntities: Entity[]): void => {
    entities.value = newEntities;
    __setEntitiesLoading(false);
  };

  const setTotalEntityCount = (newCount: number): void => {
    totalEntityCount.value = newCount;
  };

  const getEntities = async (): Promise<void> => {
    if (!queryVariables.value) return;
    __setEntitiesLoading(true);

    const newEntities = await apolloClient.query({
      query: GetEntitiesDocument,
      variables: queryVariables.value,
    });
    setEntities(newEntities?.data?.Entities?.results);
    totalEntityCount.value = newEntities?.data?.Entities?.count;
  };

  watch(
    () => entitiesLoading.value,
    (loading) => {
      if (loading) {
        const placeholderAmount = queryVariables.value?.limit || 25;
        entities.value = createPlaceholderEntities(placeholderAmount);
        totalEntityCount.value = placeholderAmount;
      }
    }
  );

  watch(
    () => queryVariables.value,
    () => {
      getEntities();
    },
    { deep: true }
  );

  return {
    setQueryVariables,
    getEntities,
    queryVariables,
    entities,
    totalEntityCount,
    setEntities,
    setTotalEntityCount,
    setAdvancedFilters,
    entitiesLoading,
  };
};
