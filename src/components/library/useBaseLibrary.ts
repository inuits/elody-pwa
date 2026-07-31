import type { ApolloClient } from "@apollo/client/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { dequal as isEqual } from "dequal";
import { SearchInputType } from "@/generated-types/queries";
import {
  Entitytyping,
  type AdvancedFilterInput,
  type Entity,
  type GetEntitiesQueryVariables,
  GetEntityByIdDocument,
  type GetEntityByIdQueryVariables,
  BaseLibraryModes,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { asString } from "@/helpers";
import { ref, shallowRef, watch, inject } from "vue";
import { useStateManagement } from "@/composables/useStateManagement";
import { useI18n } from "vue-i18n";
import { isAbortError } from "@/helpers";
import { useImport } from "@/composables/useImport";

export const useBaseLibrary = (
  apolloClient: ApolloClient<any>,
  shouldUseStateForRoute: boolean = true,
  baseLibraryMode: BaseLibraryModes = BaseLibraryModes.NormalBaseLibrary,
) => {
  let entityType: Entitytyping = Entitytyping.BaseEntity;
  let _route: RouteLocationNormalizedLoaded | undefined;
  const config: any = inject("config");
  const entities = shallowRef<Entity[]>([]);
  const facets = shallowRef<any>([]);
  const placeholderEntities = shallowRef<Entity[]>([]);
  const placeholderEntitiesAmount = ref<number>(0);
  const entitiesLoading = ref<boolean>(false);
  const isSearchLibrary = ref<boolean>(false);
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();
  const promiseQueue = ref<((entityType: Entitytyping) => Promise<void>)[]>([]);
  const totalEntityCount = ref<number>(0);
  const fetchSequence = ref<number>(0);
  // Exact total fetched on demand when the user clicks the capped "<cap>+" count.
  // Kept separate from totalEntityCount so it stays display-only: it never feeds
  // pagination or the optimistic-count path. Null means "not revealed".
  const exactTotalCount = ref<number | null>(null);
  const exactCountLoading = ref<boolean>(false);
  // Bumped whenever a new listing fetch starts; lets revealExactCount() detect
  // that the listing changed while its request was in flight and discard a
  // now-stale response instead of overwriting state for the new listing.
  let listingGeneration = 0;
  const { locale } = useI18n();
  const { getStateForRoute, updateStateForRoute } = useStateManagement();

  const getDefaultQueryVariables = (): GetEntitiesQueryVariables => ({
    type: Entitytyping.BaseEntity,
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
    searchInputType: SearchInputType.AdvancedInputType,
    userUuid: "", // TODO: refactor needed
    preferredLanguage: config.features.supportsMultilingualMetadataEditing
      ? locale.value
      : undefined,
  });
  let queryVariables: GetEntitiesQueryVariables = getDefaultQueryVariables();
  let hasPendingFetch = false;
  let pendingFetchRoute: RouteLocationNormalizedLoaded | undefined;

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
      const storedState = getStateForRoute(_route, true);
      if (storedState?.queryVariables) {
        queryVariables.searchValue = {
          ...queryVariables.searchValue,
          ...(storedState.queryVariables.searchValue || {}),
        };
      }
      queryVariables.skip = storedState?.queryVariables?.skip || 1;
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

    if (shouldUseStateForRoute) updateStateForRoute(_route, { queryVariables });
    if (forceFetch && _route !== undefined) await getEntities(_route);
  };

  const enqueuePromise = (
    promise: (entityType: Entitytyping) => Promise<void>,
  ) => {
    // Dedupe by reference identity, not by `promise.name`: minification mangles
    // function names and can collapse distinct promises (e.g. advancedFilters)
    // onto the same short name, which made them get wrongly skipped here.
    if (promise && !promiseQueue.value.includes(promise))
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

  const fetchAllPromises = async () => {
    await Promise.all(promiseQueue.value.map((promise) => promise(entityType)));
    while (promiseQueue.value.length > 0) promiseQueue.value.shift();
  };

  const determineEntitiesQuery = async (
    route: RouteLocationNormalizedLoaded,
    manipulationQueryDocument: string | undefined,
  ): Promise<any> => {
    if (manipulationQueryDocument) return manipulationQueryDocument;
    const { loadDocument } = useImport();
    if (isSearchLibrary.value) return await loadDocument("GetEntities");
    try {
      const query = route!.meta!.queries!.getEntities;
      return await loadDocument(query);
    } catch {
      return await loadDocument("GetEntities");
    }
  };

  const getEntities = async (
    route: RouteLocationNormalizedLoaded | undefined,
    signal?: AbortSignal,
    limitForEntityPicker?: number,
  ): Promise<Entity[] | void> => {
    if (entitiesLoading.value && !signal) {
      if (!limitForEntityPicker) {
        hasPendingFetch = true;
        pendingFetchRoute = route;
      }
      return;
    }
    entitiesLoading.value = true;
    // A new listing (filter/page/limit change) invalidates any revealed exact
    // total (and any in-flight reveal request); drop back to the capped
    // display until the user asks again. The generation bump lets a
    // still-in-flight revealExactCount() detect it's now stale and discard
    // its result instead of overwriting state for the new listing.
    listingGeneration += 1;
    exactTotalCount.value = null;
    exactCountLoading.value = false;

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
    if (limitForEntityPicker) variables.limit = limitForEntityPicker;

    try {
      const result = await apolloClient.query({
        query: await determineEntitiesQuery(
          _route,
          manipulationQuery.value?.document,
        ),
        variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
        context: {
          fetchOptions: {
            signal,
          },
        },
      });

      const fetchedEntities =
        result.data.Entities || result.data.EntitiesHistory;
      if (limitForEntityPicker) return fetchedEntities;

      totalEntityCount.value = fetchedEntities?.count || 0;
      facets.value = fetchedEntities.facets || [];
      fetchSequence.value += 1;
      if (!isEqual(entities.value, fetchedEntities?.results as Entity[])) {
        entities.value = fetchedEntities?.results as Entity[];
      }
      if (shouldUseStateForRoute) {
        updateStateForRoute(_route, {
          entityCountOnPage: fetchedEntities.results.length,
          totalEntityCount: fetchedEntities.count,
        });
      }
    } catch (error: any) {
      const isAborted = isAbortError(error);

      if (!isAborted) {
        console.error("Failed to get entities:", error);
      }
    } finally {
      entitiesLoading.value = false;
    }

    if (hasPendingFetch && !signal) {
      hasPendingFetch = false;
      const nextRoute = pendingFetchRoute ?? route;
      pendingFetchRoute = undefined;
      await getEntities(nextRoute);
    }
  };

  // Fetch the exact (uncapped) total for the current filters on demand, using a
  // dedicated count-only query so listing state (entities, totalEntityCount,
  // fetchSequence, pagination) is never touched.
  // ponytail: scoped to the standard listing filter path; routes that swap in a
  // custom getEntities query (route.meta.queries.getEntities, e.g. job filters)
  // aren't covered by this shared count query — wire a matching count query if
  // one of those ever needs an on-demand exact total.
  const revealExactCount = async (): Promise<void> => {
    const { loadDocument } = useImport();
    const variables =
      (shouldUseStateForRoute &&
        _route?.name !== "SingleEntity" &&
        getStateForRoute(_route)?.queryVariables) ||
      queryVariables;
    const generation = listingGeneration;

    exactCountLoading.value = true;
    try {
      const result = await apolloClient.query({
        query: await loadDocument("GetEntitiesCount"),
        // limit: 1 — the count query discards its results, so don't fetch a full
        // page of documents just to read the count.
        variables: { ...variables, exactCount: true, limit: 1 },
        fetchPolicy: "no-cache",
      });
      // Discard the response if the listing moved on while this was in flight.
      if (generation !== listingGeneration) return;
      exactTotalCount.value = result.data?.Entities?.count ?? null;
    } catch (error: any) {
      console.error("Failed to fetch exact count:", error);
    } finally {
      if (generation === listingGeneration) exactCountLoading.value = false;
    }
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
      if (entitiesLoading.value) {
        let placeholderAmount = 20;
        if (queryVariables.limit) placeholderAmount = queryVariables.limit;
        if (baseLibraryMode === BaseLibraryModes.BasicBaseLibrary) {
          placeholderAmount = 1;
          const entityCountOnPage = getStateForRoute(_route)?.entityCountOnPage;
          if (entityCountOnPage !== undefined)
            placeholderAmount = entityCountOnPage;
        }
        placeholderEntitiesAmount.value =
          placeholderAmount > 20 ? 20 : placeholderAmount;
      } else {
        placeholderEntitiesAmount.value = 1;
      }
    },
  );

  const resetQueryVariablesForNewPath = () => {
    const state = getStateForRoute(_route, true);
    const newVariables = Object.assign(
      getDefaultQueryVariables(),
      state?.queryVariables || {},
    );
    queryVariables = newVariables;
  };

  return {
    enqueuePromise,
    entities,
    facets,
    placeholderEntities,
    placeholderEntitiesAmount,
    entitiesLoading,
    getCustomBulkOperations,
    fetchAllPromises,
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
    resetQueryVariablesForNewPath,
    totalEntityCount,
    fetchSequence,
    exactTotalCount,
    exactCountLoading,
    revealExactCount,
  };
};
