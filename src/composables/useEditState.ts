import { computed, ref } from "vue";
import { usePermissions } from "@/composables/usePermissions";
import { type Entitytyping, Permission } from "@/generated-types/queries";
import useEntitySingle from "@/composables/useEntitySingle";

export type EditModes = "edit" | "no-edit" | "view" | "delete" | "edit-delete";
export type Callback = (e?: Event | undefined) => Promise<unknown>;
const { fetchUpdateAndDeletePermission } = usePermissions();

export const useEditState = (editStateName: string) => {
  const buttonClicked = ref(false);
  const isDisabled = ref(false);
  const editMode = ref<EditModes>("no-edit");
  const submitFn = ref<Callback | undefined>();
  const refetchFns = ref<Callback[]>([]);

  const toBeDeleted = ref<string[]>([]);
  const isSaved = ref(false);

  const showErrors = computed(() => buttonClicked.value && isDisabled.value);
  const isEdit = ref<boolean>(false);

  const enableEdit = () => (isEdit.value = true);

  const setEditMode = (mode: EditModes = "edit") => {
    editMode.value = mode;
    resetButtonClicked();
  };

  const disableEdit = () => {
    isEdit.value = false;
    applyPermittedEditMode();
  };

  const setSubmitFunction = (editSubmitFn: Callback | undefined) => {
    submitFn.value = editSubmitFn;
  };

  const addRefetchFunction = (refetch: () => any) => {
    console.log("Adding refetch function!");
    refetchFns.value.push(refetch);
    console.log("refetchFns:", refetchFns.value);
  };

  const clearRefetchFunctions = () => {
    console.log("REFETCH FUNCTIONS ARE GETTING CLEARED!");
    refetchFns.value = [];
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

  const applyPermittedEditMode = () => {
    const entityId: string = useEntitySingle().getEntityUuid() as string;
    const entityType: Entitytyping =
      useEntitySingle().getEntityType() as Entitytyping;
    const mappings = fetchUpdateAndDeletePermission(entityId, entityType);
    if (mappings) {
      mappings.then((mappingResult) => {
        const canEdit = mappingResult.get(Permission.Canupdate);
        const canDelete = mappingResult.get(Permission.Candelete);

        if (canEdit && canDelete) setEditMode("edit-delete");
        else if (canEdit && !canDelete) setEditMode("edit");
        else if (canDelete && !canEdit) setEditMode("delete");
        else setEditMode("view");
      });
    } else setEditMode("view");
  };

  return {
    enableEdit,
    editStateName,
    buttonClicked,
    isDisabled,
    editMode,
    submitFn,
    refetchFns,
    toBeDeleted,
    isSaved,
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
  };
};
