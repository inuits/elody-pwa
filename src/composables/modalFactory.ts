import { ref,type Ref } from "vue";
import useDropzoneHelper from "./useDropzoneHelper";


export enum TypeModals { 
    Upload = "Upload",
    Create = "Nieuw"
}
export enum modalChoices {
    IMPORT = "IMPORT",
    DROPZONE = "DROPZONE",
}

export enum ModalState {
    Initial = "initial",
    Show = "show",
    Hide = "hide",
    Loading = "loading",
}

export type ModalType = {
    state: ModalState;
    destination?: String
};


export interface IBaseModal {
    updateModal: (modalInput: ModalType) => void;
    closeModal: () => void;
    modalState: Ref<ModalType>
}

export interface IUploadModal {
    openModal: (modalChoices: modalChoices) => void;
    modalToOpen:Ref<modalChoices>;

}

export interface ICreateModal {
    openModal: () => void;
}

export class UploadModal implements IUploadModal, IBaseModal {
    modalState: Ref<ModalType> = ref<ModalType>({ state: ModalState.Initial });
    modalToOpen: Ref<modalChoices> = ref<modalChoices>(modalChoices.DROPZONE);

    updateModal(modalInput: ModalType): void {
        this.modalState.value = modalInput;
    }

    closeModal(): void {
        this.updateModal({
            state: ModalState.Hide,
        });
    }

    openModal(modalChoices: modalChoices): void {
        this.modalToOpen.value = ref(modalChoices || {}).value;
        this.updateModal({
            state: ModalState.Show,
        });
        useDropzoneHelper().resetDropzone();
    }
}

export class createModal implements ICreateModal, IBaseModal {
    modalState = ref<ModalType>({ state: ModalState.Initial })

    updateModal(modalInput: ModalType):void {
        this.modalState.value.state = modalInput.state;
    }
    closeModal():void {
        this.updateModal({
            state:ModalState.Hide
        })
    }
    openModal():void {
        this.updateModal({
            state:ModalState.Show
        })
    }    
}

export function makeModal (type:TypeModals) {
    if(type === TypeModals.Create){
        return new createModal();
    }
    if(type=== TypeModals.Upload){
        return new UploadModal();
    }
}

