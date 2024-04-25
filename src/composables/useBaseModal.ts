import { computed, ref } from "vue";
import {
  ModalChoices,
  ModalState,
  TypeModals
} from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
export type ModalPosition = "left" | "center" | "right";

export type ModalInfo = {
  state: ModalState;
  modalPosition: ModalPosition;
  destination?: string;
  formQuery?: string;
  modalTabToOpen?: ModalChoices;
  closeConfirmation: boolean;
  contextFromBulkOperations?: Context;
};

const initialModalInfo: ModalInfo = {
  state: ModalState.Initial,
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

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals.value[modalType];
  };

  const openModal = (
    modalType: TypeModals,
    modalTab: ModalChoices | undefined = undefined,
    modalPosition: ModalPosition | undefined = undefined,
    formQuery: string | undefined = undefined,
    askForCloseConfirmation: boolean | undefined = undefined,
    contextFromBulkOperations: Context | undefined = undefined
  ): void => {
    if (modalType !== TypeModals.Confirm)
      closeModalsWithPosition(getModalInfo(modalType).modalPosition);
    const updatedModal = {
      state: ModalState.Show,
    };
    if (modalPosition) Object.assign(updatedModal, { modalPosition });
    if (formQuery) Object.assign(updatedModal, { formQuery });
    if (contextFromBulkOperations) Object.assign(updatedModal, { contextFromBulkOperations });
    updateModal(modalType, updatedModal);
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    if (askForCloseConfirmation)
      getModalInfo(modalType).closeConfirmation = askForCloseConfirmation;
  };

  const isLeftModalOpened = computed(() => {
    let isOpen: boolean = false;
    Object.keys(modals.value).forEach((modalKey: string) => {
      const modal: ModalInfo = modals.value[modalKey];
      if (modal.state === ModalState.Show && modal.modalPosition === "left")
        isOpen = true;
    });
    return isOpen;
  });

  const closeModalsWithPosition = (position: ModalPosition): void => {
    const modalsWithPosition: ModalInfo[] = Object.values(modals.value).filter(
      (modal: ModalInfo) => modal.modalPosition === position
    );
    if (!modalsWithPosition) return;
    modalsWithPosition.forEach(
      (modal: ModalInfo) => (modal.state = ModalState.Hide)
    );
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
        modals.value[modalType].state = ModalState.Hide;
      }
    } catch (e) {
      console.info(`Could not close ${modalType} modal`);
    }
  };

  const changeCloseConfirmation = (modalType: TypeModals, value: boolean) => {
    modals.value[modalType].closeConfirmation = value;
  };

  return {
    getModal,
    modals,
    getModalInfo,
    updateModal,
    closeModal,
    openModal,
    isLeftModalOpened,
    changeCloseConfirmation,
    modalToCloseAfterConfirm,
  };
};
