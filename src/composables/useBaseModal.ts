import { computed, reactive, ref } from "vue";
import {
  BulkOperationTypes,
  Collection,
  type DeleteQueryOptions,
  ModalChoices,
  TypeModals,
} from "@/generated-types/queries";
export type ModalPosition = "left" | "center" | "right";

export type ModalInfo = {
  open: boolean;
  modalPosition: ModalPosition;
  destination?: string;
  formQuery?: string;
  modalTabToOpen?: ModalChoices;
  deleteQueryOptions?: DeleteQueryOptions;
  closeConfirmation: boolean;
  savedContext?: any;
};

export type GenericContextForModals = {
  type: BulkOperationTypes;
  parentId: string;
  relationType: string;
  collection: Collection;
  callbackFunction?: Function;
};

const initialModalInfo: ModalInfo = {
  open: false,
  modalPosition: "left",
  closeConfirmation: false,
};

const getInitialModals = (): { [key: string]: ModalInfo } => {
  const initialModals: { [key: string]: ModalInfo } = {};
  Object.keys(TypeModals).forEach(
    (modalType) => (initialModals[modalType] = { ...initialModalInfo })
  );
  return initialModals;
};

const modals = reactive<{ [key: string]: ModalInfo }>(getInitialModals());
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals[modalType];
  };

  const setModalElement = (
    modalElement: HTMLDialogElement,
    modalType: TypeModals
  ) => {
    updateModal(modalType, { modal: modalElement });
  };

  const openModal = (
    modalType: TypeModals,
    modalTab: ModalChoices | undefined = undefined,
    modalPosition: ModalPosition | undefined = undefined,
    formQuery: string | undefined = undefined,
    deleteQueryOptions: DeleteQueryOptions | undefined = undefined,
    askForCloseConfirmation: boolean | undefined = undefined,
    savedContext: any | undefined = undefined
  ): void => {
    if (modalType !== TypeModals.Confirm)
      closeModalsWithPosition(getModalInfo(modalType).modalPosition);
    const updatedModal = { open: true };
    Object.assign(updatedModal, { modalPosition });
    Object.assign(updatedModal, { formQuery });
    Object.assign(updatedModal, { savedContext });
    Object.assign(updatedModal, { deleteQueryOptions });
    updateModal(modalType, updatedModal);
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    if (askForCloseConfirmation)
      getModalInfo(modalType).closeConfirmation = askForCloseConfirmation;
  };

  const isCenterModalOpened = computed(() => {
    let isOpen: boolean = false;
    Object.keys(modals).forEach((modalKey: string) => {
      const modal: ModalInfo = modals[modalKey];
      if (modal.open && modal.modalPosition === "center") isOpen = true;
    });
    return isOpen;
  });

  const closeModalsWithPosition = (position: ModalPosition): void => {
    const modalsWithPosition: ModalInfo[] = Object.values(modals).filter(
      (modal: ModalInfo) => modal.modalPosition === position
    );
    if (!modalsWithPosition) return;
    modalsWithPosition.forEach((modal: ModalInfo) => (modal.open = false));
  };

  const getModalInfo = (modalType: TypeModals): ModalInfo => {
    return modals[modalType];
  };

  const updateModal = (
    modalType: TypeModals,
    modalInput: { [key: string]: any }
  ): void => {
    Object.assign(modals[modalType], modalInput);
  };

  const closeModal = (modalType: TypeModals): void => {
    try {
      if (modals[modalType].closeConfirmation) {
        openModal(TypeModals.Confirm, undefined, "center");
      } else {
        modals[modalType].open = false;
      }
    } catch (e) {
      console.info(`Could not close ${modalType} modal`);
    }
  };

  const changeCloseConfirmation = (modalType: TypeModals, value: boolean) => {
    modals[modalType].closeConfirmation = value;
  };

  const updateDeleteQueryOptions = (value: string) => {
    deleteQueryOptions.value = value;
  };

  return {
    getModal,
    setModalElement,
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
  };
};
