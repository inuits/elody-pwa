import { ref, type Ref } from "vue";
import {
  type TypeModals,
  ModalChoices,
  ModalState,
} from "@/generated-types/queries";
import useDropzoneHelper from "@/composables/useDropzoneHelper";

export type ModalType = {
  state: ModalState;
  destination?: string;
};

export interface IBaseModal {
  openModal: <T extends ModalChoices, V extends ModalType>(
    T?: T,
    V?: V
  ) => void;
  updateModal: (modalInput: ModalType) => void;
  closeModal: () => void;
  modalState: Ref<ModalType>;
  modalToOpen?: Ref<ModalChoices>;
}

export function useBaseModal(): IBaseModal {
  const modalState: Ref<ModalType> = ref<ModalType>({
    state: ModalState.Initial,
  });
  const modalToOpen: Ref<ModalChoices> = ref<ModalChoices>(
    ModalChoices.Dropzone
  );
  function updateModal(modalInput: ModalType): void {
    modalState.value = modalInput;
  }

  function closeModal(): void {
    updateModal({
      state: ModalState.Hide,
    });
  }

  function openModal<T extends ModalChoices, V extends ModalType>(
    modalChoice?: T,
    modalInput?: V
  ): void {
    updateModal({
      state: ModalState.Show,
    });

    if (modalChoice) {
      modalToOpen.value = modalChoice;
      useDropzoneHelper().resetDropzone();
    }
  }

  return {
    modalState,
    modalToOpen,
    updateModal,
    closeModal,
    openModal,
  };
}

export function makeModal(type: TypeModals): IBaseModal {
  return useBaseModal();
}
