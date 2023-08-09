import { ref } from "vue";

const uploadStatus = ref<"no-upload" | "success">("no-upload");

const useUploadModalDropzone = () => {
  const setUploadStatus = (status: "no-upload" | "success") => {
    uploadStatus.value = status;
  };

  const getUploadStatus = () => uploadStatus.value;

  return { setUploadStatus, getUploadStatus };
};

export default useUploadModalDropzone;
