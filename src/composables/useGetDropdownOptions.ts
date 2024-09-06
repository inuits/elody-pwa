import {
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  SearchInputType,
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  type AdvancedFilterInputType,
} from "@/generated-types/queries";
import { computed, inject } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";

export const useGetDropdownOptions = (
  entityType: Entitytyping,
  parent: "fetchAll" | string,
  relationType: string = "",
  searchFilterInput?: AdvancedFilterInput,
  advancedFilterInputForRetrievingOptions?: [AdvancedFilterInput]
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
      key: [`elody:1|relations.${relationType}.key`],
      value: [parentId],
      match_exact: true,
    };
  };

  const initialize = async () => {
    let filters;
    let entityTypeToSet = entityType;
    if (advancedFilterInputForRetrievingOptions) {
      filters = mapOptionsFilterInput(advancedFilterInputForRetrievingOptions);
      entityTypeToSet =
        filters.find(
          (filterInput) => filterInput.type === AdvancedFilterTypes.Type
        )?.value || entityType;
    } else {
      filters =
        parent === "fetchAll" || !relationType
          ? [baseTypeFilter]
          : [getRelationFilter(parent, relationType)];
    }
    setIsSearchLibrary(false);
    setAdvancedFilters(filters as AdvancedFilterInput[]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(entityTypeToSet as Entitytyping);

    await getEntities(undefined);
  };

  const getAutocompleteOptions = (searchValue: string) => {
    let advancedFilters;
    if (advancedFilterInputForRetrievingOptions) {
      advancedFilters = mapOptionsFilterInput(
        advancedFilterInputForRetrievingOptions,
        searchValue
      );
    } else {
      const isEmptyAdvancedSearchFilter =
        !searchFilterInput || Object.values(searchFilterInput).includes(null);
      if (isEmptyAdvancedSearchFilter) return;

      advancedFilters =
        searchValue === ""
          ? [baseTypeFilter]
          : [baseTypeFilter, getSearchFilter(searchValue, searchFilterInput)];
    }

    setAdvancedFilters(advancedFilters as AdvancedFilterInput[]);
    getEntities(undefined);
  };

  const getSearchFilter = (
    value: string,
    searchFilterInput: AdvancedFilterInput
  ) => {
    const { __typename, ...filterProps } = searchFilterInput;
    return { ...filterProps, value };
  };

  const entityDropdownOptions = computed<DropdownOption[]>(
    () =>
      entities.value.map((entity: BaseEntity) => {
        return {
          icon: DamsIcons.NoIcon,
          label: getEntityTitle(entity),
          value: entity.id,
        };
      }) || []
  );

  const mapOptionsFilterInput = (
    advancedFilterInputForRetrievingOptions: AdvancedFilterInputType[],
    value?: any
  ) => {
    return advancedFilterInputForRetrievingOptions.map((filterInput) => {
      return {
        type: filterInput.type,
        key: filterInput.key,
        value: value
          ? filterInput.value === "*"
            ? value
            : filterInput.value
          : filterInput.value,
        match_exact: filterInput.match_exact,
        item_types: filterInput.item_types || [],
      };
    });
  };

  return {
    initialize,
    getAutocompleteOptions,
    entitiesLoading,
    entityDropdownOptions,
  };
};
