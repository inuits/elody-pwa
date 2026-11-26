import { ref } from "vue";
import type { DropzoneFile } from "dropzone";
import { type DuplicateMediafile, UploadStatus } from "./types";
import {
  type ActionProgressStep,
  UploadEntityTypes,
  UploadFieldType,
  UploadFlow,
} from "@/generated-types/queries";

const uploadStatus = ref<UploadStatus>(UploadStatus.NoUpload);
const uploadProgress = ref<ActionProgressStep[]>([]);
const amountUploaded = ref<number>(0);
const dryRunComplete = ref<boolean>(false);
const dryRunFeedback = ref<{ errors: string[]; warnings: string[] }>({
  errors: [],
  warnings: [],
});
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
// Set when the CSV/Excel import itself failed: every file of that batch shows it
const batchUploadError = ref<string | undefined>(undefined);
const extraMediafileType = ref<string | undefined>(undefined);
const optionalFileNames = ref<string[]>([]);
const typeToIncludeInUrl = ref<string | undefined>(undefined);
const shouldIncludeTypeInUrl = ref<boolean>(false);
const duplicateMediafiles = ref<DuplicateMediafile[]>([]);

export const useUploadState = () => {
  const resetState = () => {
    uploadFlow.value = UploadFlow.MediafilesOnly;
    uploadStatus.value = UploadStatus.NoUpload;
    files.value = [];
    dryRunFeedback.value = { errors: [], warnings: [] };
    missingFileNames.value = [];
    extraMediafileType.value = undefined;
    optionalFileNames.value = [];
    lastUploadedFileIndex.value = -1;
    typeToIncludeInUrl.value = undefined;
    shouldIncludeTypeInUrl.value = false;
  };

  return {
    // State
    uploadStatus,
    uploadProgress,
    amountUploaded,
    dryRunComplete,
    dryRunFeedback,
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
    batchUploadError,
    extraMediafileType,
    optionalFileNames,
    typeToIncludeInUrl,
    shouldIncludeTypeInUrl,
    duplicateMediafiles,

    // Actions
    resetState,
  };
};
