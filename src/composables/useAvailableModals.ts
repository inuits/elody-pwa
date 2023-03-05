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
//De variabele modalstate word globaal aangeroepen //Foute manier
const modalState = ref<ModalType>({ state: ModalState.Initial })

export const useAvailableModals = (): UseAvailableModals => {
    //De variabale word enkel aangeroepen als je useAvailableModals instanieert. //Juiste manier
    // const modalState = ref<ModalType>({ state: ModalState.Initial })

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