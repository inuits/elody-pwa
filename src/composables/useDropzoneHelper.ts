import { ref } from "vue";

const myDropzone = ref<any>();
const errorMessages = ref<Array<String>>([]);
const total = ref<number>(0);
const success = ref<number>(0);
const failed = ref<number>(0);
const selectedFiles = ref<any>([]);
const isUploading = ref<boolean>(false);

const useDropzoneHelper = () => {
  const setDropzoneErrorMessages = (errorMessage: string): void => {
    errorMessages.value.push(errorMessage);
  };

  const clearDropzoneErrorMessages = (): void => {
    errorMessages.value = [];
  };

  const increaseFailedCounter = (): void => {
    failed.value++;
  };

  const increaseSuccessCounter = (): void => {
    success.value++;
  };

  const setTotalCounter = (t: number): void => {
    total.value = t;
  };

  const clearDropzoneCounters = (): void => {
    total.value = 0;
    success.value = 0;
    failed.value = 0;
  };

  const getDropzoneSettings = (dropzonePreviewDiv: any): any => {
    return {
      url: "/upload",
      autoProcessQueue: false,
      acceptedFiles: ".jpg",
      previewTemplate: dropzonePreviewDiv.value?.outerHTML,
      uploadMultiple: true,
      parallelUploads: 99,
      maxFiles: 99,
    };
  };

  return {
    setDropzoneErrorMessages,
    clearDropzoneErrorMessages,
    increaseFailedCounter,
    increaseSuccessCounter,
    setTotalCounter,
    clearDropzoneCounters,
    getDropzoneSettings,
    total,
    failed,
    success,
    errorMessages,
    selectedFiles,
    isUploading,
    myDropzone,
  };
};

export default useDropzoneHelper;
