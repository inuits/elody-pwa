import { ref, computed } from "vue";

export type EditModes = "edit" | "no-edit" | "view" | "delete" | "edit-delete";
export type Callback = (e?: Event | undefined) => Promise<unknown>;

export const useEditState = (editStateName: string) => {
  const buttonClicked = ref(false);
  const isDisabled = ref(false);
  const editMode = ref<EditModes>("no-edit");
  const submitFn = ref<Callback | undefined>();
  const refetchFn = ref<Function | undefined>();

  const toBeDeleted = ref<string[]>([]);
  const isSaved = ref(false);

  const showErrors = computed(() => buttonClicked.value && isDisabled.value);
  const isEdit = computed(() => editMode.value === "edit");

  const setEditMode = (mode: EditModes = "edit") => {
    editMode.value = mode;
    resetButtonClicked();
  };

  const disableEditMode = () => setEditMode("view");

  const setSubmitFunction = (editSubmitFn: Callback | undefined) => {
    submitFn.value = editSubmitFn;
  };

  const setRefetchFn = (refetch: Function) => {
    refetchFn.value = refetch;
  };

  const hideEditButton = () => setEditMode("no-edit");

  const save = async (force = false) => {
    if (!force && isDisabled.value) return;
    isSaved.value = false;

    if (submitFn.value) await submitFn.value();
    submitFn.value = undefined;
    isSaved.value = true;
  };

  const discard = () => {
    const discardEvent = new CustomEvent("discardEdit", {
      detail: { editState: editStateName },
    });
    disableEditMode();
    submitFn.value = undefined;
    toBeDeleted.value = [];
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
    editStateName,
    buttonClicked,
    isDisabled,
    editMode,
    submitFn,
    refetchFn,
    toBeDeleted,
    isSaved,
    showErrors,
    isEdit,
    setEditMode,
    disableEditMode,
    setSubmitFunction,
    setRefetchFn,
    hideEditButton,
    save,
    discard,
    setDisableState,
    clickButton,
    resetButtonClicked,
  };
};
