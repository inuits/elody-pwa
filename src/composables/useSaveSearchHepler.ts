import { ref, toRaw } from "vue";
import {
  GetEntityByIdDocument,
  DeleteDataDocument,
  Entitytyping,
  Collection,
  SearchInputType,
  MutateEntityValuesDocument,
  AdvancedFilterTypes,
  GetEntitiesDocument,
  type GetEntitiesQueryVariables,
  type AdvancedFilterInput,
  type GetEntityByIdQueryVariables,
  type SavedSearch,
  type User,
  type DeleteDataMutation,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  type Entity,
} from "@/generated-types/queries";
import type { FilterListItem } from "@/composables/useStateManagement";
import { useI18n } from "vue-i18n";
import type { ApolloClient } from "@apollo/client/core";
import { useMutation, provideApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { computed } from "vue";
import { apolloClient } from "@/main";
import { useStateManagement } from "@/composables/useStateManagement";
import type { RouteLocationNormalizedLoaded } from "vue-router";
export type SavedSearchType = {
  id: string;
  title: string;
  value: FilterListItem[];
};

const selectedFilter = ref<SavedSearchType | null>(null);

export const useSaveSearchHepler = () => {
  const {
    entities,
    entitiesLoading,
    getEntities,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setsearchInputType,
  } = useBaseLibrary(apolloClient as ApolloClient<any>);
  const { locale } = useI18n();

  const stateManager = useStateManagement();

  const initialize = async (entityType: string) => {
    const filters = [
      {
        type: "type",
        value: Entitytyping.SavedSearch,
        match_exact: true,
      },
      {
        type: "text",
        key: ["elody:1|metadata.applicableType.value"],
        value: entityType,
        match_exact: true,
      },
    ];
    setIsSearchLibrary(false);
    setAdvancedFilters(filters as AdvancedFilterInput[]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(Entitytyping.SavedSearch);

    await getEntities(undefined);
  };

  const setActiveFilter = (filter: SavedSearchType | null) => {
    selectedFilter.value = JSON.parse(JSON.stringify(filter));
  };

  const fetchSavedSearchById = async (id: string): Promise<SavedSearch> => {
    const queryVariables: GetEntityByIdQueryVariables = {
      id,
      type: Entitytyping.SavedSearch,
      preferredLanguage: locale.value,
    };

    return await apolloClient
      .query({
        query: GetEntityByIdDocument,
        variables: queryVariables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result: any) => {
        const entity = result.data?.Entity as SavedSearch;
        return entity;
      });
  };

  const getUserByEmail = async (email: string): Promise<User | undefined> => {
    if (!email) return undefined;
    const advancedFilters = [
      {
        type: AdvancedFilterTypes.Text,
        key: ["elody:1|metadata.email.value"],
        value: email,
        match_exact: false,
        item_types: [Entitytyping.User],
      },
    ];

    const queryVariables: GetEntitiesQueryVariables = {
      type: Entitytyping.User,
      limit: 20,
      skip: 1,
      searchValue: {
        value: "",
        isAsc: false,
        key: "title",
        order_by: "",
      },
      advancedSearchValue: [],
      advancedFilterInputs: advancedFilters,
      searchInputType: SearchInputType.AdvancedInputType,
      preferredLanguage: locale.value,
    };

    return await apolloClient
      .query({
        query: GetEntitiesDocument,
        variables: queryVariables,
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      })
      .then((result: any) => {
        const entity = result.data?.Entities?.results as User[];
        return entity?.[0] || undefined;
      });
  };

  const deleteSavedSearch = async (id: string) => {
    provideApolloClient(apolloClient);
    const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
    const collection = Collection.Entities;
    return await mutate({ id, path: collection, deleteMediafiles: false });
  };

  const saveExistedSearch = async (entity: SavedSearch, newFilters: any) => {
    provideApolloClient(apolloClient);
    const { mutate } = useMutation<
      MutateEntityValuesMutation,
      MutateEntityValuesMutationVariables
    >(MutateEntityValuesDocument);

    const initialValues = { ...entity.intialValues };
    initialValues.filters = newFilters;

    const { __typename, ...filters } = initialValues;

    const result = await mutate({
      id: entity.uuid,
      formInput: {
        metadata: Object.keys(filters).map((key: string) => ({
          key,
          value: filters[key],
        })),
        relations: [],
      },
      collection: Collection.Entities,
    });

    if (!result?.data?.mutateEntityValues) return null;
    return result.data.mutateEntityValues;
  };

  const getActiveFilter = () => {
    return toRaw(selectedFilter.value);
  };

  const extractFiltersFromEntity = (entity: Entity) =>
    entity?.intialValues?.filters;

  const normalizeSavedSearchFromEntity = (entity: SavedSearch) => {
    return {
      id: entity?.uuid || entity?.id,
      title: entity?.intialValues?.title,
      value: entity?.intialValues?.filters,
    };
  };

  const entitiesList = computed<SavedSearchType[]>(
    () =>
      entities.value.map((entity: SavedSearch) => {
        return normalizeSavedSearchFromEntity(entity);
      }) || []
  );

  const getLastUsedFiltersForRoute = (
    path: RouteLocationNormalizedLoaded
  ): SavedSearchType[] => {
    const stateForRoute = stateManager.getStateForRoute(path);
    const lastUsedFilters = stateForRoute?.lastUsedFilters;

    return lastUsedFilters || [];
  };

  const getLastUsedFilterForRoute = (
    path: RouteLocationNormalizedLoaded
  ): SavedSearchType | undefined => {
    const stateForRoute = stateManager.getStateForRoute(path);
    const lastUsedFilters = stateForRoute?.lastUsedFilter;

    return lastUsedFilters || undefined;
  };

  const addNewSavedFilterToLastUsedFiltersForRoute = (
    route: RouteLocationNormalizedLoaded,
    filter: SavedSearchType
  ) => {
    let lastUsedFilters = getLastUsedFiltersForRoute(route);
    lastUsedFilters = lastUsedFilters.filter(
      (item: SavedSearchType) => item.id !== filter.id
    );

    lastUsedFilters.unshift(filter);
    if (lastUsedFilters.length > 5) {
      lastUsedFilters.length = 5;
    }

    stateManager.updateStateForRoute(route, {
      lastUsedFilters: JSON.parse(JSON.stringify(lastUsedFilters)),
    });
  };

  const removeFilterFromStateForRoute = (
    route: RouteLocationNormalizedLoaded,
    filter: SavedSearchType
  ) => {
    const routeFilters = getLastUsedFiltersForRoute(route);
    const filteredFilters = routeFilters.filter(
      (item: SavedSearchType) => item.id !== filter.id
    );

    stateManager.updateStateForRoute(route, {
      lastUsedFilters: JSON.parse(JSON.stringify(filteredFilters)),
    });
  };

  const addLastUsedFilterToStateForRoute = (
    route: RouteLocationNormalizedLoaded,
    filter: SavedSearchType | undefined
  ) => {
    stateManager.updateStateForRoute(route, {
      lastUsedFilter: filter ? JSON.parse(JSON.stringify(filter)) : undefined,
    });
  };

  return {
    setActiveFilter,
    getActiveFilter,
    fetchSavedSearchById,
    deleteSavedSearch,
    initialize,
    entitiesLoading,
    entitiesList,
    entities,
    saveExistedSearch,
    extractFiltersFromEntity,
    normalizeSavedSearchFromEntity,
    getLastUsedFiltersForRoute,
    getLastUsedFilterForRoute,
    addNewSavedFilterToLastUsedFiltersForRoute,
    addLastUsedFilterToStateForRoute,
    removeFilterFromStateForRoute,
    getUserByEmail,
  };
};
