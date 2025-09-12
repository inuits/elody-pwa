import { ref } from "vue";
import { useGetDropdownOptionsState } from "@/composables/useGetDropdownOptionsState";
import type {
  AdvancedFilterInput,
  Entitytyping,
} from "@/generated-types/queries";

const dropdownOptionsStates = ref<Record<string, ReturnType<typeof useGetDropdownOptionsState>>>({});

export const useGetDropdownOptions = (
  dropdownOptionsStateName: string = "GlobalDropdownOptionsState",
  mode: "get" | "delete" = "get",
  entityType?: Entitytyping,
  parent?: "fetchAll" | string,
  relationType: string = "",
  fromRelationType: string = "",
  searchFilterInput?: AdvancedFilterInput,
  advancedFilterInputForRetrievingOptions?: [AdvancedFilterInput],
  formId?: string,
  relationFilter?: AdvancedFilterInput,
): ReturnType<typeof useGetDropdownOptionsState> => {

  const createNewDropdownOptionsState = () => {
    const newDropdownOptionsState = useGetDropdownOptionsState(
      entityType!,
      parent!,
      relationType,
      fromRelationType,
      searchFilterInput,
      advancedFilterInputForRetrievingOptions,
      formId,
      relationFilter,
    );

    dropdownOptionsStates.value = {
      ...dropdownOptionsStates.value,
      [dropdownOptionsStateName]: newDropdownOptionsState,
    };
    return newDropdownOptionsState;
  };

  const getDropdownOptionsState = (): ReturnType<typeof useGetDropdownOptionsState> => {
    if (!dropdownOptionsStates.value[dropdownOptionsStateName]) return createNewDropdownOptionsState();
    return dropdownOptionsStates.value[dropdownOptionsStateName];
  };

  const deleteDropdownOptionsState = () => {
    const stateToDelete = dropdownOptionsStates.value[dropdownOptionsStateName];
    delete dropdownOptionsStates.value[dropdownOptionsStateName];
    return stateToDelete;
  };

  const operationModeMapping = {
    get: getDropdownOptionsState,
    delete: deleteDropdownOptionsState,
  };

  return operationModeMapping[mode]();
};
