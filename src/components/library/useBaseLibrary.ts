import type { ApolloClient } from "@apollo/client/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import {
  Entitytyping,
  GetEntitiesDocument,
  SearchInputType,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  type IntialValues,
  type Metadata,
} from "@/generated-types/queries";
import useEditMode from "@/composables/useEdit";
import { createPlaceholderEntities } from "@/helpers";
import { ref, watch } from "vue";
import { useStateManagement } from "@/composables/useStateManagement";

export const useBaseLibrary = (apolloClient: ApolloClient<any>) => {
  let entityType: Entitytyping = Entitytyping.BaseEntity;
  let _route: RouteLocationNormalizedLoaded | undefined;
  const entities = ref<Entity[]>([]);
  const entitiesLoading = ref<boolean>(false);
  const isSearchLibrary = ref<boolean>(false);
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();
  const promiseQueue = ref<((entityType: Entitytyping) => Promise<void>)[]>([]);
  const totalEntityCount = ref<number>(0);
  const { getStateForRoute, updateStateForRoute } = useStateManagement();
  const { isSaved } = useEditMode();
  let queryVariables: GetEntitiesQueryVariables = {
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
    searchInputType: undefined,
    userUuid: "", // refactor needed
  };

  const setManipulationOfQuery = (
    manipulate: boolean,
    manipulation: object
  ) => {
    manipulateQuery.value = manipulate;
    manipulationQuery.value = manipulation;
  };

  const setParentEntityIdentifiers = (identifiers: string[]) => {
    queryVariables.userUuid = identifiers[0];
  };

  const setIsSearchLibrary = (searchLibrary: boolean): void => {
    isSearchLibrary.value = searchLibrary;
  };

  const setEntityType = (type: Entitytyping): void => {
    entityType = type;
    queryVariables.type = type;
  };

  const setsearchInputType = (searchInputType: SearchInputType): void => {
    queryVariables.searchInputType = searchInputType;
  };

  const setAdvancedFilters = async (
    filters: AdvancedFilterInput[],
    forceFetch: boolean = false
  ): Promise<void> => {
    if (filters === queryVariables.advancedFilterInputs && !isSaved.value)
      return;

    queryVariables.advancedFilterInputs = [];
    queryVariables.advancedFilterInputs = filters;
    queryVariables.skip = 1;

    updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSkip = async (
    skip: number,
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.skip = skip;
    updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setLimit = async (
    limit: number,
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.limit = limit;
    updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortKey = async (
    sortKey: string,
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.searchValue.order_by = sortKey;
    updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortOrder = async (
    sortOrder: "asc" | "desc",
    forceFetch: boolean = false
  ): Promise<void> => {
    queryVariables.searchValue.isAsc = sortOrder === "asc";
    updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const enqueuePromise = (
    promise: (entityType: Entitytyping) => Promise<void>
  ) => {
    if (
      promise &&
      !promiseQueue.value.find(
        (queuedPromise) => queuedPromise.name === promise.name
      )
    )
      promiseQueue.value.push(promise);
  };

  const getEntities = async (
    route: RouteLocationNormalizedLoaded | undefined
  ): Promise<void> => {
    if (entitiesLoading.value) return;
    entitiesLoading.value = true;

    await Promise.all(promiseQueue.value.map((promise) => promise(entityType)));
    while (promiseQueue.value.length > 0) promiseQueue.value.shift();

    _route = route;
    let variables = getStateForRoute(_route)?.queryVariables;
    if (variables) queryVariables = variables;
    else updateStateForRoute(_route, { queryVariables });
    if (!variables || _route?.name === "SingleEntity")
      variables = queryVariables;

    await apolloClient
      .query({
        query: manipulateQuery.value
          ? manipulationQuery.value.document
          : GetEntitiesDocument,
        variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const fetchedEntities = result.data.Entities;
        entities.value = fetchedEntities?.results as Entity[];
        totalEntityCount.value = fetchedEntities?.count || 0;
        updateStateForRoute(_route, {
          entityCountOnPage: fetchedEntities.results.length,
          totalEntityCount: fetchedEntities.count,
        });
        entitiesLoading.value = false;
      })
      .catch(() => {
        entities.value = [];
        entitiesLoading.value = false;
      });
  };

  watch(
    () => entitiesLoading.value,
    () => {
      if (entitiesLoading.value && _route?.name !== "SingleEntity") {
        let placeholderAmount = 1;
        const entityCountOnPage = getStateForRoute(_route)?.entityCountOnPage;
        if (entityCountOnPage !== undefined)
          placeholderAmount = entityCountOnPage;
        entities.value = createPlaceholderEntities(placeholderAmount);
      }
    }
  );

  const formatTeaserMetadata = (
    teaserMetadata: Record<string, Metadata>,
    intialValues: Record<string, IntialValues>
  ): object => {
    const formatted = [];
    for (const key in teaserMetadata) {
      if (key !== "__typename" && intialValues && teaserMetadata[key].label) {
        teaserMetadata[key].value = intialValues[key];
        formatted.push(teaserMetadata[key]);
      }
    }
    return formatted;
  };

  return {
    enqueuePromise,
    entities,
    entitiesLoading,
    formatTeaserMetadata,
    getEntities,
    manipulationQuery,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setLimit,
    setManipulationOfQuery,
    setParentEntityIdentifiers,
    setsearchInputType,
    setSkip,
    setSortKey,
    setSortOrder,
    totalEntityCount,
  };
};
