import { ref } from "vue";
import {
  TypeModals,
  ModalState,
  ModalChoices,
} from "@/generated-types/queries";
import useDropzoneHelper from "@/composables/useDropzoneHelper";

export type ConfirmationSettings = {
  askConfirm: boolean;
  confirmTranslationKey: string;
};

export type ModalInfo = {
  state: ModalState;
  destination?: string;
  modalTabToOpen?: ModalChoices;
  closeConfirmation?: ConfirmationSettings | undefined;
};

const openModals = ref<{ [key: string]: ModalInfo }>({});
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);

const initialModalInfo: ModalInfo = {
  state: ModalState.Initial,
};

export const useBaseModal = () => {
  const createModal = (modalType: TypeModals): ModalInfo => {
    if (!openModals.value[modalType]) {
      openModals.value[modalType] = { ...initialModalInfo };
    }
    return openModals.value[modalType];
  };

  const openModal = (
    modalType: TypeModals,
    modalTab: ModalChoices | undefined = undefined
  ): void => {
    if (!openModals.value[modalType]) createModal(modalType);
    updateModal(modalType, {
      state: ModalState.Show,
    });
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    useDropzoneHelper().resetDropzone();
  };

  const getModalInfo = (modalType: TypeModals): ModalInfo => {
    if (!openModals.value[modalType])
      throw new Error(`No open modals of type ${modalType} yet`);
    return openModals.value[modalType];
  };

  const updateModal = (modalType: TypeModals, modalInput: ModalInfo): void => {
    if (!openModals.value[modalType])
      throw new Error(`No open modals of type ${modalType} yet`);

    Object.assign(openModals.value[modalType], modalInput);
  };

  const closeModal = (modalType: TypeModals): void => {
    if (!openModals.value[modalType])
      throw new Error(`No open modals of type ${modalType} yet`);

    if (openModals.value[modalType].closeConfirmation?.askConfirm) {
      openModal(TypeModals.Confirm);
    } else {
      openModals.value[modalType].state = ModalState.Hide;
    }
  };

  const changeCloseConfirmation = (
    modalType: TypeModals,
    value: ConfirmationSettings | undefined
  ) => {
    if (!openModals.value[modalType])
      throw new Error(`No open modals of type ${modalType} yet`);
    openModals.value[modalType].closeConfirmation = value;
  };

  const confirmClose = () => {
    if (!modalToCloseAfterConfirm.value)
      throw new Error("Modal to close after confirm has not been defined");
    changeCloseConfirmation(modalToCloseAfterConfirm.value, undefined);
    closeModal(TypeModals.Confirm);
    closeModal(modalToCloseAfterConfirm.value);
    modalToCloseAfterConfirm.value = undefined;
  };

  const declineClose = () => {
    closeModal(TypeModals.Confirm);
  };

  return {
    createModal,
    openModals,
    getModalInfo,
    updateModal,
    closeModal,
    openModal,
    changeCloseConfirmation,
    modalToCloseAfterConfirm,
    confirmClose,
    declineClose,
  };
};
