import { EditState } from "@/models/EditState";
import { ref } from "vue";

const editStates = ref<Record<string, EditState>>({});

export const useEditMode = (editStateName: string): EditState => {
  const createNewEditState = () => {
    const newEditState: EditState = new EditState(editStateName);
    editStates.value[editStateName] = newEditState;
    return newEditState;
  };

  if (!editStates.value[editStateName]) return createNewEditState();
  return editStates.value[editStateName];
};

export default useEditMode;
