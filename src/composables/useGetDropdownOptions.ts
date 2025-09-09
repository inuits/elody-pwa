import {
  type AdvancedFilterInput,
  type AdvancedFilterInputType,
  AdvancedFilterTypes,
  type BaseEntity,
  DamsIcons,
  type DropdownOption,
  EditStatus,
  SearchInputType,
  type BaseRelationValuesInput,
  type Entitytyping,
} from "@/generated-types/queries";
import { computed, inject, ref } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle, mapRelationValuesToDropdownOptions } from "@/helpers";
import { useFormHelper } from "@/composables/useFormHelper";
import { omitDeep } from "@apollo/client/utilities";
import type { FormContext } from "vee-validate";

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
  const relationDropdowns = ref<DropdownOption[] | undefined>(undefined);
  const abortController = ref<AbortController | null>(null);
  const currentRequestId = ref(0);
  const isLoading = ref(false);

  const {
    entities,
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
      const completeRelationFilter = omitDeep(relationFilter, "__typename");
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
    if (abortController.value) {
      abortController.value.abort();
      isLoading.value = false;
    }

    const form = useFormHelper().getForm(formId);
    if (form && relationType && parent !== "fetchAll") {
      getRelationDropdownsFromCurrentEntity(form);
      return;
    }

    abortController.value = new AbortController();
    currentRequestId.value++;
    const requestId = currentRequestId.value;

    let filters;
    let entityTypeToSet = entityType;
    isLoading.value = true;
    if (
      advancedFilterInputForRetrievingOptions &&
      advancedFilterInputForRetrievingOptions.length > 0
    ) {
      filters = mapOptionsFilterInput(advancedFilterInputForRetrievingOptions);
      filters =
        parent !== "fetchAll" && (relationType || fromRelationType)
          ? [
              ...filters,
              getRelationFilter(parent, fromRelationType, relationFilter),
            ]
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

    try {
      if (requestId === currentRequestId.value) {
        await getEntities(undefined, abortController.value.signal);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Request failed:", error);
      }
    } finally {
      if (requestId === currentRequestId.value) {
        isLoading.value = false;
      }
    }
  };

  const getAutocompleteOptions = async (searchValue: string) => {
    if (abortController.value) {
      abortController.value.abort();
      isLoading.value = false;
    }

    abortController.value = new AbortController();
    currentRequestId.value++;
    const requestId = currentRequestId.value;

    let advancedFilters;
    isLoading.value = true;
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
      if (isEmptyAdvancedSearchFilter) {
        isLoading.value = false;
        return;
      }

      advancedFilters =
        searchValue === ""
          ? [baseTypeFilter]
          : [baseTypeFilter, getSearchFilter(searchValue, searchFilterInput)];
    }

    setAdvancedFilters(advancedFilters as AdvancedFilterInput[]);

    try {
      if (requestId === currentRequestId.value) {
        await getEntities(undefined, abortController.value.signal);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Request failed:", error);
      }
    } finally {
      if (requestId === currentRequestId.value) {
        isLoading.value = false;
      }
    }
  };

  const getSearchFilter = (
    value: string,
    searchFilterInput: AdvancedFilterInput,
  ) => {
    const { ...filterProps } = searchFilterInput;
    return { ...filterProps, value };
  };

  const entityDropdownOptions = computed<DropdownOption[]>(
    () =>
      relationDropdowns.value || entities.value.map((entity: BaseEntity) => {
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

  const getRelationDropdownsFromCurrentEntity = (form: FormContext) => {
    const relationValues = form.values.relationValues[relationType]?.filter((relation: BaseRelationValuesInput) => relation.editStatus !== EditStatus.Deleted);
    if (!relationValues) return;
    relationDropdowns.value = mapRelationValuesToDropdownOptions(relationValues);
  }

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
    entitiesLoading: isLoading,
    entityDropdownOptions,
    getFormWithRelationFieldCheck,
    getVariableValueForFilter,
    hasNewRelations,
    findNewRelationValue,
  };
};
