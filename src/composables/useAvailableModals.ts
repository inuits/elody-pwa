import { makeModal, type IBaseModal } from "@/composables/modalFactory";
import { TypeModals } from "@/generated-types/queries";
const modalMap = new Map<TypeModals, IBaseModal>();

export const useAvailableModals = () => {
  const getModal = (type: TypeModals): IBaseModal => {
    const existingModal = modalMap.get(type);
    if (existingModal) return existingModal;

    const modal = makeModal(type);
    modalMap.set(type, modal);
    return modal;
  };

  return {
    getModal,
    modalMap,
  };
};
