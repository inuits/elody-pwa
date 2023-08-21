import type { ApolloClient } from "@apollo/client/core";
import {
  Entitytyping,
  GetAdvancedFiltersDocument,
  GetEntitiesDocument,
  GetFilterMatcherMappingDocument,
  GetPaginationLimitOptionsDocument,
  GetSortOptionsDocument,
  type AdvancedFilterInput,
  type AdvancedFilters,
  type BaseEntity,
  type DropdownOption,
  type Entity,
  type FilterMatcherMap,
  type GetAdvancedFiltersQuery,
  type GetEntitiesQuery,
  type GetEntitiesQueryVariables,
  type GetFilterMatcherMappingQuery,
  type GetPaginationLimitOptionsQuery,
  type GetSortOptionsQuery,
  type Maybe,
  type Metadata,
  type IntialValues,
} from "@/generated-types/queries";
import useEditMode from "@/composables/useEdit";
import { createPlaceholderEntities } from "@/helpers";
import { ref, watch } from "vue";

export const useBaseLibrary = (apolloClient: ApolloClient<any>) => {
  const libraryBarInitializationStatus = ref<
    "not-initialized" | "inProgress" | "initialized"
  >("not-initialized");
  const paginationLimitOptions = ref<DropdownOption[]>([]);
  const sortOptions = ref<DropdownOption[]>([]);
  const initializeLibraryBar = () => {
    libraryBarInitializationStatus.value = "inProgress";
    const paginationLimitOptionsLoaded = ref<boolean>(false);
    const sortOptionsLoaded = ref<boolean>(false);

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

    watch(
      [() => paginationLimitOptionsLoaded.value, () => sortOptionsLoaded.value],
      () => {
        if (paginationLimitOptionsLoaded.value && sortOptionsLoaded.value)
          libraryBarInitializationStatus.value = "initialized";
      }
    );
  };

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
    relation: [],
  });
  const advancedFilters = ref<Maybe<AdvancedFilters>>();
  const initializeFiltersBase = () => {
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
  const entitiesLoading = ref<boolean>(true);
  const { isSaved } = useEditMode();

  const __setEntitiesLoading = (isLoading: boolean) =>
    (entitiesLoading.value = isLoading);

  const setEntityType = (type: Entitytyping | "BaseEntity"): void => {
    entityType.value = type;
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

    queryVariables.value.advancedFilterInputs = [];
    queryVariables.value.advancedFilterInputs = filters;
  };

  const formatTeaserMetadata = (
    teaserMetadata: Record<string, Metadata>,
    intialValues: Record<string, IntialValues>
  ): object => {
    const formatted = [];
    for (const key in teaserMetadata) {
      if (key !== "__typename" && intialValues && intialValues[key]) {
        teaserMetadata[key].value = intialValues[key];
        formatted.push(teaserMetadata[key]);
      }
    }
    return formatted;
  };

  const getEntities = async (): Promise<void> => {
    if (libraryBarInitializationStatus.value === "not-initialized")
      initializeLibraryBar();
    if (filtersBaseInitializationStatus.value === "not-initialized")
      initializeFiltersBase();
    if (
      libraryBarInitializationStatus.value !== "initialized" ||
      filtersBaseInitializationStatus.value !== "initialized"
    )
      return;
    __setEntitiesLoading(true);

    apolloClient
      .query<GetEntitiesQuery>({
        query: GetEntitiesDocument,
        variables: queryVariables.value,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result) => {
        const entities = result.data.Entities;
        setEntities(entities?.results as Entity[]);
        totalEntityCount.value = entities?.count || 0;
      });
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
    () => getEntities(),
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
    setTotalEntityCount,
    sortOptions,
    totalEntityCount,
  };
};
