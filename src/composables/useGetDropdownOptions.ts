import {
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  SearchInputType,
  type AdvancedFilterInput,
} from "@/generated-types/queries";
import { computed, ref, inject } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { DefaultApolloClient } from "@vue/apollo-composable";
// import {apolloClient} from "@/main";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";

export const useGetDropdownOptions = (
  entityType: Entitytyping,
  parent: "fetchAll" | string,
  relationType?: string | undefined
) => {
  // parent id
  const options: DropdownOption[] = [];
  const apolloClient = inject(DefaultApolloClient);
  const baseTypeFilter = {
    type: "type",
    value: entityType,
    match_exact: true,
  };
  const relationFilter = (parentId: string) => {
    return {
      type: "selection",
      parent_key: "relations",
      key: "hasLanguage",
      value: [parentId, parentId],
      match_exact: true,
    };
  };
  const {
    entities,
    entitiesLoading,
    getEntities,
    setAdvancedFilters,
    setEntityType,
    setIsSearchLibrary,
    setsearchInputType,
  } = useBaseLibrary(apolloClient as ApolloClient<any>);

  const initialize = async () => {
    const filters =
      parent === "fetchAll" && !relationType
        ? [baseTypeFilter]
        : [baseTypeFilter, relationFilter(parent)];
    setIsSearchLibrary(false);
    setAdvancedFilters(filters as AdvancedFilterInput[]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(entityType);

    await getEntities(undefined);
  };

  // {
  //   "type": "selection",
  //   "parent_key": "relations",
  //   "key": "isControlledAssetFor", // relation type - hasLanguage smth like that
  //   "value": ["urn:ngsi-ld:IotDevice:5345ANT664ADJ1"], //should be ids of parent ids
  //   "item_types": ["PoliceAsset", "PoliceVehicle"]
  //   "match_exact": true
  // }

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
