import { computed, ref } from "vue";
import {
  BulkOperationTypes,
  Collection,
  type DeleteQueryOptions,
  ModalChoices,
  TypeModals,
} from "@/generated-types/queries";
export type ModalPosition = "left" | "center" | "right";

export type ModalInfo = {
  modal?: HTMLDialogElement;
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

const modals = ref<{ [key: string]: ModalInfo }>(getInitialModals());
const modalToCloseAfterConfirm = ref<TypeModals | undefined>(undefined);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals.value[modalType];
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
    const updatedModal = {};
    Object.assign(updatedModal, { modalPosition });
    Object.assign(updatedModal, { formQuery });
    Object.assign(updatedModal, { savedContext });
    Object.assign(updatedModal, { deleteQueryOptions });
    updateModal(modalType, updatedModal);
    modals.value[modalType].modal?.showModal();
    console.log(`${modalType} open?`, modals.value[modalType].modal?.open);
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    if (askForCloseConfirmation)
      getModalInfo(modalType).closeConfirmation = askForCloseConfirmation;
  };

  const isCenterModalOpened = computed(() => {
    let isOpen: boolean = false;
    Object.keys(modals.value).forEach((modalKey: string) => {
      const modal: ModalInfo = modals.value[modalKey];
      if (modal.modal?.open && modal.modalPosition === "center") isOpen = true;
    });
    return isOpen;
  });

  const closeModalsWithPosition = (position: ModalPosition): void => {
    const modalsWithPosition: ModalInfo[] = Object.values(modals.value).filter(
      (modal: ModalInfo) => modal.modalPosition === position
    );
    if (!modalsWithPosition) return;
    modalsWithPosition.forEach((modal: ModalInfo) => !modal.modal?.open);
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
    try {
      if (modals.value[modalType].closeConfirmation) {
        openModal(TypeModals.Confirm, undefined, "center");
      } else {
        modals.value[modalType].modal?.close();
      }
    } catch (e) {
      console.info(`Could not close ${modalType} modal`);
    }
  };

  const changeCloseConfirmation = (modalType: TypeModals, value: boolean) => {
    modals.value[modalType].closeConfirmation = value;
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
