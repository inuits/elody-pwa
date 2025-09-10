import { reactive, ref, readonly } from "vue";
import {
  type DeleteQueryOptions,
  ModalStyle,
  TypeModals,
} from "@/generated-types/queries";
import { type Context } from "@/composables/useBulkOperations";

export type ModalInfo = {
  open: boolean;
  destination?: string;
  formQuery?: string;
  deleteQueryOptions?: DeleteQueryOptions;
  closeConfirmation: boolean;
  context?: Context;
  modalStyle: ModalStyle;
  [key: string]: any;
};

const initialModalInfo: ModalInfo = {
  open: false,
  closeConfirmation: false,
  modalStyle: ModalStyle.Center
};

const getInitialModals = (): { [key: string]: ModalInfo } => {
  const initialModals: { [key: string]: ModalInfo } = {};
  Object.keys(TypeModals).forEach(
    (modalType) => (initialModals[modalType] = { ...initialModalInfo }),
  );
  return initialModals;
};

const modals = reactive<{ [key: string]: ModalInfo }>(getInitialModals());
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);
const _someModalIsOpened = ref(false);
const someModalIsOpened = readonly(_someModalIsOpened);

export const useBaseModal = () => {
  const getModalInfo = (modalType: TypeModals): ModalInfo => {
    return modals[modalType];
  };

  const openModal = (
    modalType: TypeModals,
    modalStyle: ModalStyle,
    formQuery?: string,
    deleteQueryOptions?: DeleteQueryOptions,
    askForCloseConfirmation: boolean = false,
    context?: Context,
    modalTypeSpecificInfo: { [key: string]: any } = {},
  ): void => {
    if (modals[modalType].open) return;

    _someModalIsOpened.value = true;

    const updatedModal = {
      open: true,
      formQuery,
      deleteQueryOptions,
      askForCloseConfirmation,
      modalStyle,
      ...modalTypeSpecificInfo,
    };

    updateModal(modalType, updatedModal);

    if (context) updateModal(modalType, { context });
  };

  const updateModal = (
    modalType: TypeModals,
    modalInput: { [key: string]: any },
  ): void => {
    Object.assign(modals[modalType], modalInput);
  };

  const closeModal = (modalType: TypeModals): void => {
    try {
      if (
        modals[modalType].closeConfirmation &&
        modalType !== TypeModals.Confirm
      ) {
        openModal(TypeModals.Confirm, ModalStyle.Center);
      } else {
        modals[modalType].open = false;
      }
      _someModalIsOpened.value = Object.values(modals).some((m) => m.open);
    } catch {
      console.info(`Could not close ${modalType} modal`);
    }
  };

  const closeAllModals = (): void => {
    Object.values(modals).forEach((modal: ModalInfo) => {
      modal.closeConfirmation = false;
      modal.open = false;
    });
    _someModalIsOpened.value = false;
  };

  const changeCloseConfirmation = (modalType: TypeModals, value: boolean) => {
    modals[modalType].closeConfirmation = value;
  };

  const updateDeleteQueryOptions = (value: DeleteQueryOptions) => {
    deleteQueryOptions.value = value as DeleteQueryOptions;
  };

  return {
    modals,
    getModalInfo,
    updateModal,
    deleteQueryOptions,
    updateDeleteQueryOptions,
    closeModal,
    openModal,
    changeCloseConfirmation,
    modalToCloseAfterConfirm,
    someModalIsOpened,
    closeAllModals,
  };
};
