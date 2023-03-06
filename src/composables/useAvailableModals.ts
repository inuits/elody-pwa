import { ref, type Ref } from "vue";

export enum ModalState {
    Initial = "initial",
    Show = "show",
    Hide = "hide",
    Loading = "loading",
}

interface UseAvailableModals {
    updateModal: (modalInput: ModalType) => void;
    closeModal: () => void;
    openModal: () => void;
    modalState: Ref<ModalType>
}
export type ModalType = {
    state: ModalState;
    destination?:String
};

const modalState = ref<ModalType>({ state: ModalState.Initial })

export const useAvailableModals = (): UseAvailableModals => {
    
    const updateModal = (modalInput: ModalType) => {
        modalState.value.state = modalInput.state;
    };

    const closeModal = () => {
        updateModal({
            state: ModalState.Hide,
        });
    };

    const openModal = () => {
        updateModal({
            state: ModalState.Show,
        });
    };
    return {
        updateModal,
        closeModal,
        openModal,
        modalState
    }
}