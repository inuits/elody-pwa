import Dropzone, { type DropzoneFile } from "dropzone";
import { computed, ref, toRaw, watch } from "vue";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
  UploadFieldType,
  UploadFlow,
} from "@/generated-types/queries";
import useEntitySingle from "@/composables/useEntitySingle";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";

type UploadSettings = {
  uploadType: UploadFieldType;
  uploadFlow: UploadFlow;
};

const uploadStatus = ref<"no-upload" | "uploading" | "upload-finished">(
  "no-upload"
);
const uploadProgress = ref<ActionProgressStep[]>([]);
const amountUploaded = ref<number>(0);
const dryRunComplete = ref<boolean>(false);
const dryRunErrors = ref<string[]>([]);
const files = ref<DropzoneFile[]>([]);
const mediafiles = computed((): DropzoneFile[] =>
  files.value.filter((file: DropzoneFile) => file.type !== "text/csv")
);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[] | undefined>(undefined);
const containsCsv = computed(
  () => !!files.value.find((file: DropzoneFile) => file.type === "text/csv")
);
const uploadFlow = ref<UploadFlow>(UploadFlow.MediafilesOnly);
const uploadValidationFn = ref<Function>(() => {
  return false;
});
const enableUploadButton = computed(() => uploadValidationFn.value());
const missingFileNames = ref<string[]>([]);

const useUpload = () => {
  let _prefetchedUploadUrls: string[] | "not-prefetched-yet" =
    "not-prefetched-yet";

  const initializeUpload = (uploadSettings: UploadSettings): void => {
    uploadFlow.value = uploadSettings.uploadFlow;

    const settingsObject: {
      [key: string]: {
        checkUploadValidityFn: Function;
      };
    } = {
      mediafilesOnly: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesOnly(),
      },
      mediafilesWithRequiredCsv: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesWithCsv(),
      },
      mediafilesWithOptionalCsv: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesWithCsv(),
      },
    };
    uploadValidationFn.value =
      settingsObject[uploadSettings.uploadFlow].checkUploadValidityFn;
  };

  const __checkUploadValidityMediafilesOnly = (): boolean => {
    return !!(
      (!uploadProgress.value ||
        uploadFlow.value === UploadFlow.MediafilesOnly) &&
      mediafiles.value.length
    );
  };

  const __checkUploadValidityMediafilesWithCsv = (): boolean => {
    return uploadProgress.value
      .filter(
        (progressStep: ActionProgressStep) =>
          progressStep.stepType !== ProgressStepType.Upload
      )
      .every(
        (progressStep: ActionProgressStep) =>
          progressStep.status === ProgressStepStatus.Complete
      );
  };

  const __uploadMediafilesWithTicketUrl = async (
    isLinkedUpload: boolean,
    config: any,
    t: Function
  ) => {
    const generator = uploadGenerator(
      config,
      isLinkedUpload ? useEntitySingle().getEntityUuid() : ""
    );

    for await (const upload of generator) {
      if (!upload?.response.ok) {
        __uploadExceptionHandler(await upload?.response.text(), upload.file, t);
        continue;
      }
      __updateFileThumbnails(
        upload.file,
        ProgressStepType.Upload,
        ProgressStepStatus.Complete
      );
      amountUploaded.value++;
    }
    toggleUploadStatus();
    __updateGlobalUploadProgress(
      ProgressStepType.Upload,
      ProgressStepStatus.Complete
    );
  };

  const upload = async (isLinkedUpload: boolean, config: any, t: Function) => {
    if (!validateFiles()) return;
    __updateGlobalUploadProgress(
      ProgressStepType.Upload,
      ProgressStepStatus.Loading
    );
    toggleUploadStatus();
    if (
      uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv
    )
      __uploadMediafilesWithTicketUrl(isLinkedUpload, config, t);

    if (uploadFlow.value === UploadFlow.MediafilesOnly)
      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Complete
      );
    __uploadMediafilesWithTicketUrl(isLinkedUpload, config, t);
  };

  const __uploadExceptionHandler = (
    errorDescription: string | undefined,
    file: DropzoneFile,
    t: Function
  ) => {
    if (!errorDescription)
      errorDescription = t("dropzone.errorNotification.description") as string;
    __updateFileThumbnails(
      file,
      ProgressStepType.Upload,
      ProgressStepStatus.Failed,
      [errorDescription]
    );
  };

  const handleDryRunResult = (dryRunResult: any, file: DropzoneFile): void => {
    try {
      if (dryRunResult.message) {
        dryRunErrors.value.push(dryRunResult.message);
        __updateGlobalUploadProgress(
          ProgressStepType.Validate,
          ProgressStepStatus.Failed
        );
        __updateFileThumbnails(
          file,
          ProgressStepType.Validate,
          ProgressStepStatus.Failed,
          dryRunResult.message
        );
        return;
      }

      const errors: string[] = [];
      const errorKeys = Object.keys(dryRunResult.errors);
      errorKeys.forEach((key: string) => {
        const errorList = dryRunResult.errors[key];
        if (errorList.length) {
          errors.push(...errorList);
        }
      });
      if (dryRunResult?.mediafiles.length) {
        requiredMediafiles.value = dryRunResult.mediafiles.map(
          (mediafile: any) => mediafile.filename
        );
      }
      dryRunErrors.value = errors;
      dryRunComplete.value = true;

      const dryRunStatus: ProgressStepStatus = dryRunErrors.value.length
        ? ProgressStepStatus.Failed
        : ProgressStepStatus.Complete;

      __updateGlobalUploadProgress(ProgressStepType.Validate, dryRunStatus);
      __updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        dryRunStatus,
        dryRunErrors.value || []
      );
    } catch {
      dryRunErrors.value.push("upload-fields.errors.dry-run-failed");
      __updateGlobalUploadProgress(
        ProgressStepType.Validate,
        ProgressStepStatus.Failed
      );
      __updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        ProgressStepStatus.Failed
      );
    }
  };

  const dryRunCsv = async (file: DropzoneFile) => {
    __updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Loading
    );
    __updateFileThumbnails(
      file,
      ProgressStepType.Validate,
      ProgressStepStatus.Loading
    );
    const dryRunResult = await __batchEntities(__getCsvBlob(), true);
    handleDryRunResult(dryRunResult, file);
  };

  const __batchEntities = async (
    csv: Blob,
    isDryRun: boolean = false
  ): Promise<string[] | number> => {
    const response = await fetch(
      `/api/upload/batch${isDryRun ? "?dry_run=true" : ""}`,
      {
        headers: { "Content-Type": "text/csv" },
        method: "POST",
        body: csv,
      }
    );
    if (!isDryRun) return JSON.parse(await response.text());
    else return response.json();
  };

  const toggleUploadStatus = () => {
    if (uploadStatus.value === "no-upload") uploadStatus.value = "uploading";
    else if (uploadStatus.value === "uploading") {
      uploadStatus.value = "upload-finished";
      uploadProgressPercentage.value = 0;
    } else if (uploadStatus.value === "upload-finished")
      uploadStatus.value = "uploading";
  };

  const __getUploadUrlForStandaloneMediafile = async (file: DropzoneFile) => {
    const response = await fetch(`/api/upload/single?filename=${file.name}`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    return JSON.parse(await response.text());
  };

  const __getUploadUrlForMediafileOnEntity = async (
    entityId: string,
    file: DropzoneFile
  ): Promise<string> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&filename=${file.name}&hasRelation=true`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }
    );
    return JSON.parse(await response.text());
  };

  const __getCsvBlob = () => {
    try {
      const csvFile = files.value.find(
        (file: DropzoneFile) => file.type === "text/csv"
      );
      return new Blob([csvFile], { type: csvFile.type });
    } catch (e) {
      throw Error(e);
    }
  };

  const __getUploadUrl = async (file: DropzoneFile, entityId: string = "") => {
    let uploadUrl: string | undefined = undefined;

    if (
      uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv
    ) {
      if (containsCsv.value) {
        if (_prefetchedUploadUrls === "not-prefetched-yet")
          _prefetchedUploadUrls = (await __batchEntities(
            __getCsvBlob()
          )) as string[];
        uploadUrl = _prefetchedUploadUrls.find((url: string) =>
          url.includes(file.name)
        );
      } else {
        uploadUrl = await __getUploadUrlForStandaloneMediafile(file);
      }
    }
    if (uploadFlow.value === UploadFlow.MediafilesOnly) {
      uploadUrl = await __getUploadUrlForMediafileOnEntity(entityId, file);
    }

    if (!uploadUrl) throw new Error("Upload url is undefined.");
    return uploadUrl;
  };

  const __constructExternalUrlForUpload = (
    url: string,
    storageApiUrl: string
  ): string => {
    const urlObject = new URL(url);
    const origin = new URL(storageApiUrl).origin;
    return origin + urlObject.pathname + "?" + urlObject.searchParams;
  };

  const __uploadFile = async (file: DropzoneFile, url: string, config: any) => {
    __updateFileThumbnails(
      file,
      ProgressStepType.Upload,
      ProgressStepStatus.Loading
    );
    const formData = new FormData();
    formData.append("file", file);
    const extUrl = __constructExternalUrlForUpload(
      url,
      config.api.storageApiUrl
    );
    return {
      response: await fetch(extUrl, {
        method: "POST",
        body: formData,
      }),
      file: file,
    };
  };

  async function* uploadGenerator(config: any, entityId: string = "") {
    __updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Complete
    );
    __updateGlobalUploadProgress(
      ProgressStepType.Prepare,
      ProgressStepStatus.Complete
    );

    const filesToUpload = mediafiles.value;
    for (const file of filesToUpload) {
      __updateFileThumbnails(
        file,
        ProgressStepType.Prepare,
        ProgressStepStatus.Loading
      );
      const url = await __getUploadUrl(file, entityId);
      __updateFileThumbnails(
        file,
        ProgressStepType.Prepare,
        ProgressStepStatus.Complete
      );
      yield __uploadFile(file, url, config);
    }

    _prefetchedUploadUrls = "not-prefetched-yet";
  }

  const validateFiles = () => {
    if (
      uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv
    ) {
      if (uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv)
        return containsCsv.value && mediafiles.value.length > 0;
      else return mediafiles.value.length > 0;
    }

    if (uploadFlow.value === UploadFlow.MediafilesOnly)
      return !containsCsv.value && mediafiles.value.length > 0;
    return false;
  };

  const removeFileToUpload = (
    fileToRemove: DropzoneFile,
    isValidationFile: boolean = false
  ) => {
    files.value = files.value.filter(
      (file: DropzoneFile) => file !== fileToRemove
    );
    if (isValidationFile) {
      dryRunComplete.value = false;
      dryRunErrors.value = [];
      requiredMediafiles.value = undefined;
    }
    if (!mediafiles.value.length)
      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Empty
      );
    if (!files.value.length) resetUploadProgress();
  };

  const addFileToUpload = (
    fileToAdd: DropzoneFile,
    isValidationFile: boolean
  ) => {
    files.value.push(fileToAdd);

    if (!isValidationFile) {
      __updateFileThumbnails(
        fileToAdd,
        ProgressStepType.Validate,
        ProgressStepStatus.Complete
      );
      return;
    }
    dryRunCsv(fileToAdd);
  };

  const setUploadProgressPercentage = (newPercentage: number): void => {
    uploadProgressPercentage.value = newPercentage;
  };

  const resetUploadDropzone = (): void => {
    useDynamicForm().dynamicFormUploadFields.value.forEach(
      (dropzone: Dropzone) => {
        dropzone.removeAllFiles();
      }
    );
  };

  const resetUpload = () => {
    uploadStatus.value = "no-upload";
    dryRunErrors.value = [];
    missingFileNames.value = [];
    files.value = [];
    requiredMediafiles.value = undefined;
    amountUploaded.value = 0;
    resetUploadDropzone();
    resetUploadProgress();
  };

  const verifyAllNeededFilesArePresent = (): boolean => {
    try {
      missingFileNames.value = [];

      if (
        uploadFlow.value === UploadFlow.MediafilesOnly ||
        uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv
      )
        return true;

      if (!requiredMediafiles.value) {
        resetUploadProgress();
        return true;
      }

      const requiredFileNames: string[] = [...requiredMediafiles.value];
      let areAllFilesPresent: boolean = true;

      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Loading
      );

      requiredFileNames.forEach((requiredFileName: string) => {
        const file: DropzoneFile | undefined = mediafiles.value.find(
          (file: DropzoneFile) => file.name === requiredFileName
        );
        if (!file) {
          areAllFilesPresent = false;
          missingFileNames.value.push(requiredFileName);
        }
      });

      mediafiles.value.forEach((file: DropzoneFile) => {
        if (!requiredFileNames.includes(file.name)) {
          areAllFilesPresent = false;
          __updateFileThumbnails(
            file,
            ProgressStepType.Validate,
            ProgressStepStatus.Failed,
            [`${file.name} is extraneous`]
          );
        }
      });

      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        areAllFilesPresent
          ? ProgressStepStatus.Complete
          : ProgressStepStatus.Failed
      );

      return areAllFilesPresent;
    } catch {
      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Failed
      );
      return false;
    }
  };

  const resetUploadProgress = (): void => {
    if (!uploadProgress.value) return;
    const newProgress = structuredClone(toRaw(uploadProgress.value));

    newProgress.forEach((step: ActionProgressStep) => {
      step.status = ProgressStepStatus.Empty;
    });

    uploadProgress.value = newProgress;
  };

  const __updateGlobalUploadProgress = (
    stepType: ProgressStepType,
    status: ProgressStepStatus
  ): void => {
    if (!uploadProgress.value) return;
    const newProgress = structuredClone(toRaw(uploadProgress.value));

    newProgress.forEach((step: ActionProgressStep) => {
      if (step.stepType !== stepType) return;
      step.status = status;
    });

    uploadProgress.value = newProgress;
  };

  const __hideAllFileProgressSteps = (stepTypeContainer: Element): void => {
    Array.from(stepTypeContainer.children).forEach((child: Element) => {
      if (!child.classList.contains("hidden")) child.classList.add("hidden");
    });
  };

  const __updateFileThumbnails = (
    file: DropzoneFile,
    stepType: ProgressStepType,
    status: ProgressStepStatus,
    errors: string[] = []
  ): void => {
    const stepClass: string = `file-${stepType}-${status}`;
    const stepTypeContainerClass: string = `file-${stepType}-container`;

    const stepNode: Element | null = file.previewTemplate
      .getElementsByClassName(stepClass)
      .item(0);
    const stepTypeContainer = file.previewTemplate
      .getElementsByClassName(stepTypeContainerClass)
      .item(0);

    if (!stepNode || !stepTypeContainer) return;
    __hideAllFileProgressSteps(stepTypeContainer);
    stepNode.classList.remove("hidden");

    if (status !== ProgressStepStatus.Failed) return;
    __handleFileThumbnailError(file, errors);
  };

  const __handleFileThumbnailError = (
    file: DropzoneFile,
    errors: string[]
  ): void => {
    const filePreview: HTMLElement = file.previewTemplate;

    filePreview.classList.add("border-2", "border-red-default");
    const errorContainer: Element | null = filePreview
      .getElementsByClassName("error-message-container"
      .item(0);

    if (!errorContainer || !errors) return;
    errors.forEach((error: string) => {
      const errorNode = document.createElement("p");
      errorNode.innerHTML = error;
      errorContainer.appendChild(errorNode);
    });
    errorContainer.classList.remove("hidden");
  };

  return {
    resetUpload,
    addFileToUpload,
    removeFileToUpload,
    dryRunCsv,
    dryRunErrors,
    upload,
    validateFiles,
    toggleUploadStatus,
    uploadStatus,
    setUploadProgressPercentage,
    uploadProgressPercentage,
    files,
    uploadType,
    enableUploadButton,
    mediafiles,
    requiredMediafiles,
    verifyAllNeededFilesArePresent,
    __updateGlobalUploadProgress,
    dryRunComplete,
    uploadProgress,
    amountUploaded,
    __updateFileThumbnails,
    initializeUpload,
    uploadFlow,
    missingFileNames,
  };
};

watch(
  () => mediafiles.value.length,
  () => {
    useUpload().verifyAllNeededFilesArePresent();
  }
);

export default useUpload;
