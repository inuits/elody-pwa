import useMediaAssetLinkHelper from "@/composables/useMediaAssetLinkHelper";
import { computed, ref } from "vue";

export type EditModes = "edit" | "view" | "loading";
export type callback = (e?: Event | undefined) => Promise<unknown>;
export const toBeDeleted = ref<string[]>([]);
export const isSaved = ref<boolean>(false);

const isDisabled = ref<boolean>(false);
const editMode = ref<EditModes>("view");
const saveCallbacks = ref<callback[]>([]);
const isEditToggleVisible = ref<"no-edit" | "edit" | "edit-delete">("no-edit");
const refetchFn = ref<Function>();

export const useEditMode = () => {
  const { linkMediaFilesToEntity, clearMediaFilesToLinkToEntity } =
    useMediaAssetLinkHelper();
  const setEditMode = () => (editMode.value = "edit");
  const disableEditMode = () => (editMode.value = "view");
  const isEdit = computed<boolean>(() => editMode.value === "edit");
  const setRefetchFn = (refetch: Function) => (refetchFn.value = refetch);

  const addSaveCallback = (input: callback, order?: string) => {
    if (order === "first") {
      saveCallbacks.value.unshift(input);
    } else if (order === "second") {
      saveCallbacks.value.splice(1, 0, input);
    } else {
      saveCallbacks.value.push(input);
    }
  };
  const showEditToggle = (mode: "edit" | "delete" = "edit") => {
    if (mode === "delete") {
      isEditToggleVisible.value = "edit-delete";
    }
    if (mode === "edit") {
      isEditToggleVisible.value = "edit";
    }
  };
  const hideEditToggle = () => (isEditToggleVisible.value = "no-edit");
  const clearSaveCallbacks = () => (saveCallbacks.value = []);

  const save = async () => {
    isSaved.value = false;
    linkMediaFilesToEntity(addSaveCallback);

    for (const callback of saveCallbacks.value) {
      await callback();
    }
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
    isDisabled,
    setDisableState,
    clearSaveCallbacks,
  };
};

export default useEditMode;
