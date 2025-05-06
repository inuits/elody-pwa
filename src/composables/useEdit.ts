import { EditState } from "@/models/EditState";
import { ref, watch, computed } from "vue";

const editStates = ref<Record<string, EditState>>({});
const isAnEditStateActive = computed<boolean>(() =>
  Object.values(editStates.value)
    .filter(
      (editState: EditState) => editState.editStateName !== "GlobalEditState",
    )
    .map((state: EditState) => state.isEdit.value)
    .some((isEditValue: boolean) => isEditValue),
);

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

watch(
  () => isAnEditStateActive.value,
  () => {
    console.log(`An editMode other than 'GlobalEditState' has been activated`);
    editStates.value["GlobalEditState"].setEditMode();
    console.log(editStates.value);
  },
);

export default useEditMode;
