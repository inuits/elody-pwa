import { EditState } from "@/models/EditState";
import { ref } from "vue";

const editStates = ref<Record<string, EditState>>({});

export const useEditMode = (
  editStateName: string = "GlobalEditState",
): EditState => {
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

  if (!editStates.value[editStateName]) return createNewEditState();
  return editStates.value[editStateName];
};

export default useEditMode;
