import Dropzone, { type DropzoneFile } from "dropzone";
import { type Ref, ref } from "vue";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";

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
  isUploading: Ref<boolean> = ref(false);
  finishedUploading: Ref<boolean> = ref(false);
  dropzoneSettings: Ref<DropzoneSettings> = ref({
    url: "/upload",
    autoProcessQueue: false,
    acceptedFiles: ".csv, .jpg, .jpeg, .mp3, .srt, .png, .tiff, .mp4, .txt, .xml",
    uploadMultiple: false,
    parallelUploads: 99,
    maxFiles: 99,
    maxFileSize: 50,
    createImageThumbnails: true,
  });

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

  resetDropzone = () => {
    this.dropzone.value?.removeAllFiles();
    this.finishedUploading.value = false;
  };

  getDropzoneSettings = (dropzonePreviewDiv: HTMLDivElement): any => {
    const settingsObject = { ...this.dropzoneSettings.value };
    settingsObject.previewTemplate = dropzonePreviewDiv.outerHTML;
    return settingsObject;
  };
}
