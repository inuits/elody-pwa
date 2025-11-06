import { ref } from "vue";
import type { DropzoneFile } from "dropzone";
import { UploadStatus } from "./types";
import {
  type ActionProgressStep,
  UploadEntityTypes,
  UploadFieldType,
  UploadFlow,
} from "@/generated-types/queries";
console.log("useUploadState loaded", UploadStatus);
const uploadStatus = ref<UploadStatus>(UploadStatus.NoUpload);
const uploadProgress = ref<ActionProgressStep[]>([]);
const amountUploaded = ref<number>(0);
const dryRunComplete = ref<boolean>(false);
const dryRunErrors = ref<string[]>([]);
const files = ref<DropzoneFile[]>([]);
const lastUploadedFileIndex = ref<number>(-1);
const currentUploadAbortController = ref<AbortController | undefined>(undefined);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[]>([]);
const uploadFlow = ref<UploadFlow>(UploadFlow.MediafilesOnly);
const missingFileNames = ref<string[]>([]);
const failedUploads = ref<string[]>([]);
const standaloneFileType = ref<UploadEntityTypes | undefined>(undefined);
const reinitializeDynamicFormFunc = ref<() => void>(() => {});
const csvOnlyUploadSFailed = ref<boolean>(false);
const jobIdentifier = ref<string | undefined>(undefined);
const prefetchedUploadUrls = ref<string[]>([]);
const extraMediafileType = ref<string | undefined>(undefined);
const optionalFileNames = ref<string[]>([]);

export const useUploadState = () => {
  const resetState = () => {
    uploadFlow.value = UploadFlow.MediafilesOnly;
    uploadStatus.value = UploadStatus.NoUpload;
    files.value = [];
    dryRunErrors.value = [];
    missingFileNames.value = [];
    extraMediafileType.value = undefined;
    optionalFileNames.value = [];
  };

  return {
    // State
    uploadStatus,
    uploadProgress,
    amountUploaded,
    dryRunComplete,
    dryRunErrors,
    files,
    lastUploadedFileIndex,
    currentUploadAbortController,
    uploadProgressPercentage,
    uploadType,
    requiredMediafiles,
    uploadFlow,
    missingFileNames,
    failedUploads,
    standaloneFileType,
    reinitializeDynamicFormFunc,
    csvOnlyUploadSFailed,
    jobIdentifier,
    prefetchedUploadUrls,
    extraMediafileType,
    optionalFileNames,

    // Actions
    resetState,
  };
};
