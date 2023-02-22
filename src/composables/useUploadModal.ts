import type { ModalState } from "@/components/base/BaseModal.vue";
import useDropzoneHelper from "@/composables/useDropzoneHelper";
import { ref } from "vue";

export enum modalChoices {
  IMPORT = "IMPORT",
  DROPZONE = "DROPZONE",
}

export type UploadModalType = {
  state: ModalState;
};

export const uploadModalState = ref<UploadModalType>({
  state: "hide",
});

const useUploadModal = () => {
  const modalToOpen = ref<modalChoices>(modalChoices.DROPZONE);
  const updateUploadModal = (uploadModalInput: UploadModalType) => {
    uploadModalState.value = uploadModalInput;
  };

  const openUploadModal = (modal: modalChoices) => {
    modalToOpen.value = modal;
    updateUploadModal({
      state: "show",
    });
    useDropzoneHelper().resetDropzone();
  };

  const closeUploadModal = () => {
    updateUploadModal({
      state: "hide",
    });
  };

  return {
    modalToOpen,
    openUploadModal,
    closeUploadModal,
  };
};

export default useUploadModal;
