import { computed, reactive, ref } from "vue";
import {
  BulkOperationTypes,
  Collection,
  type DeleteQueryOptions,
  ModalStyle,
  TypeModals,
} from "@/generated-types/queries";
import { type Context } from "@/composables/useBulkOperations";
import useEntityPickerModal from "@/composables/useEntityPickerModal";

export type ModalInfo = {
  open: boolean;
  destination?: string;
  formQuery?: string;
  deleteQueryOptions?: DeleteQueryOptions;
  closeConfirmation: boolean;
  context?: Context;
};

const initialModalInfo: ModalInfo = {
  open: false,
  closeConfirmation: false,
};

const getInitialModals = (): { [key: string]: ModalInfo } => {
  const initialModals: { [key: string]: ModalInfo } = {};
  Object.keys(TypeModals).forEach(
    (modalType) => (initialModals[modalType] = { ...initialModalInfo }),
  );
  return initialModals;
};

const modals = reactive<{ [key: string]: ModalInfo }>(getInitialModals());
const currentModalStyle = ref<ModalStyle>(ModalStyle.Center);
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals[modalType];
  };

  const openModal = (
    modalType: TypeModals,
    modalStyle: ModalStyle,
    formQuery: string | undefined = undefined,
    deleteQueryOptions: DeleteQueryOptions | undefined = undefined,
    askForCloseConfirmation: boolean | undefined = undefined,
    context: Context | undefined = undefined,
  ): void => {
    if (modalType !== TypeModals.Confirm)
      closeModalsWithStyle(currentModalStyle.value);
    currentModalStyle.value = modalStyle;
    const updatedModal = { open: true };
    Object.assign(updatedModal, {
      formQuery,
      deleteQueryOptions,
    });
    updateModal(modalType, updatedModal);
    if (askForCloseConfirmation)
      getModalInfo(modalType).closeConfirmation = askForCloseConfirmation;
    if (context) getModalInfo(modalType).context = context;
  };

  const isCenterModalOpened = computed(() => {
    let isOpen: boolean = false;
    Object.keys(modals).forEach((modalKey: string) => {
      const modal: ModalInfo = modals[modalKey];
      if (modal.open && currentModalStyle.value === ModalStyle.Center)
        isOpen = true;
    });
    return isOpen;
  });

  const closeModalsWithStyle = (style: ModalStyle): void => {
    const modalsWithStyle: ModalInfo[] = Object.values(modals).filter(
      (modal: ModalInfo) => currentModalStyle.value === style,
    );
    if (!modalsWithStyle) return;
    modalsWithStyle.forEach((modal: ModalInfo) => (modal.open = false));
  };

  const getModalInfo = (modalType: TypeModals): ModalInfo => {
    return modals[modalType];
  };

  const updateModal = (
    modalType: TypeModals,
    modalInput: { [key: string]: any },
  ): void => {
    Object.assign(modals[modalType], modalInput);
  };

  const closeModal = (modalType: TypeModals): void => {
    try {
      if (modals[modalType].closeConfirmation) {
        openModal(TypeModals.Confirm, ModalStyle.Center);
      } else {
        modals[modalType].open = false;
      }
    } catch (e) {
      console.info(`Could not close ${modalType} modal`);
    }
  };

  const closeAllModals = (): void => {
    modals.forEach((modal: ModalInfo) => {
      modal.open = false;
    });
  };

  const changeCloseConfirmation = (modalType: TypeModals, value: boolean) => {
    modals[modalType].closeConfirmation = value;
  };

  const updateDeleteQueryOptions = (value: string) => {
    deleteQueryOptions.value = value;
  };

  const someModalIsOpened = computed((): boolean => {
    if (!modals) return false;
    return Object.values(modals).some((modal: ModalInfo) => modal.open);
  });

  return {
    getModal,
    modals,
    getModalInfo,
    updateModal,
    deleteQueryOptions,
    updateDeleteQueryOptions,
    closeModal,
    openModal,
    isCenterModalOpened,
    changeCloseConfirmation,
    modalToCloseAfterConfirm,
    currentModalStyle,
    someModalIsOpened,
    closeAllModals,
  };
};
