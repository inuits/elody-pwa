import useMediaAssetLinkHelper from "@/composables/useMediaAssetLinkHelper";
import { computed, ref } from "vue";

export type EditModes = "edit" | "view" | "loading";
export type callback = (e?: Event | undefined) => Promise<unknown>;
export const toBeDeleted = ref<string[]>([]);
export const isSaved = ref<boolean>(false);

const showErrors = computed<boolean>(
  () => buttonClicked.value && isDisabled.value,
);
const buttonClicked = ref<boolean>(false);
const isDisabled = ref<boolean>(false);
const editMode = ref<EditModes>("view");
const saveCallbacks = ref<callback[]>([]);
const isEditToggleVisible = ref<"no-edit" | "edit" | "delete" | "edit-delete">(
  "no-edit",
);
const refetchFn = ref<Function>();

export const useEditMode = () => {
  const { linkMediaFilesToEntity, clearMediaFilesToLinkToEntity } =
    useMediaAssetLinkHelper();
  const setEditMode = () => {
    editMode.value = "edit";
    resetButtonClicked();
  };
  const disableEditMode = () => (editMode.value = "view");
  const isEdit = computed<boolean>(() => editMode.value === "edit");
  const setRefetchFn = (refetch: Function) => (refetchFn.value = refetch);

  const addSaveCallback = (input: callback, order?: string) => {
    console.log("Here I add the submit function", saveCallbacks.value);
    if (order === "first") {
      saveCallbacks.value.unshift(input);
    } else if (order === "second") {
      saveCallbacks.value.splice(1, 0, input);
    } else {
      saveCallbacks.value.push(input);
    }
    console.log("Here I added the submit function", saveCallbacks.value);
  };
  const showEditToggle = (mode: "edit" | "delete" | "edit-delete" = "edit") => {
    isEditToggleVisible.value = mode;
  };
  const hideEditToggle = () => (isEditToggleVisible.value = "no-edit");
  const clearSaveCallbacks = () => (saveCallbacks.value = []);

  const save = async (force: boolean = false) => {
    if (!force && isDisabled.value) return;
    console.log(saveCallbacks.value);
    isSaved.value = false;
    linkMediaFilesToEntity(addSaveCallback);

    for (const callback of saveCallbacks.value) {
      await callback();
    }
    console.log("Callback executed");
    saveCallbacks.value = [];
    isSaved.value = true;
  };

  const discard = () => {
    const discardEvent = new Event("discardEdit");
    disableEditMode();
    saveCallbacks.value = [];
    toBeDeleted.value = [];
    clearMediaFilesToLinkToEntity();
    document.dispatchEvent(discardEvent);
  };

  const setDisableState = (value: boolean) => {
    isDisabled.value = value;
  };

  const clickButton = () => {
    buttonClicked.value = true;
  };
  const resetButtonClicked = () => {
    buttonClicked.value = false;
  };

  return {
    save,
    isEdit,
    editMode,
    discard,
    setEditMode,
    addSaveCallback,
    disableEditMode,
    showEditToggle,
    hideEditToggle,
    isEditToggleVisible,
    setRefetchFn,
    refetchFn,
    isSaved,
    showErrors,
    isDisabled,
    setDisableState,
    buttonClicked,
    clickButton,
    resetButtonClicked,
    clearSaveCallbacks,
    saveCallbacks,
  };
};

export default useEditMode;
