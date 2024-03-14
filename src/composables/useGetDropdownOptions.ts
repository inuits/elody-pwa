import {
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  SearchInputType,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { computed, inject } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { DefaultApolloClient } from "@vue/apollo-composable";
// import {apolloClient} from "@/main";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";

export const useGetDropdownOptions = (
  entityType: Entitytyping,
  parent: "fetchAll" | string,
  relationType?: string
) => {
  const apolloClient = inject(DefaultApolloClient);
  const {
    entities,
    entitiesLoading,
    getEntities,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setsearchInputType,
  } = useBaseLibrary(apolloClient as ApolloClient<any>);

  const baseTypeFilter = {
    type: "type",
    value: entityType,
    match_exact: true,
  };

  const getRelationFilter = (parentId: string, relationType: string) => {
    return {
      type: "selection",
      parent_key: "relations",
      key: relationType,
      value: [parentId],
      match_exact: true,
    };
  };

  const initialize = async () => {
    const filters =
      parent === "fetchAll" || !relationType
        ? [baseTypeFilter]
        : [getRelationFilter(parent, relationType)];
    setIsSearchLibrary(false);
    setAdvancedFilters(filters as AdvancedFilterInput[]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(entityType);

    await getEntities(undefined);
  };

  const setSearchInput = (searchValue: string) => {
    const advancedFilters =
      searchValue === ""
        ? [baseTypeFilter]
        : [baseTypeFilter, getSearchFilter(searchValue)];

    setAdvancedFilters(advancedFilters as AdvancedFilterInput[]);
    getEntities(undefined);
  };

  const getSearchFilter = (searchValue: string) => {
    return {
      type: "text",
      parent_key: "metadata",
      key: "title",
      value: searchValue,
      match_exact: false,
    };
  };

  const entityDropdownOptions = computed<DropdownOption[]>(() => {
    if (entitiesLoading.value) return [];
    return entities.value.map((entity: BaseEntity) => {
      return {
        icon: DamsIcons.NoIcon,
        label: getEntityTitle(entity),
        value: entity.id,
      };
    });
  });

  return {
    initialize,
    setSearchInput,
    entitiesLoading,
    entityDropdownOptions,
  };
};
