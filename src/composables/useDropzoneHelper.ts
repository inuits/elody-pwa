import { ref } from "vue";

const myDropzone = ref<any>();
const errorMessages = ref<Array<String>>([]);
const total = ref<number>(0);
const success = ref<number>(0);
const failed = ref<number>(0);
const selectedFiles = ref<any>([]);
const isUploading = ref<boolean>(false);
const finishedUploading = ref<boolean>(false);

const useDropzoneHelper = () => {
  const setDropzoneErrorMessages = (errorMessage: string): void => {
    errorMessages.value.push(errorMessage);
  };

  const clearDropzoneErrorMessages = (): void => {
    errorMessages.value = [];
  };

  const increaseFailedCounter = (): void => {
    failed.value++;
    detectUploadingState();
  };

  const increaseSuccessCounter = (): void => {
    success.value++;
    detectUploadingState();
  };

  const setTotalCounter = (t: number): void => {
    total.value = t;
  };

  const clearDropzoneCounters = (): void => {
    total.value = 0;
    success.value = 0;
    failed.value = 0;
  };

  const setSelectedMediafiles = (files: any[]) => {
    setTotalCounter(files.length);
    selectedFiles.value = files;
  };

  const detectUploadingState = () => {
    if (total.value === failed.value + success.value && total.value !== 0) {
      finishedUploading.value = true;
    } else {
      finishedUploading.value = false;
    }
  };

  const resetDropzone = () => {
    myDropzone.value.removeAllFiles();
    finishedUploading.value = false;
    clearDropzoneCounters();
  };

  const getDropzoneSettings = (dropzonePreviewDiv: any): any => {
    return {
      url: "/upload",
      autoProcessQueue: false,
      acceptedFiles: ".jpg, .jpeg, .mp3, .srt, .png, .tiff",
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
    setSelectedMediafiles,
    total,
    failed,
    success,
    finishedUploading,
    errorMessages,
    selectedFiles,
    isUploading,
    myDropzone,
    resetDropzone,
  };
};

export default useDropzoneHelper;
