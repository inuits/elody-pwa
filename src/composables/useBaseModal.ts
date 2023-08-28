import { ref, onMounted } from "vue";
import {
  TypeModals,
  ModalState,
  ModalChoices,
} from "@/generated-types/queries";
import useDropzoneHelper from "@/composables/useDropzoneHelper";

export type ModalPosition = "left" | "center" | "right";

export type ConfirmationSettings = {
  askConfirm: boolean;
  confirmTranslationKey: string;
};

export type ModalInfo = {
  state: ModalState;
  modalPosition: ModalPosition;
  destination?: string;
  modalTabToOpen?: ModalChoices;
  closeConfirmation?: ConfirmationSettings | undefined;
};

const initialModalInfo: ModalInfo = {
  state: ModalState.Initial,
  modalPosition: "left",
};

const getInitialModals = (): { [key: string]: ModalInfo } => {
  const initialModals: { [key: string]: ModalInfo } = {};
  Object.keys(TypeModals).forEach(
    (modalType) => (initialModals[modalType] = { ...initialModalInfo })
  );
  return initialModals;
};

const modals = ref<{ [key: string]: ModalInfo }>(getInitialModals());
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals.value[modalType];
  };

  const openModal = (
    modalType: TypeModals,
    modalTab: ModalChoices | undefined = undefined,
    modalPosition: ModalPosition | undefined = undefined
  ): void => {
    const updatedModal = {
      state: ModalState.Show,
    };
    if (modalPosition) Object.assign(updatedModal, { modalPosition });
    updateModal(modalType, updatedModal);
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    useDropzoneHelper().resetDropzone();
  };

  const getModalInfo = (modalType: TypeModals): ModalInfo => {
    return modals.value[modalType];
  };

  const updateModal = (
    modalType: TypeModals,
    modalInput: { [key: string]: any }
  ): void => {
    Object.assign(modals.value[modalType], modalInput);
  };

  const closeModal = (modalType: TypeModals): void => {
    if (modals.value[modalType].closeConfirmation?.askConfirm) {
      openModal(TypeModals.Confirm, undefined, "center");
    } else {
      modals.value[modalType].state = ModalState.Hide;
    }
  };

  const changeCloseConfirmation = (
    modalType: TypeModals,
    value: ConfirmationSettings | undefined
  ) => {
    if (!modals.value[modalType])
      throw new Error(`No open modals of type ${modalType} yet`);
    modals.value[modalType].closeConfirmation = value;
  };

  const confirmClose = (
    customConfirmCallback: Function | undefined = undefined
  ) => {
    if (customConfirmCallback) {
      customConfirmCallback();
      return;
    }
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
    getModal,
    modals,
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
