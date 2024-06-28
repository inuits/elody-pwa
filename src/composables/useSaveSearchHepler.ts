import { ref, inject } from "vue";
import {
  GetEntityByIdDocument,
  DeleteDataDocument,
  Entitytyping,
  Collection,
  SearchInputType,
  type BaseEntity,
  type AdvancedFilterInput,
  type GetEntityByIdQueryVariables,
  type SavedSearch,
  type DeleteDataMutation,
} from "@/generated-types/queries";
import type { FilterListItem } from "@/composables/useStateManagement";
import { useI18n } from "vue-i18n";
import type { ApolloClient } from "@apollo/client/core";
import { DefaultApolloClient, useMutation, provideApolloClient } from "@vue/apollo-composable";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { computed } from "vue";
import { apolloClient } from "@/main";

// TODO(savedSearch): move to graphql
export type SavedSearchType = {
  id: string;
  title: string;
  value: FilterListItem[];
};

const activeFilter = ref<any>(null);
const filerToEdit = ref<any>(null);

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

  const setActiveFilter = (filter: any) => {
    activeFilter.value = filter;
  };

  const setFilterToEdit = (filter: any) => {
    filerToEdit.value = filter;
  };

  const fetchSavedSearchById = async (
    id: string
  ): Promise<SavedSearchType | null> => {
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
        return {
          id: entity.uuid || entity.id,
          title: entity.intialValues?.title,
          value: entity.intialValues.filters,
        };
      })
      .catch(() => {
        return null;
      });
  };

  const deleteSavedSearch = async (id: string) => {
    // TODO(savedSearch): delete throws an error regarding appolo id :(
    provideApolloClient(apolloClient);
    const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
    const collection = Collection.Entities;
    return await mutate({ id, path: collection, deleteMediafiles: false });
  };

  const getActiveFilter = () => activeFilter.value;
  const getFilterToEdit = () => filerToEdit.value;

  const entitiesList = computed<SavedSearchType[]>(
    () =>
      entities.value.map((entity: BaseEntity) => {
        return {
          id: entity?.uuid || entity?.id,
          title: entity?.intialValues?.title,
          value: entity?.intialValues?.filters,
        };
      }) || []
  );

  return {
    setActiveFilter,
    getActiveFilter,
    setFilterToEdit,
    getFilterToEdit,
    fetchSavedSearchById,
    deleteSavedSearch,
    initialize,
    entitiesLoading,
    entitiesList,
  };
};
