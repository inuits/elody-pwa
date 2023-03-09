import { ref, type Ref } from "vue";
import { makeModal, TypeModals } from "./modalFactory";

const createmodal = makeModal(TypeModals.Create)
const uploadModal = makeModal(TypeModals.Upload)
export const useAvailableModals = () => {
    return {
        createmodal,
        uploadModal
    }
}