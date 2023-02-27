import Dropzone from "dropzone";
import { ref } from "vue";

const dropzone = ref<Dropzone>();
const errorMessages = ref<Array<String>>([]);
const total = ref<number>(0);
const success = ref<number>(0);
const failed = ref<number>(0);
const selectedFiles = ref<any>([]);
const isUploading = ref<boolean>(false);
const finishedUploading = ref<boolean>(false);

const useDropzoneHelper = () => {
  const initDropzone = (
    dropzoneView: HTMLDivElement,
    dropzonePreview: HTMLDivElement
  ) => {
    dropzone.value = new Dropzone(
      dropzoneView,
      getDropzoneSettings(dropzonePreview)
    );

    return dropzone.value;
  };

  const getDropzone = () => dropzone.value;

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

  const setTotalCounter = (totalCount: number): void => {
    total.value = totalCount;
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
    finishedUploading.value =
      total.value === failed.value + success.value && total.value !== 0;
  };

  const resetDropzone = () => {
    dropzone.value?.removeAllFiles();
    finishedUploading.value = false;
    clearDropzoneCounters();
  };

  const getDropzoneSettings = (dropzonePreviewDiv: HTMLDivElement): any => {
    return {
      url: "/upload",
      autoProcessQueue: false,
      acceptedFiles: ".csv, .jpg, .jpeg, .mp3, .srt, .png, .tiff, .mp4",
      previewTemplate: dropzonePreviewDiv.outerHTML,
      uploadMultiple: true,
      parallelUploads: 99,
      maxFiles: 99,
      maxFilesize: 50,
    };
  };

  return {
    myDropzone: dropzone, // used in deprecated dropzone component
    initDropzone,
    getDropzone,
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
    resetDropzone,
  };
};

export default useDropzoneHelper;
