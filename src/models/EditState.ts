import { ref, computed } from "vue";

export type EditModes = "edit" | "view" | "delete" | "edit-delete";
export type callback = (e?: Event | undefined) => Promise<unknown>;

export class EditState {
  editStateName: string | undefined = undefined;
  buttonClicked = ref<boolean>(false);
  isDisabled = ref<boolean>(false);
  editMode = ref<EditModes>("view");
  submitFn = ref<callback | undefined>(undefined);
  refetchFn = ref<Function | undefined>(undefined);

  toBeDeleted = ref<string[]>([]);
  isSaved = ref<boolean>(false);
  showErrors = computed<boolean>(
    () => this.buttonClicked.value && this.isDisabled.value,
  );

  isEdit = computed<boolean>(() => this.editMode.value === "edit");

  constructor(editStateName: string) {
    this.editStateName = editStateName;
  }

  setEditMode = (mode: EditModes = "edit") => {
    this.editMode.value = mode;
    this.resetButtonClicked();
  };

  disableEditMode = () => (this.editMode.value = "view");

  setSubmitFunction = (editSubmitFn: callback | undefined) => {
    this.submitFn.value = editSubmitFn;
  };

  setRefetchFn = (refetch: Function) => (this.refetchFn.value = refetch);

  showEditToggle = (mode: "edit" | "delete" | "edit-delete" = "edit") => {
    this.editMode.value = mode;
  };

  hideEditToggle = () => (this.editMode.value = "view");

  save = async (force: boolean = false) => {
    if (!force && this.isDisabled.value) return;
    this.isSaved.value = false;

    if (this.submitFn.value) await this.submitFn.value();
    this.setSubmitFunction(undefined);
    this.isSaved.value = true;
  };

  discard = () => {
    const discardEvent = new CustomEvent("discardEdit", {
      detail: { editState: this.editStateName },
    });
    this.disableEditMode();
    this.setSubmitFunction(undefined);
    this.toBeDeleted.value = [];
    document.dispatchEvent(discardEvent);
  };

  setDisableState = (value: boolean) => {
    this.isDisabled.value = value;
  };

  clickButton = () => {
    this.buttonClicked.value = true;
  };

  resetButtonClicked = () => {
    this.buttonClicked.value = false;
  };
}
