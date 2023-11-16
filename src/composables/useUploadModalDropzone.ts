import { ref } from "vue";

const uploadStatus = ref<"no-upload" | "success">("no-upload");
const entityIdForLinkedUpload = ref<string | undefined>(undefined);

const useUploadModalDropzone = () => {
  const setUploadStatus = (status: "no-upload" | "success") => {
    uploadStatus.value = status;
  };

  const setEntityIdForLinkedUpload = (id: string | undefined) => {
    entityIdForLinkedUpload.value = id;
  };

  const getUploadStatus = () => uploadStatus.value;

  const getEntityIdForLinkedUpload = () => entityIdForLinkedUpload.value;

  return {
    setUploadStatus,
    getUploadStatus,
    setEntityIdForLinkedUpload,
    getEntityIdForLinkedUpload,
  };
};

export default useUploadModalDropzone;
