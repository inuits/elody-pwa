import type { ApolloClient } from "@apollo/client/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { SearchInputType } from "@/generated-types/queries";
import {
  Entitytyping,
  GetEntitiesDocument,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  GetEntityByIdDocument,
  type GetEntityByIdQueryVariables,
  BaseLibraryModes,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { asString, createPlaceholderEntities } from "@/helpers";
import { ref, shallowRef, watch, inject } from "vue";
import { useStateManagement } from "@/composables/useStateManagement";
import { useI18n } from "vue-i18n";

export const useBaseLibrary = (
  apolloClient: ApolloClient<any>,
  shouldUseStateForRoute: boolean = true,
  baseLibraryMode: BaseLibraryModes = BaseLibraryModes.NormalBaseLibrary,
) => {
  let entityType: Entitytyping = Entitytyping.BaseEntity;
  let _route: RouteLocationNormalizedLoaded | undefined;
  const config: any = inject("config");
  const entities = shallowRef<Entity[]>([]);
  const entitiesLoading = ref<boolean>(false);
  const isSearchLibrary = ref<boolean>(false);
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();
  const promiseQueue = ref<((entityType: Entitytyping) => Promise<void>)[]>([]);
  const totalEntityCount = ref<number>(0);
  const { locale } = useI18n();
  const { getStateForRoute, updateStateForRoute } = useStateManagement();
  let queryVariables: GetEntitiesQueryVariables = {
    type: entityType,
    limit: 20,
    skip: 1,
    searchValue: {
      value: "",
      isAsc: undefined,
      key: "title",
      order_by: "",
    },
    advancedSearchValue: [],
    advancedFilterInputs: [],
    searchInputType: undefined,
    userUuid: "", // refactor needed
    preferredLanguage: config.features.supportsMultilingualMetadataEditing
      ? locale.value
      : undefined,
  };

  const setManipulationOfQuery = (
    manipulate: boolean,
    manipulation: object,
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
    updateSearchValue();
  };

  const setLocale = async (locale: string) => {
    queryVariables.preferredLanguage = locale;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    return true;
  };

  const updateSearchValue = () => {
    const state = getStateForRoute(_route);
    queryVariables.searchValue = {
      value: "",
      isAsc: undefined,
      key: "title",
      order_by: "",
      ...(state?.queryVariables?.searchValue || {}),
    };
  };

  const setsearchInputType = (searchInputType: SearchInputType): void => {
    queryVariables.searchInputType = searchInputType;
  };

  const setAdvancedFilters = async (
    filters: AdvancedFilterInput[],
    stateSaved: boolean = false,
    forceFetch: boolean = false,
    route?: RouteLocationNormalizedLoaded,
  ): Promise<void> => {
    if (route) {
      const useEditHelper = useEditMode(asString(route.params.id));
      if (
        filters === queryVariables.advancedFilterInputs &&
        !useEditHelper.isSaved.value
      )
        return;
      _route = route;
      const storedState = getStateForRoute(_route);
      if (storedState?.queryVariables) {
        queryVariables.searchValue = {
          ...queryVariables.searchValue,
          ...(storedState.queryVariables.searchValue || {}),
        };
      }
    }

    queryVariables.advancedFilterInputs = [];
    queryVariables.advancedFilterInputs = filters;
    if (stateSaved) queryVariables.skip = 1;

    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSkip = async (
    skip: number,
    forceFetch: boolean = false,
  ): Promise<void> => {
    queryVariables.skip = skip;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setLimit = async (
    limit: number,
    forceFetch: boolean = false,
  ): Promise<void> => {
    queryVariables.limit = limit;
    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortKey = async (
    sortKey: string,
    forceFetch: boolean = false,
  ): Promise<void> => {
    queryVariables.searchValue = {
      ...queryVariables.searchValue,
      order_by: sortKey,
    };

    if (shouldUseStateForRoute)
      updateStateForRoute(_route, { queryVariables: { ...queryVariables } });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const setSortOrder = async (
    isAsc: boolean,
    forceFetch: boolean = false,
  ): Promise<void> => {
    queryVariables.searchValue.isAsc = isAsc;
    if (shouldUseStateForRoute)
      updateStateForRoute(_route, { queryVariables }, "useBaseLibrary#129");
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const enqueuePromise = (
    promise: (entityType: Entitytyping) => Promise<void>,
  ) => {
    if (
      promise &&
      !promiseQueue.value.find(
        (queuedPromise) => queuedPromise.name === promise.name,
      )
    )
      promiseQueue.value.push(promise);
  };

  const getCustomBulkOperations = async () => {
    const bulkOperationsPromise = promiseQueue.value.find(
      (promise) => promise.name === "customBulkOperationsPromise",
    );
    if (bulkOperationsPromise) await bulkOperationsPromise();
    promiseQueue.value = promiseQueue.value.filter(
      (promise) => promise.name !== "customBulkOperationsPromise",
    );
  };

  const getEntities = async (
    route: RouteLocationNormalizedLoaded | undefined,
  ): Promise<void> => {
    if (entitiesLoading.value) return;
    entitiesLoading.value = true;

    await Promise.all(promiseQueue.value.map((promise) => promise(entityType)));
    while (promiseQueue.value.length > 0) promiseQueue.value.shift();

    _route = route;
    let variables =
      shouldUseStateForRoute &&
      _route?.name !== "SingleEntity" &&
      getStateForRoute(_route)?.queryVariables;
    if (variables) queryVariables = variables;
    else if (!variables && shouldUseStateForRoute)
      updateStateForRoute(_route, { queryVariables });
    if (
      !variables ||
      _route?.name === "SingleEntity" ||
      !shouldUseStateForRoute
    )
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
        if (shouldUseStateForRoute)
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

  const getEntityById = async (
    entityType: Entitytyping,
    id: string,
  ): Promise<void> => {
    const variables: GetEntityByIdQueryVariables = {
      id: id,
      type: entityType,
    };
    await apolloClient
      .query({
        query: GetEntityByIdDocument,
        variables: variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entity = result.data.Entity;
        entities.value.push(entity);
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
        let placeholderAmount = 20;
        if (baseLibraryMode === BaseLibraryModes.BasicBaseLibrary)
          placeholderAmount = 1;
        const entityCountOnPage = getStateForRoute(_route)?.entityCountOnPage;
        if (entityCountOnPage !== undefined)
          placeholderAmount = entityCountOnPage;
        entities.value = createPlaceholderEntities(placeholderAmount);
      }
    },
  );

  return {
    enqueuePromise,
    entities,
    entitiesLoading,
    getCustomBulkOperations,
    getEntities,
    getEntityById,
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
    setLocale,
    totalEntityCount,
  };
};
