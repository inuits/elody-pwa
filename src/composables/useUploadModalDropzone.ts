import type { UploadType } from "@/composables/useUpload";
import { ref } from "vue";

const entityIdForLinkedUpload = ref<string | undefined>(undefined);
const uploadStatus = ref<"no-upload" | "success">("no-upload");
const uploadType = ref<UploadType>("batch");

const useUploadModalDropzone = () => {
  const getEntityIdForLinkedUpload = () => entityIdForLinkedUpload.value;

  const getUploadStatus = () => uploadStatus.value;

  const getUploadType = () => uploadType.value;

  const setEntityIdForLinkedUpload = (id: string | undefined) => {
    entityIdForLinkedUpload.value = id;
  };

  const setUploadStatus = (status: "no-upload" | "success") => {
    uploadStatus.value = status;
  };

  const setUploadType = (type: UploadType) => {
    uploadType.value = type;
  };

  return {
    getEntityIdForLinkedUpload,
    getUploadStatus,
    getUploadType,
    setEntityIdForLinkedUpload,
    setUploadStatus,
    setUploadType,
  };
};

export default useUploadModalDropzone;
