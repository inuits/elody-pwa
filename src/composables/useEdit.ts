import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import useMediaAssetLinkHelper from "@/composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
import { computed, ref } from "vue";

export type EditModes = "edit" | "view" | "loading";
export type callback = (e?: Event | undefined) => Promise<unknown>;
export const toBeDeleted = ref<string[]>([]);
export const isSaved = ref<boolean>(false);

const editMode = ref<EditModes>("view");
const saveCallbacks = ref<callback[]>([]);
const isEditToggleVisible = ref<"no-edit" | "edit" | "edit-delete">("no-edit");
const refetchFn = ref<Function>();

export const useEditMode = () => {
  const { createNotification } = useNotification();
  const { linkMediaFilesToEntity, clearMediaFilesToLinkToEntity } =
    useMediaAssetLinkHelper();
  const {
    clearMediaFilesToPatch,
    resetRelationsToBeDeleted,
    resetMetadataToBePatched,
  } = useMetaDataHelper();
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

  const save = async () => {
    isSaved.value = false;
    linkMediaFilesToEntity(addSaveCallback);

    for (const callback of saveCallbacks.value) {
      await callback().then(() => {
        if (isEdit.value) {
          saveCallbacks.value = [];
          disableEditMode();
          createNotification({
            displayTime: 10,
            type: NotificationType.default,
            title: "Entity successfully updated",
            description: "Changes have been saved successfully",
            shown: true,
          });
        }
      });
    }
    const refetch = refetchFn.value;
    if (refetch) refetch();
    isSaved.value = true;
  };

  const discard = () => {
    const discardEvent = new Event("discardEdit");
    disableEditMode();
    saveCallbacks.value = [];
    toBeDeleted.value = [];
    resetRelationsToBeDeleted();
    resetMetadataToBePatched();
    clearMediaFilesToLinkToEntity();
    clearMediaFilesToPatch();
    document.dispatchEvent(discardEvent);
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
  };
};

export default useEditMode;
