import { ref, type Ref } from "vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";

export enum TypeModals {
  Upload = "Upload",
  Create = "Nieuw",
}

export enum modalChoices {
  IMPORT = "IMPORT",
  DROPZONE = "DROPZONE",
}

export enum ModalState {
  Initial = "initial",
  Show = "show",
  Hide = "hide",
  Loading = "loading",
}

export type ModalType = {
  state: ModalState;
  destination?: String;
};

export interface IBaseModal {
  openModal: <T, V>(T?: modalChoices, V?: V) => void;
  updateModal: (modalInput: ModalType) => void;
  closeModal: () => void;
  modalState: Ref<ModalType>;
  modalToOpen?: Ref<modalChoices>;
}

export class BaseModal implements IBaseModal {
  modalState: Ref<ModalType> = ref<ModalType>({ state: ModalState.Initial });
  modalToOpen: Ref<modalChoices> = ref<modalChoices>(modalChoices.DROPZONE);

  updateModal(modalInput: ModalType): void {
    this.modalState.value = modalInput;
  }

  closeModal(): void {
    this.updateModal({
      state: ModalState.Hide,
    });
  }

  openModal(modalChoices?: modalChoices): void {
    this.updateModal({
      state: ModalState.Show,
    });
    if (modalChoices) {
      this.modalToOpen.value = ref(modalChoices).value;
      useDropzoneHelper().resetDropzone();
    }
  }
}

export function makeModal(type: TypeModals) {
  return new BaseModal();
}
