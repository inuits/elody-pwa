import { computed, ref, type Ref } from "vue";

const createCallbackRegistry = <T extends () => Promise<void> | void>() => {
  const callbacks = ref<Record<string, T>>({}) as Ref<Record<string, T>>;
  const add = (name: string, callback: T, replace = true): void => {
    if (!replace && callbacks.value[name]) return;
    callbacks.value[name] = callback;
  };
  const perform = async (): Promise<void> => {
    for (const callback of Object.values(callbacks.value)) await callback();
    callbacks.value = {};
  };
  const clear = (): void => {
    callbacks.value = {};
  };
  return { fns: callbacks, add, perform, clear };
};
export type EditModes = "edit" | "no-edit" | "view" | "delete" | "edit-delete";
export type Callback = (e?: Event | undefined) => Promise<unknown>;

export const useEditState = (editStateName: string) => {
  const buttonClicked = ref(false);
  const isDisabled = ref(false);
  const editMode = ref<EditModes>("no-edit");
  const permittedEditMode = ref<EditModes>("view");
  const submitFn = ref<Callback | undefined>();
  const refetchRegistry = createCallbackRegistry<() => void>();
  const mutationRegistry = createCallbackRegistry<() => Promise<void>>();
  const refetchFns = refetchRegistry.fns;
  const mutationCallbackFns = mutationRegistry.fns;

  const toBeDeleted = ref<string[]>([]);
  const isSaved = ref(false);
  const isSaving = ref(false);

  const showErrors = computed(() => buttonClicked.value && isDisabled.value);
  const isEdit = ref<boolean>(false);

  const enableEdit = () => (isEdit.value = true);

  const setEditMode = (mode: EditModes = "edit") => {
    editMode.value = mode;
    resetButtonClicked();
  };

  const disableEdit = () => {
    isEdit.value = false;
    setEditMode(permittedEditMode.value);
  };

  const setSubmitFunction = (editSubmitFn: Callback | undefined) => {
    submitFn.value = editSubmitFn;
  };

  const addRefetchFunction = (name: string, fn: () => void): void =>
    refetchRegistry.add(name, fn, false);

  const performRefetchFunctions = (): Promise<void> => refetchRegistry.perform();
  const clearRefetchFunctions = (): void => refetchRegistry.clear();

  const addMutationCallback = (name: string, fn: () => Promise<void>): void =>
    mutationRegistry.add(name, fn);

  const performMutationCallbacks = (): Promise<void> => mutationRegistry.perform();
  const clearMutationCallbacks = (): void => mutationRegistry.clear();

  const hideEditButton = () => setEditMode("no-edit");

  const save = async (force = false) => {
    if (!force && isDisabled.value) return;
    isSaved.value = false;
    isSaving.value = true;
    try {
      if (submitFn.value) await submitFn.value();
      submitFn.value = undefined;
      isSaved.value = true;
      isSaving.value = false;
    } catch (error) {
      console.error("Error saving:", error);
      isSaved.value = false;
      isSaving.value = false;
    }
  };

  const discard = () => {
    const discardEvent = new CustomEvent("discardEdit", {
      detail: { editState: editStateName },
    });
    disableEdit();
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

  // What the user may do with this entity is asked once, by whoever loaded it.
  // Remembering it here is what lets a temporarily hidden edit button come back
  // without a second permission call.
  const setPermittedEditMode = (permissions: {
    canUpdate?: boolean;
    canDelete?: boolean;
  }) => {
    const { canUpdate, canDelete } = permissions;
    if (canUpdate && canDelete) permittedEditMode.value = "edit-delete";
    else if (canUpdate) permittedEditMode.value = "edit";
    else if (canDelete) permittedEditMode.value = "delete";
    else permittedEditMode.value = "view";
    setEditMode(permittedEditMode.value);
  };

  return {
    enableEdit,
    editStateName,
    buttonClicked,
    isDisabled,
    editMode,
    permittedEditMode,
    setPermittedEditMode,
    submitFn,
    refetchFns,
    mutationCallbackFns,
    toBeDeleted,
    isSaved,
    isSaving,
    showErrors,
    isEdit,
    setEditMode,
    disableEdit,
    setSubmitFunction,
    addRefetchFunction,
    clearRefetchFunctions,
    hideEditButton,
    save,
    discard,
    setDisableState,
    clickButton,
    resetButtonClicked,
    performRefetchFunctions,
    addMutationCallback,
    performMutationCallbacks,
    clearMutationCallbacks,
  };
};
