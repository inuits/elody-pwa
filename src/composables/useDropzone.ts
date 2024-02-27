import Dropzone, { type DropzoneFile } from "dropzone";
import { ref } from "vue";

type DropzoneSettings = {
  url: string;
  autoProcessQueue: boolean;
  acceptedFiles: string;
  previewTemplate?: HTMLDivElement;
  uploadMultiple: boolean;
  parallelUploads: number;
  maxFiles: number;
  maxFileSize: number;
  createImageThumbnails: boolean;
};
export class useDropzone {
  dropzone = ref<Dropzone>;
  errorMessages = ref<Array<string>>;
  total = ref<number>;
  success = ref<number>;
  failed = ref<number>;
  selectedFiles = ref<DropzoneFile>;
  isUploading = ref<boolean>;
  finishedUploading = ref<boolean>;
  dropzoneSettings = ref<DropzoneSettings>;

  constructor() {
    this.errorMessages = ref([]);
    this.total = ref(0);
    this.success = ref(0);
    this.failed = ref(0);
    this.selectedFiles = ref([]);
    this.isUploading = ref(false);
    this.finishedUploading = ref(false);
    this.dropzoneSettings = ref({
      url: "/upload",
      autoProcessQueue: false,
      acceptedFiles: ".csv, .jpg, .jpeg, .mp3, .srt, .png, .tiff, .mp4",
      uploadMultiple: false,
      parallelUploads: 99,
      maxFiles: 99,
      maxFileSize: 50,
      createImageThumbnails: true,
    });
  }

  initDropzone = (
    dropzoneView: HTMLDivElement,
    dropzonePreview: HTMLDivElement
  ) => {
    this.dropzone.value = new Dropzone(
      dropzoneView,
      this.getDropzoneSettings(dropzonePreview)
    );

    return this.dropzone.value;
  };

  getDropzone = () => this.dropzone.value;

  setDropzoneErrorMessages = (errorMessage: string): void => {
    this.errorMessages.value.push(errorMessage);
  };

  clearDropzoneErrorMessages = (): void => {
    this.errorMessages.value = [];
  };

  increaseFailedCounter = (): void => {
    this.failed.value++;
    this.detectUploadingState();
  };

  increaseSuccessCounter = (): void => {
    this.success.value++;
    this.detectUploadingState();
  };

  setTotalCounter = (totalCount: number): void => {
    this.total.value = totalCount;
  };

  clearDropzoneCounters = (): void => {
    this.total.value = 0;
    this.success.value = 0;
    this.failed.value = 0;
  };

  setSelectedMediafiles = (files: any[]) => {
    this.setTotalCounter(files.length);
    this.selectedFiles.value = files;
  };

  detectUploadingState = () => {
    this.finishedUploading.value =
      this.total.value === this.failed.value + this.success.value &&
      this.total.value !== 0;
  };

  resetDropzone = () => {
    this.dropzone.value?.removeAllFiles();
    this.finishedUploading.value = false;
    this.clearDropzoneErrorMessages();
    this.clearDropzoneCounters();
  };

  getDropzoneSettings = (dropzonePreviewDiv: HTMLDivElement): any => {
    const settingsObject = { ...this.dropzoneSettings.value };
    settingsObject.previewTemplate = dropzonePreviewDiv.outerHTML;
    return settingsObject;
  };
}
