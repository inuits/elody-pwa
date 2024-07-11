import { ref, toRaw } from "vue";
import {
  GetEntityByIdDocument,
  DeleteDataDocument,
  Entitytyping,
  Collection,
  SearchInputType,
  MutateEntityValuesDocument,
  type AdvancedFilterInput,
  type GetEntityByIdQueryVariables,
  type SavedSearch,
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

type SavedSearchType = {
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
  };
};
