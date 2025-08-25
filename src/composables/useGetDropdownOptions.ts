import type {
  Entitytyping} from "@/generated-types/queries";
import {
  type AdvancedFilterInput,
  type AdvancedFilterInputType,
  AdvancedFilterTypes,
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  EditStatus,
  SearchInputType,
} from "@/generated-types/queries";
import { computed, inject } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import { omitDeep } from "@apollo/client/utilities";

export const useGetDropdownOptions = (
  entityType: Entitytyping,
  parent: "fetchAll" | string,
  relationType: string = "",
  fromRelationType: string = "",
  searchFilterInput?: AdvancedFilterInput,
  advancedFilterInputForRetrievingOptions?: [AdvancedFilterInput],
  formId?: string,
  relationFilter?: AdvancedFilterInput,
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

  const getRelationFilter = (
    parentId: string,
    relationType: string,
    relationFilter: AdvancedFilterInput | undefined,
  ): AdvancedFilterInput => {
    if (relationFilter) {
      const completeRelationFilter =  omitDeep(relationFilter, '__typename');
      if (completeRelationFilter.value.includes("$parentId"))
        completeRelationFilter.value = [parent];
      return completeRelationFilter;
    }

    return {
      type: AdvancedFilterTypes.Selection,
      key: [`elody:1|relations.${relationType}.key`],
      value: [parentId],
      match_exact: true,
    };
  };

  const initialize = async () => {
    let filters;
    let entityTypeToSet = entityType;
    if (
      advancedFilterInputForRetrievingOptions &&
      advancedFilterInputForRetrievingOptions.length > 0
    ) {
      filters = mapOptionsFilterInput(advancedFilterInputForRetrievingOptions);
      filters =
        parent !== "fetchAll" && (relationType || fromRelationType)
          ? [...filters, getRelationFilter(parent, fromRelationType, relationFilter)]
          : filters;
      entityTypeToSet =
        filters.find(
          (filterInput) => filterInput.type === AdvancedFilterTypes.Type,
        )?.value || entityType;
    } else {
      filters =
        parent === "fetchAll" || !fromRelationType
          ? [baseTypeFilter]
          : [getRelationFilter(parent, fromRelationType, relationFilter)];
    }
    setIsSearchLibrary(false);
    setAdvancedFilters(filters as AdvancedFilterInput[]);
    setsearchInputType(SearchInputType.AdvancedInputType);
    setEntityType(entityTypeToSet as Entitytyping);

    await getEntities(undefined);
  };

  const getAutocompleteOptions = (searchValue: string) => {
    let advancedFilters;
    if (
      advancedFilterInputForRetrievingOptions &&
      advancedFilterInputForRetrievingOptions.length > 0
    ) {
      advancedFilters = mapOptionsFilterInput(
        advancedFilterInputForRetrievingOptions,
        searchValue,
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
    searchFilterInput: AdvancedFilterInput,
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
      }) || [],
  );

  const mapOptionsFilterInput = (
    advancedFilterInputForRetrievingOptions: AdvancedFilterInputType[],
    value?: any,
  ) => {
    return advancedFilterInputForRetrievingOptions.map((filterInput) => {
      let _value;

      if (formId && filterInput.value.includes("$")) {
        _value = getVariableValueForFilter(
          formId,
          filterInput.value,
          filterInput.returnIdAtIndex ?? 0,
        );
      } else {
        _value = value
          ? filterInput.value === "*"
            ? value
            : filterInput.value
          : filterInput.value;
      }

      return {
        type: filterInput.type,
        key: filterInput.key,
        value: _value,
        match_exact: filterInput.match_exact,
        item_types: filterInput.item_types || [],
      };
    });
  };

  const getVariableValueForFilter = (
    formId: string,
    variable: string,
    returnIdAtIndex: number = 0,
  ) => {
    const form = getFormWithRelationFieldCheck(
      formId,
      variable.replace("$", ""),
    );
    if (!form) return variable;

    const relations = form.values.relationValues[variable.replace("$", "")];
    if (
      !relations ||
      !Array.isArray(relations) ||
      (Array.isArray(relations) && relations.length === 0) ||
      hasOnlyDeletedRelations(relations)
    )
      return variable;

    const hasNew = hasNewRelations(relations);
    if (hasNew) return findNewRelationValue(relations);
    if (returnIdAtIndex === -1) return relations.map((rel) => rel.key);
    return relations[returnIdAtIndex].key;
  };

  const getFormWithRelationFieldCheck = (formId: string, field: string) => {
    const form = useFormHelper().getForm(formId);
    if (!form || !form.values.relationValues[field]) return null;
    return form;
  };

  const hasOnlyDeletedRelations = (relations: { editStatus?: string }[]) => {
    const hasDeleted = relations.some((item) =>
      ([EditStatus.Deleted] as string[]).includes(item?.editStatus || ""),
    );

    const hasNew = hasNewRelations(relations);

    return !hasNew && hasDeleted;
  };

  const hasNewRelations = (relations: { editStatus?: string }[]) => {
    return relations.some((item) =>
      ([EditStatus.New] as string[]).includes(item?.editStatus || ""),
    );
  };

  const findNewRelationValue = (
    relations: { editStatus?: string; key: string }[],
  ) => {
    return (
      relations.find((item) => item.editStatus === EditStatus.New)?.key || null
    );
  };

  return {
    initialize,
    getAutocompleteOptions,
    entitiesLoading,
    entityDropdownOptions,
    getFormWithRelationFieldCheck,
    getVariableValueForFilter,
    hasNewRelations,
    findNewRelationValue,
  };
};
