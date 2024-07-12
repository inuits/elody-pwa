import { computed, ref } from "vue";
import {
  BulkOperationTypes,
  Collection,
  type DeleteQueryOptions,
  ModalChoices,
  ModalState,
  TypeModals
} from "@/generated-types/queries";
export type ModalPosition = "left" | "center" | "right";

export type ModalInfo = {
  state: ModalState;
  modalPosition: ModalPosition;
  destination?: string;
  formQuery?: string;
  modalTabToOpen?: ModalChoices;
  deleteQueryOptions?: DeleteQueryOptions;
  closeConfirmation: boolean;
  savedContext?: any;
};

export type GenericContextForModals = {
  type: BulkOperationTypes
  parentId: string;
  relationType: string;
  collection: Collection;
  callbackFunction?: Function;
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
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);

export const useBaseModal = () => {
  const getModal = (modalType: TypeModals): ModalInfo => {
    return modals.value[modalType];
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
    const updatedModal = {
      state: ModalState.Show,
    };
    if (modalPosition) Object.assign(updatedModal, { modalPosition });
    if (formQuery) Object.assign(updatedModal, { formQuery });
    if (savedContext) Object.assign(updatedModal, { savedContext });
    if (deleteQueryOptions) Object.assign(updatedModal, { deleteQueryOptions });
    updateModal(modalType, updatedModal);
    if (modalTab) getModalInfo(modalType).modalTabToOpen = modalTab;
    if (askForCloseConfirmation)
      getModalInfo(modalType).closeConfirmation = askForCloseConfirmation;
  };

  const isCenterModalOpened = computed(() => {
    let isOpen: boolean = false;
    Object.keys(modals.value).forEach((modalKey: string) => {
      const modal: ModalInfo = modals.value[modalKey];
      if (modal.state === ModalState.Show && modal.modalPosition === "center")
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

  const updateDeleteQueryOptions = (value: string) => {
    deleteQueryOptions.value = value;
  };

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
  };
};
