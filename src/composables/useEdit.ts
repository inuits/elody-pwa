import { useEditState } from "@/composables/useEditState";
import { ref } from "vue";

const editStates = ref<Record<string, ReturnType<typeof useEditState>>>({});

export const useEditMode = (
  editStateName: string = "GlobalEditState",
  mode: "get" | "delete" = "get",
): ReturnType<typeof useEditState> => {
  const createNewEditState = () => {
    const newEditState = useEditState(editStateName);
    editStates.value = {
      ...editStates.value,
      [editStateName]: newEditState,
    };
    return newEditState;
  };

  const getEditState = (): ReturnType<typeof useEditState> => {
    if (!editStates.value[editStateName]) return createNewEditState();
    return editStates.value[editStateName];
  };

  const deleteEditState = () => {
    const stateToDelete = editStates.value[editStateName];
    delete editStates.value[editStateName];
    return stateToDelete;
  };

  const operationModeMapping = {
    get: getEditState,
    delete: deleteEditState,
  };

  return operationModeMapping[mode]();
};
