import type { ApolloClient } from "@apollo/client/core";
import {
  Entitytyping,
  GetAdvancedFiltersDocument,
  GetEntitiesDocument,
  GetFilterMatcherMappingDocument,
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
} from "@/generated-types/queries";
import type {
  AdvancedFilterInput,
  AdvancedFilters,
  BaseEntity,
  DropdownOption,
  Entity,
  FilterMatcherMap,
  GetAdvancedFiltersQuery,
  GetEntitiesQuery,
  GetEntitiesQueryVariables,
  GetFilterMatcherMappingQuery,
  GetPaginationLimitOptionsQuery,
  GetSortOptionsQuery,
  Maybe,
  Metadata,
  IntialValues,
} from "@/generated-types/queries";
import useEditMode from "@/composables/useEdit";
import { useQueryVariablesFactory } from "@/composables/useQueryVariablesFactory";
import { createPlaceholderEntities } from "@/helpers";
import { ref, watch } from "vue";

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
      .query<GetAdvancedFiltersQuery>({
        query: GetAdvancedFiltersDocument,
        variables: { entityType: entityType.value },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        advancedFilters.value = (
          result.data?.EntityTypeFilters as BaseEntity
        )?.advancedFilters;
        if (advancedFilters.value) {
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

  const queryVariables = ref<GetEntitiesQueryVariables>({
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
  const entityType = ref<Entitytyping | "BaseEntity">("BaseEntity");
  const entities = ref<Entity[]>([]);
  const totalEntityCount = ref<number>(0);
  const entitiesLoading = ref<boolean>(false);
  const entitiesLoaded = ref<boolean>(false);
  const { isSaved } = useEditMode();
  const { createQueryVariables } = useQueryVariablesFactory();
  const manipulateQuery = ref<boolean>(false);
  const manipulationQuery = ref<object>();

  const setManipulationOfQuery = (manipulate: boolean, manipulation: object) => {
    manipulateQuery.value = manipulate;
    manipulationQuery.value = manipulation;
  }

  const __setEntitiesLoading = (isLoading: boolean) =>
    (entitiesLoading.value = isLoading);

  const setEntityType = (type: Entitytyping | "BaseEntity"): void => {
    entityType.value = type;
  };

  const setEntities = (newEntities: Entity[]): void => {
    entities.value = newEntities;
    __setEntitiesLoading(false);
    entitiesLoaded.value = true;
  };

  const setTotalEntityCount = (newCount: number): void => {
    totalEntityCount.value = newCount;
  };

  const setAdvancedFilters = (filters: AdvancedFilterInput[]): void => {
    __setEntitiesLoading(true);
    if (filters === queryVariables.value.advancedFilterInputs && !isSaved.value)
      return;

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

  const getEntities = async (force: boolean = false): Promise<void> => {
    if (
      !force &&
      libraryBarInitializationStatus.value === "initialized" &&
      filtersBaseInitializationStatus.value === "initialized"
    )
      return;

    entitiesLoaded.value = false;
    setTimeout(() => {
      if (!entitiesLoaded.value) __setEntitiesLoading(true);
      entitiesLoaded.value = false;
    }, 100);

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
    apolloClient
      .query({
        query: manipulateQuery.value ? manipulationQuery.value.document : GetEntitiesDocument,
        variables: manipulateQuery.value ? createQueryVariables() : queryVariables.value,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entities = result.data.Entities;
        setEntities(entities?.results as Entity[]);
        totalEntityCount.value = entities?.count || 0;
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
        __doEntitiesCall();
    }
  );
  watch(
    () => entitiesLoading.value,
    (isLoading) => {
      if (isLoading) {
        const placeholderAmount = queryVariables.value?.limit || 25;
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
        getEntities();
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
    setManipulationOfQuery,
    setEntities,
    setEntityType,
    setTotalEntityCount,
    sortOptions,
    totalEntityCount,
  };
};
