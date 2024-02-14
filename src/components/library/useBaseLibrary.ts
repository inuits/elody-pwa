import type { ApolloClient } from "@apollo/client/core";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type {
  AdvancedFilterInput,
  AdvancedFilters,
  BaseEntity,
  DropdownOption,
  Entity,
  FilterMatcherMap,
  GetAdvancedFiltersQuery,
  GetEntitiesQueryVariables,
  GetFilterMatcherMappingQuery,
  GetPaginationLimitOptionsQuery,
  GetSortOptionsQuery,
  IntialValues,
  Maybe,
  Metadata,
} from "@/generated-types/queries";
import {
  Entitytyping,
  GetAdvancedFiltersDocument,
  GetEntitiesDocument,
  GetFilterMatcherMappingDocument,
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
} from "@/generated-types/queries";
import useEditMode from "@/composables/useEdit";
import { createPlaceholderEntities } from "@/helpers";
import { ref, watch } from "vue";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import { useStateManagement } from "@/composables/useStateManagement";

export const useBaseLibrary = (
  apolloClient: ApolloClient<any>,
  hasParentFilters: boolean
) => {
  const libraryBarInitializationStatus = ref<
    "not-initialized" | "inProgress" | "initialized"
  >("not-initialized");
  const paginationLimitOptions = ref<DropdownOption[]>([]);
  const sortOptions = ref<DropdownOption[]>([]);
  const paginationLimitOptionsLoaded = ref<boolean>(false);
  const sortOptionsLoaded = ref<boolean>(false);
  const isSearchLibrary = ref<boolean>(false);
  const initializeLibraryBar = async () => {
    libraryBarInitializationStatus.value = "inProgress";
    paginationLimitOptionsLoaded.value = false;
    sortOptionsLoaded.value = false;

    apolloClient
      .query<GetPaginationLimitOptionsQuery>({
        query: GetPaginationLimitOptionsDocument,
      })
      .then((result) => {
        paginationLimitOptions.value =
          result.data?.PaginationLimitOptions.options || [];
        queryVariables.value.limit =
          paginationLimitOptions.value?.[0].value || 20;
        paginationLimitOptionsLoaded.value = true;
      });

    apolloClient
      .query<GetSortOptionsQuery>({
        query: GetSortOptionsDocument,
        variables: { entityType: entityType.value },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        sortOptions.value =
          /* @ts-ignore */
          result.data?.EntityTypeSortOptions.sortOptions?.options || [];
        queryVariables.value.searchValue.order_by =
          sortOptions.value?.[0]?.value || "";
        sortOptionsLoaded.value = true;
      });
  };

  watch(
    [() => paginationLimitOptionsLoaded.value, () => sortOptionsLoaded.value],
    () => {
      if (paginationLimitOptionsLoaded.value && sortOptionsLoaded.value)
        libraryBarInitializationStatus.value = "initialized";
    }
  );

  const filtersBaseInitializationStatus = ref<
    "not-initialized" | "inProgress" | "initialized"
  >("not-initialized");
  const filterMatcherMapping = ref<FilterMatcherMap>({
    id: [],
    text: [],
    date: [],
    number: [],
    selection: [],
    boolean: [],
    type: [],
    metadata_on_relation: [],
  });
  const advancedFilters = ref<Maybe<AdvancedFilters>>();
  const initializeFiltersBase = async () => {
    filtersBaseInitializationStatus.value = "inProgress";
    const filterMatcherMappingLoaded = ref<boolean>(false);
    const advancedFiltersLoaded = ref<boolean>(false);

    apolloClient
      .query<GetFilterMatcherMappingQuery>({
        query: GetFilterMatcherMappingDocument,
      })
      .then((result) => {
        filterMatcherMapping.value = result.data.FilterMatcherMapping;
        filterMatcherMappingLoaded.value = true;
      });

    apolloClient
      .query({
        query: manipulateQuery.value
          ?  manipulationQuery.value.filtersDocument
          : GetAdvancedFiltersDocument,
        variables: { entityType: entityType.value },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        advancedFilters.value = (
          result.data?.EntityTypeFilters as BaseEntity
        )?.advancedFilters;
        if (advancedFilters.value) {
          if(manipulateQuery.value) setAdvancedFilterInputs(advancedFilters.value);
          setAdvancedFilters([]);
          Object.values(advancedFilters.value).forEach((advancedFilter) => {
            if (
              typeof advancedFilter !== "string" &&
              advancedFilter.type === "type"
            ) {
              const filter: AdvancedFilterInput = {
                type: advancedFilter.type,
                parent_key: advancedFilter.parentKey,
                key: advancedFilter.key,
                value: advancedFilter.defaultValue,
                match_exact: true,
              };
              setAdvancedFilters([filter]);
            }
          });
        }
        advancedFiltersLoaded.value = true;
      });

    watch(
      [
        () => filterMatcherMappingLoaded.value,
        () => advancedFiltersLoaded.value,
      ],
      () => {
        if (filterMatcherMappingLoaded.value && advancedFiltersLoaded.value)
          filtersBaseInitializationStatus.value = "initialized";
      }
    );
  };

  const _route = ref<RouteLocationNormalizedLoaded>();
  const entities = ref<Entity[]>([]);
  const entitiesLoading = ref<boolean>(false);
  const entityType = ref<Entitytyping>(Entitytyping.BaseEntity);
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();
  const totalEntityCount = ref<number>(0);
  const { getStateForRoute, setStateForRoute } = useStateManagement();
  const { isSaved } = useEditMode();
  const {
    setAdvancedFilterInputs,
    createQueryVariables,
  } = useQueryVariablesFactory();
  const queryVariables = ref<GetEntitiesQueryVariables>({
    type: entityType.value,
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
  });

  const setManipulationOfQuery = (
    manipulate: boolean,
    manipulation: object
  ) => {
    manipulateQuery.value = manipulate;
    manipulationQuery.value = manipulation;
  };

  const __setEntitiesLoading = (isLoading: boolean) =>
    (entitiesLoading.value = isLoading);

  const setEntityType = (type: Entitytyping): void => {
    entityType.value = type;
    queryVariables.value.type = type;
  };
  const setIsSearchLibrary = (searchLibrary: boolean): void => {
    isSearchLibrary.value = searchLibrary;
  };

  const setEntities = (newEntities: Entity[]): void => {
    entities.value = newEntities;
    __setEntitiesLoading(false);
  };

  const setTotalEntityCount = (newCount: number): void => {
    totalEntityCount.value = newCount;
  };

  const setAdvancedFilters = (filters: AdvancedFilterInput[]): void => {
    if (filters === queryVariables.value.advancedFilterInputs && !isSaved.value)
      return;

    __setEntitiesLoading(true);
    queryVariables.value.advancedFilterInputs = [];
    queryVariables.value.advancedFilterInputs = filters;
    queryVariables.value.skip = 1;
  };

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

  const getEntities = async (
    route: RouteLocationNormalizedLoaded | undefined,
    force: boolean = false
  ): Promise<void> => {
    if (
      !force &&
      libraryBarInitializationStatus.value === "initialized" &&
      filtersBaseInitializationStatus.value === "initialized"
    )
      return;

    _route.value = route;
    __setEntitiesLoading(true);

    if (libraryBarInitializationStatus.value === "not-initialized")
      await initializeLibraryBar();
    if (filtersBaseInitializationStatus.value === "not-initialized")
      await initializeFiltersBase();

    if (
      libraryBarInitializationStatus.value === "initialized" &&
      filtersBaseInitializationStatus.value === "initialized"
    ) {
      __doEntitiesCall();
    } else {
      if (
        (libraryBarInitializationStatus.value === "not-initialized" &&
          filtersBaseInitializationStatus.value === "initialized") ||
        (libraryBarInitializationStatus.value === "initialized" &&
          filtersBaseInitializationStatus.value === "not-initialized")
      )
        __doEntitiesCall();
      if (
        (libraryBarInitializationStatus.value === "initialized" &&
          filtersBaseInitializationStatus.value === "inProgress") ||
        (libraryBarInitializationStatus.value === "inProgress" &&
          filtersBaseInitializationStatus.value === "initialized")
      )
        __doEntitiesCall();
      if (
        libraryBarInitializationStatus.value === "inProgress" &&
        filtersBaseInitializationStatus.value === "inProgress" &&
        paginationLimitOptionsLoaded.value &&
        sortOptionsLoaded.value
      )
        __doEntitiesCall();
    }
  };

  const __doEntitiesCall = () => {
    const state = getStateForRoute(_route.value);
    let variables = state?.queryVariables;
    if (variables) {
      queryVariables.value.type = variables.type;
      queryVariables.value.limit = variables.limit;
      queryVariables.value.skip = variables.skip;
      queryVariables.value.searchValue.value = variables.searchValue.value;
      queryVariables.value.searchValue.isAsc = variables.searchValue.isAsc;
      queryVariables.value.searchValue.key = variables.searchValue.key;
      queryVariables.value.searchValue.order_by =
        variables.searchValue.order_by;
      queryVariables.value.searchInputType = variables.searchInputType;
    } else {
      setStateForRoute(_route.value, {
        entityCountOnPage: state?.entityCountOnPage || 1,
        queryVariables: queryVariables.value,
        filterListItems: state?.filterListItems || [],
      });
    }
    if (!variables || _route.value?.name === "SingleEntity")
      variables = queryVariables.value;

    apolloClient
      .query({
        query: manipulateQuery.value
          ? manipulationQuery.value.document
          : GetEntitiesDocument,
        variables: manipulateQuery.value ? createQueryVariables() : variables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entities = result.data.Entities;
        setEntities(entities?.results as Entity[]);
        totalEntityCount.value = entities?.count || 0;

        const state = getStateForRoute(_route.value);
        setStateForRoute(_route.value, {
          entityCountOnPage: entities.results.length,
          queryVariables: state?.queryVariables || queryVariables.value,
          filterListItems: state?.filterListItems || [],
        });
        __setEntitiesLoading(false);
      });
  };

  watch(
    [
      () => libraryBarInitializationStatus.value,
      () => filtersBaseInitializationStatus.value,
    ],
    () => {
      if (
        !hasParentFilters &&
        libraryBarInitializationStatus.value === "initialized" &&
        filtersBaseInitializationStatus.value === "initialized" &&
        paginationLimitOptionsLoaded.value &&
        sortOptionsLoaded.value
      )
        if (
          !isSearchLibrary.value ||
          (isSearchLibrary.value &&
            queryVariables.value.advancedFilterInputs.length > 0)
        )
          __doEntitiesCall();
    }
  );
  watch(
    () => entitiesLoading.value,
    () => {
      if (entitiesLoading.value && _route.value?.name !== "SingleEntity") {
        let placeholderAmount = 1;
        const entityCountOnPage = getStateForRoute(
          _route.value
        )?.entityCountOnPage;
        if (entityCountOnPage !== undefined)
          placeholderAmount = entityCountOnPage;
        entities.value = createPlaceholderEntities(placeholderAmount);
      }
    }
  );
  watch(
    () => queryVariables.value,
    () => {
      if (
        libraryBarInitializationStatus.value === "not-initialized" &&
        filtersBaseInitializationStatus.value === "not-initialized"
      )
        return;

      if (
        libraryBarInitializationStatus.value !== "inProgress" &&
        filtersBaseInitializationStatus.value !== "inProgress"
      ) {
        __setEntitiesLoading(true);

        const state = getStateForRoute(_route.value);
        setStateForRoute(_route.value, {
          entityCountOnPage: state?.entityCountOnPage || 1,
          queryVariables: queryVariables.value,
          filterListItems: state?.filterListItems || [],
        });

        getEntities(_route.value);
        __doEntitiesCall();
      }
    },
    { deep: true }
  );

  return {
    advancedFilters,
    entities,
    entitiesLoading,
    filterMatcherMapping,
    filtersBaseInitializationStatus,
    formatTeaserMetadata,
    getEntities,
    libraryBarInitializationStatus,
    paginationLimitOptions,
    queryVariables,
    setAdvancedFilters,
    setEntities,
    setEntityType,
    setIsSearchLibrary,
    setManipulationOfQuery,
    setTotalEntityCount,
    sortOptions,
    totalEntityCount,
  };
};
