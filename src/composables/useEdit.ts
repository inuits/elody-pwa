import { EditState } from "@/models/EditState";
import { ref } from "vue";

const editStates = ref<Record<string, EditState>>({});

export const useEditMode = (
  editStateName: string = "GlobalEditState",
  mode: "get" | "delete" = "get",
): EditState | void => {
  if (!editStateName || typeof editStateName !== "string") {
    console.error(
      `The editStateName is a required property of useEditMode and must be of type string | {name: ${editStateName},type: ${typeof editStateName}}`,
    );
  }

  const createNewEditState = () => {
    const newEditState: EditState = new EditState(editStateName);
    editStates.value = {
      ...editStates.value,
      [editStateName]: newEditState,
    };
    return newEditState;
  };

  const getEditState = (): EditState => {
    if (!editStates.value[editStateName]) return createNewEditState();
    return editStates.value[editStateName];
  };

  const deleteEditState = (): void => {
    try {
      delete editStates.value[editStateName];
    } catch {
      console.error(`No edit state with name ${editStateName} to delete`);
    }
  };

  const operationModeMapping: Record<string, () => EditState | void> = {
    get: () => getEditState(),
    delete: () => deleteEditState(),
  };

  return operationModeMapping[mode]();
};

export default useEditMode;
