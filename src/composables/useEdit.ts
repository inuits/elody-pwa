import { UpdateMediafilesOrderDocument } from "@/queries";
import type { UpdateMediafilesOrderMutation } from "@/queries";
import { useMutation } from "@vue/apollo-composable";
import { computed, ref } from "vue";
import useMediaAssetLinkHelper from "./useMediaAssetLinkHelper";
import useMetaDataHelper from "./useMetaDataHelper";
import {
  getDiffArray,
  removeMediafilesFromOrdering,
} from "../composables/useMediafilesOrderHelpers";
import { toBeDeleted } from "@/components/EntityImageSelection.vue";

export type EditModes = "edit" | "view" | "loading";
export type callback = (e?: Event | undefined) => Promise<unknown>;

const editMode = ref<EditModes>("view");
const saveCallbacks = ref<callback[]>([]);
const isEditToggleVisible = ref<"no-edit" | "edit" | "edit-delete">("no-edit");

export const useEditMode = () => {
  const { linkMediaFilesToEntity, clearMediaFilesToLinkToEntity } =
    useMediaAssetLinkHelper();
  const { clearMediaFilesToPatch } = useMetaDataHelper();
  const setEditMode = () => (editMode.value = "edit");
  const disableEditMode = () => (editMode.value = "view");
  const isEdit = computed<boolean>(() => editMode.value === "edit");

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
  const saveEvent = new Event("save");
  const discardEvent = new Event("discard");
  const { mutate } = useMutation<UpdateMediafilesOrderMutation>(
    UpdateMediafilesOrderDocument
  );
  const save = async () => {
    removeMediafilesFromOrdering(toBeDeleted.value);
    linkMediaFilesToEntity(addSaveCallback);
    addSaveCallback(async () => {
      await mutate({ value: { value: getDiffArray() } });
    });
    for (const callback of saveCallbacks.value) {
      await callback().then(() => {
        if (isEdit.value) {
          saveCallbacks.value = [];
          disableEditMode();
        }
      });
    }
    document.dispatchEvent(saveEvent);
  };

  const discard = () => {
    disableEditMode();
    saveCallbacks.value = [];
    toBeDeleted.value = [];
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
  };
};

export default useEditMode;
