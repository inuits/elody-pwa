import type Dropzone from "dropzone";
import { type DropzoneFile } from "dropzone";
import { computed, ref, toRaw, watch } from "vue";
import {
  type ActionProgressStep,
  type EntityInput,
  ProgressStepStatus,
  ProgressStepType,
  TypeModals,
  type UploadEntityTypes,
  UploadFieldType,
  UploadFlow,
} from "@/generated-types/queries";
import useEntitySingle from "@/composables/useEntitySingle";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { useBaseModal } from "@/composables/useBaseModal";
import { useErrorCodes } from "@/composables/useErrorCodes";
import { router } from "@/main";
import { getTranslatedMessage } from "@/helpers";
import { useOcrUpload } from "@/composables/upload/useOcrUpload";
import {
  type UploadFlowConfiguration,
  useUploadFlowConfiguration,
} from "@/composables/upload/useUploadFlowConfiguration";

type UploadSettings = {
  uploadType: UploadFieldType;
  uploadFlow: UploadFlow;
  extraMediafileType: string | undefined;
};

export enum UploadStatus {
  NoUpload = "no-upload",
  Paused = "paused",
  Uploading = "uploading",
  Finished = "upload-finished",
}

const { handleHttpError, getMessageAndCodeFromErrorString } = useErrorCodes();
const uploadStatus = ref<UploadStatus>(UploadStatus.NoUpload);
const uploadProgress = ref<ActionProgressStep[]>([]);
const amountUploaded = ref<number>(0);
const dryRunComplete = ref<boolean>(false);
const dryRunErrors = ref<string[]>([]);
const files = ref<DropzoneFile[]>([]);
const lastUploadedFileIndex = ref<number>(-1);
const currentUploadAbortController = ref<AbortController | undefined>(
  undefined,
);
const mediafiles = computed((): DropzoneFile[] =>
  files.value.filter(
    (file: DropzoneFile) =>
      file.type !== "text/csv" && file.type !== "application/vnd.ms-excel",
  ),
);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[]>([]);
const csvFile = computed(() => {
  return files.value.find(
    (file: DropzoneFile) =>
      file.type === "text/csv" || file.type === "application/vnd.ms-excel",
  );
});
const containsCsv = computed(() => !!csvFile.value);
const containsXml = computed(
  () => !!files.value.find((file: DropzoneFile) => file.type === "text/xml"),
);
const uploadFlow = ref<UploadFlow>(UploadFlow.MediafilesOnly);
const uploadFlowConfiguration = computed<UploadFlowConfiguration | undefined>(
  () =>
    useUploadFlowConfiguration().getUploadFlowConfiguration(uploadFlow.value),
);
const uploadValidationFn = computed<() => boolean>(
  () => uploadFlowConfiguration.value?.checkUploadValidity,
);
const enableUploadButton = computed(() => uploadValidationFn.value());
const missingFileNames = ref<string[]>([]);
const failedUploads = ref<string[]>([]);
const standaloneFileType = ref<UploadEntityTypes | undefined>(undefined);
const reinitializeDynamicFormFunc = ref<() => void>(() => {});
const csvOnlyUploadSFailed = ref<boolean>(false);
const extraMediafileType = ref<string | undefined>(undefined);
const jobIdentifier = ref<string | undefined>(undefined);
const prefetchedUploadUrls = ref<string[]>([]);

const useUpload = (config: any) => {
  const initializeUpload = (uploadSettings: UploadSettings): void => {
    uploadFlow.value = uploadSettings.uploadFlow;

    if (uploadSettings.extraMediafileType)
      extraMediafileType.value = uploadSettings.extraMediafileType;
  };

  const __uploadCsvWithoutMediafiles = async () => {
    try {
      await batchEntities(getCsvBlob(), false);
      toggleUploadStatus();
      updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Complete,
      );
      csvOnlyUploadSFailed.value = false;
    } catch (error: Promise<string>) {
      csvOnlyUploadSFailed.value = true;
      const message = await error;
      updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      throw Error(message);
    }
  };

  const __uploadMediafilesWithTicketUrl = async (
    isLinkedUpload: boolean,
    entityInput: EntityInput | undefined = undefined,
  ): Promise<void> => {
    const generator = uploadGenerator(
      config,
      isLinkedUpload ? useEntitySingle().getEntityUuid() : "",
      entityInput,
    );

    const errors = [];

    for await (const upload of generator) {
      if (!upload?.response.ok) {
        __uploadExceptionHandler(upload?.response.text(), upload.file);
        errors.push(upload?.response.text());
        continue;
      }
      updateFileThumbnails(
        upload.file,
        ProgressStepType.Upload,
        ProgressStepStatus.Complete,
      );

      amountUploaded.value++;
    }
    toggleUploadStatus();
    const uploadStatus: ProgressStepStatus = failedUploads.value.length
      ? ProgressStepStatus.Failed
      : ProgressStepStatus.Complete;
    updateGlobalUploadProgress(ProgressStepType.Upload, uploadStatus);
    if (errors.length > 0) {
      throw errors.join(", ");
    }
  };

  const upload = async (isLinkedUpload: boolean, entityInput: EntityInput) => {
    if (!validateFiles()) return;
    updateGlobalUploadProgress(
      ProgressStepType.Upload,
      ProgressStepStatus.Loading,
    );
    toggleUploadStatus();
    setDeleteFileButtonVisibility("invisible");

    if (uploadFlow.value === UploadFlow.XmlMarc) {
      await __uploadXml();

      [
        ProgressStepType.Prepare,
        ProgressStepType.Validate,
        ProgressStepType.Upload,
      ].forEach((status: ProgressStepType) => {
        updateGlobalUploadProgress(status, ProgressStepStatus.Complete);
      });

      toggleUploadStatus();
      return;
    }

    if (
      uploadFlow.value === UploadFlow.MediafilesOnly ||
      uploadFlow.value === UploadFlow.OptionalMediafiles
    )
      updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Complete,
      );

    if (uploadFlow.value === UploadFlow.CsvOnly)
      await __uploadCsvWithoutMediafiles();
    else await __uploadMediafilesWithTicketUrl(isLinkedUpload, entityInput);
  };

  const uploadCsvForReordering = async (parentId: string) => {
    const response = await fetch(`/api/upload/csv?parentId=${parentId}`, {
      headers: { "Content-Type": "text/csv" },
      method: "POST",
      body: getCsvBlob(),
    });
    if (!response.ok)
      throw new Error(
        `Error while adjusting the order of entities: ${response.status}: ${response.statusText}`,
      );

    files.value = [];
  };

  const __uploadExceptionHandler = (
    errorDescription: string | undefined,
    file: DropzoneFile,
  ) => {
    if (!errorDescription)
      errorDescription = getTranslatedMessage(
        "dropzone.errorNotification.description",
      ) as string;
    updateFileThumbnails(
      file,
      ProgressStepType.Upload,
      ProgressStepStatus.Failed,
      [errorDescription],
    );
  };

  const getDryRunErrors = async (dryRunResult: any): Promise<string[]> => {
    const errors: string[] = [];
    const errorKeys = Object.keys(dryRunResult.errors);
    const errorPromises = errorKeys.map(async (key: string): Promise<void> => {
      const errorList = await Promise.all(
        dryRunResult.errors[key].map(async (errorMessage: string) => {
          try {
            const errorObject =
              await getMessageAndCodeFromErrorString(errorMessage);
            return errorObject.message;
          } catch (error) {
            console.error(`Error processing message: ${errorMessage}`, error);
            return null;
          }
        }),
      );
      if (errorList.length) {
        errors.push(...errorList);
      }
    });

    await Promise.all(errorPromises);
    return errors;
  };

  const handleDryRunResult = async (
    dryRunResult: any,
    file: DropzoneFile,
  ): Promise<void> => {
    try {
      const errors = await getDryRunErrors(dryRunResult);
      const mediafilesInDryRun: any[] = dryRunResult.mediafiles || [];

      if (uploadFlow.value === UploadFlow.MediafilesWithOcr) {
        useOcrUpload().handleOcrDryRunResult(mediafilesInDryRun);
      } else {
        requiredMediafiles.value = mediafilesInDryRun.map(
          (mediafile: any) => mediafile.filename,
        );
      }
      dryRunErrors.value = errors;
      dryRunComplete.value = true;

      const dryRunStatus: ProgressStepStatus = dryRunErrors.value.length
        ? ProgressStepStatus.Failed
        : ProgressStepStatus.Complete;

      updateGlobalUploadProgress(ProgressStepType.Validate, dryRunStatus);
      updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        dryRunStatus,
        dryRunErrors.value || [],
      );
      if (
        dryRunStatus === ProgressStepStatus.Complete &&
        mediafiles?.value &&
        mediafiles.value.length
      )
        mediafiles.value.forEach((mediafile: DropzoneFile) => {
          updateFileThumbnails(
            mediafile,
            ProgressStepType.Validate,
            ProgressStepStatus.Complete,
          );
        });
      verifyAllNeededFilesArePresent();
    } catch (e) {
      console.error(e);
      dryRunErrors.value.push("upload-fields.errors.dry-run-failed");
      updateGlobalUploadProgress(
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
      updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
    }
  };

  const dryRunCsv = async (file: DropzoneFile) => {
    updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Loading,
    );
    updateFileThumbnails(
      file,
      ProgressStepType.Validate,
      ProgressStepStatus.Loading,
    );
    let dryRunResult;
    try {
      dryRunResult = await batchEntities(getCsvBlob(), true);
      await handleDryRunResult(dryRunResult, file);
    } catch (error: Promise<string>) {
      const message = await error;
      dryRunErrors.value.push(message);
      updateGlobalUploadProgress(
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
      updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
        [message],
      );
    }
  };

  const batchEntities = async (
    csv: Blob,
    isDryRun: boolean = false,
  ): Promise<string[] | number> => {
    const filename = __getCsvFile().name;
    const response = await fetch(
      `/api/upload/batch?filename=${filename}${isDryRun ? "&dry_run=true" : ""}${extraMediafileType.value ? `&extra_mediafile_type=${extraMediafileType.value}` : ""}${jobIdentifier.value ? `&main_job_id=${jobIdentifier.value}` : ""}`,
      {
        headers: { "Content-Type": "text/csv" },
        method: "POST",
        body: csv,
      },
    );
    let parsedResult;
    if (!response.ok) {
      if (!isDryRun) toggleUploadStatus();
      updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      parsedResult = JSON.parse(await response.text()).extensions.response.body;
    } else {
      parsedResult = JSON.parse(await response.text());
    }

    if (parsedResult?.parent_job_id)
      jobIdentifier.value = parsedResult.parent_job_id;

    if (isDryRun) return parsedResult;
    else return parsedResult?.links;
  };

  const toggleUploadStatus = () => {
    if (uploadStatus.value === UploadStatus.NoUpload)
      uploadStatus.value = UploadStatus.Uploading;
    else if (uploadStatus.value === UploadStatus.Uploading) {
      uploadStatus.value = UploadStatus.Finished;
      uploadProgressPercentage.value = 0;
    } else if (uploadStatus.value === UploadStatus.Finished)
      uploadStatus.value = UploadStatus.Uploading;
  };

  // TODO: this is temp handler for demo #139636
  const __uploadXml = async (): Promise<string> => {
    const response = await fetch(`api/upload/xml`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const httpErrorMessage = handleHttpError(response);
      return Promise.reject(httpErrorMessage);
    }
    return JSON.parse(await response.text());
  };

  const __getCsvFile = (): DropzoneFile => {
    return files.value.find(
      (file: DropzoneFile) =>
        file.type === "text/csv" || file.type === "application/vnd.ms-excel",
    );
  };

  const __getCsvString = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileText = ref<string | null>(null);
      const reader = new FileReader();
      const csvFile = __getCsvFile();
      reader.onload = async (e) => {
        fileText.value = e.target?.result as string;
        resolve(fileText.value);
      };
      reader.onerror = (event) => {
        reject(event.target?.error);
      };
      reader.readAsText(csvFile);
    });
  };

  const getCsvBlob = () => {
    try {
      const csvFile = __getCsvFile();
      return new Blob([csvFile], { type: csvFile.type });
    } catch (e: any) {
      throw Error(e);
    }
  };

  const __getUploadUrl = async (
    file: DropzoneFile,
    entityId: string = "",
    entityInput: EntityInput | undefined = undefined,
  ) => {
    let uploadUrl: string | undefined;

    const uploadUrlFunction = uploadFlowConfiguration.value!.getUploadUrl;
    if (uploadUrlFunction) {
      uploadUrl = await uploadUrlFunction({
        entityId,
        file,
        entityInput,
      });
    }

    if (!uploadUrl) {
      updateFileThumbnails(
        file,
        ProgressStepType.Prepare,
        ProgressStepStatus.Failed,
      );
      throw new Error("Upload url is undefined.");
    }

    return uploadUrl;
  };

  const __constructExternalUrlForUpload = (
    url: string,
    storageApiUrl: string,
    file: DropzoneFile,
  ): string => {
    try {
      const urlObject = new URL(url);
      const origin = new URL(storageApiUrl).origin;
      return origin + urlObject.pathname + "?" + urlObject.searchParams;
    } catch (e: any) {
      updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        ["Something went wrong during upload"],
      );
      updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      throw Error(e);
    }
  };

  const __uploadFile = async (file: DropzoneFile, url: string, config: any) => {
    updateFileThumbnails(
      file,
      ProgressStepType.Upload,
      ProgressStepStatus.Loading,
    );
    const formData = new FormData();
    formData.append("file", file);
    const extUrl = __constructExternalUrlForUpload(
      url,
      config.api.storageApiUrl,
      file,
    );
    currentUploadAbortController.value = new AbortController();
    const signal = currentUploadAbortController.value.signal;
    const response = await fetch(extUrl, {
      signal,
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const httpErrorMessage = (
        await getMessageAndCodeFromErrorString(await response.text())
      ).message;
      updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        [httpErrorMessage],
      );
      return Promise.reject(httpErrorMessage);
    }

    file.status = "uploaded";

    return {
      response,
      file: file,
    };
  };

  async function* uploadGenerator(
    config: any,
    entityId: string = "",
    entityInput: EntityInput | undefined = undefined,
  ) {
    updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Complete,
    );
    updateGlobalUploadProgress(
      ProgressStepType.Prepare,
      ProgressStepStatus.Complete,
    );

    let filesToUpload = mediafiles.value;
    if (lastUploadedFileIndex.value !== -1)
      filesToUpload = mediafiles.value.slice(lastUploadedFileIndex.value);

    for (const file of filesToUpload) {
      try {
        lastUploadedFileIndex.value = files.value.indexOf(file);
        file.status = "uploading";
        if (uploadStatus.value === UploadStatus.Paused) break;
        updateFileThumbnails(
          file,
          ProgressStepType.Prepare,
          ProgressStepStatus.Loading,
        );
        const url = await __getUploadUrl(file, entityId, entityInput);
        updateFileThumbnails(
          file,
          ProgressStepType.Prepare,
          ProgressStepStatus.Complete,
        );
        yield await __uploadFile(file, url, config);
      } catch (error) {
        updateFileThumbnails(
          file,
          ProgressStepType.Upload,
          ProgressStepStatus.Failed,
          [error],
        );

        yield {
          file: file,
          response: {
            ok: false,
            text: () => error || "Something went wrong",
          },
        };
      }
    }
  }

  const validateFiles = () => {
    if (!uploadFlowConfiguration.value) return false;
    return uploadFlowConfiguration.value.validateFiles();
  };

  const removeFileToUpload = (
    fileToRemove: DropzoneFile,
    isValidationFile: boolean = false,
  ) => {
    failedUploads.value = failedUploads.value.filter(
      (fileName: string) => fileName !== fileToRemove.name,
    );
    files.value = files.value.filter(
      (file: DropzoneFile) => file !== fileToRemove,
    );
    if (!files.value.length || isValidationFile) {
      resetUpload(true);
    }
    if (!mediafiles.value.length)
      updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Empty,
      );
  };

  const addFileToUpload = async (
    fileToAdd: DropzoneFile,
    isValidationFile: boolean,
  ): Promise<void> => {
    files.value.push(fileToAdd);
    if (!isValidationFile) {
      updateFileThumbnails(
        fileToAdd,
        ProgressStepType.Validate,
        ProgressStepStatus.Complete,
      );
      return;
    }
    await dryRunCsv(fileToAdd);
  };

  const setUploadProgressPercentage = (newPercentage: number): void => {
    uploadProgressPercentage.value = newPercentage;
  };

  const resetUploadDropzone = (): void => {
    useDynamicForm().dynamicFormUploadFields.value.forEach(
      (dropzone: Dropzone) => {
        dropzone.removeAllFiles();
      },
    );
  };

  const pauseUpload = () => {
    if (uploadFlow.value !== UploadFlow.MediafilesOnly)
      throw Error(
        "Pausing an upload is only allowed in 'mediafilesOnly' flows",
      );
    if (currentUploadAbortController.value)
      currentUploadAbortController.value.abort();
    updateGlobalUploadProgress(
      ProgressStepType.Upload,
      ProgressStepStatus.Paused,
    );
    uploadStatus.value = UploadStatus.Paused;
    setDeleteFileButtonVisibility("visible");
  };

  const resumeUpload = () => {
    if (uploadStatus.value !== UploadStatus.Paused)
      throw Error("Unable to resume an upload that has not been paused");
    currentUploadAbortController.value = undefined;
    setDeleteFileButtonVisibility("invisible");
    uploadStatus.value = UploadStatus.Uploading;
    __uploadMediafilesWithTicketUrl(true);
  };

  const resetUpload = (isDryRunReset: boolean = false) => {
    if (!isDryRunReset) {
      standaloneFileType.value = undefined;
      uploadStatus.value = UploadStatus.NoUpload;
      files.value = [];
      failedUploads.value = [];
      amountUploaded.value = 0;
      resetUploadDropzone();
      reinitializeDynamicFormFunc.value();
    }
    prefetchedUploadUrls.value = [];
    lastUploadedFileIndex.value = -1;
    dryRunErrors.value = [];
    dryRunComplete.value = false;
    missingFileNames.value = [];
    requiredMediafiles.value = [];
    jobIdentifier.value = undefined;
    resetUploadProgress();
    __resetFileThumbnails();
  };

  const processExtraneousFiles = (requiredFileNames: string[]): boolean => {
    let areAllFilesPresent = true;
    if (!dryRunComplete.value) return false;
    if (uploadFlow.value === UploadFlow.MediafilesWithOcr)
      requiredFileNames.push(...useOcrUpload().optionalFileNames.value);

    mediafiles.value.forEach((file: DropzoneFile) => {
      if (!requiredFileNames.includes(file.name)) {
        areAllFilesPresent = false;
        updateFileThumbnails(
          file,
          ProgressStepType.Validate,
          ProgressStepStatus.Failed,
          [`${file.name} is not in CSV`],
        );
      }
    });
    return areAllFilesPresent;
  };

  const verifyAllNeededFilesArePresent = (): boolean => {
    try {
      missingFileNames.value = [];

      if (
        uploadFlow.value === UploadFlow.MediafilesOnly ||
        uploadFlow.value === UploadFlow.OptionalMediafiles ||
        (uploadFlow.value === UploadFlow.XmlMarc && containsXml.value) ||
        (uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv &&
          !containsCsv.value)
      ) {
        return true;
      }

      if (!containsCsv.value && !dryRunComplete.value) return false;

      const requiredFileNames: string[] = [...requiredMediafiles.value];
      let areAllFilesPresent: boolean = true;

      updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Loading,
      );

      requiredFileNames.forEach((requiredFileName: string) => {
        const file: DropzoneFile | undefined = mediafiles.value.find(
          (file: DropzoneFile) => file.name === requiredFileName,
        );
        if (!file) {
          areAllFilesPresent = false;
          missingFileNames.value.push(requiredFileName);
        }
      });

      areAllFilesPresent = processExtraneousFiles(requiredFileNames);

      updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        areAllFilesPresent
          ? ProgressStepStatus.Complete
          : ProgressStepStatus.Incomplete,
      );

      if (
        (uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv ||
          uploadFlow.value === UploadFlow.MediafilesWithOcr) &&
        mediafiles.value.length <= 0
      ) {
        updateGlobalUploadProgress(
          ProgressStepType.Prepare,
          ProgressStepStatus.Failed,
        );
        return false;
      }

      return areAllFilesPresent;
    } catch {
      updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Failed,
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

  const updateGlobalUploadProgress = (
    stepType: ProgressStepType,
    status: ProgressStepStatus,
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

  const __resetFileThumbnails = () => {
    mediafiles.value.forEach((mediafile: DropzoneFile) => {
      __setAllProgressStepsToStatus(mediafile, ProgressStepStatus.Empty);
    });
  };

  const __setAllProgressStepsToStatus = (
    file: DropzoneFile,
    progressStepStatus: ProgressStepStatus,
  ) => {
    Object.values(ProgressStepType).forEach(
      (progressStepType: ProgressStepType) => {
        updateFileThumbnails(file, progressStepType, progressStepStatus);
      },
    );
  };

  const updateFileThumbnails = (
    file: DropzoneFile,
    stepType: ProgressStepType,
    status: ProgressStepStatus,
    errors: string[] = [],
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

    if (status !== ProgressStepStatus.Failed && !errors.length) return;
    __handleFileThumbnailError(file, errors);
  };

  const __handleFileThumbnailError = (
    file: DropzoneFile,
    errors: string[],
  ): void => {
    const filePreview: HTMLElement = file.previewTemplate;
    if (
      file.type !== "text/csv" &&
      file.type !== "application/vnd.ms-excel" &&
      !failedUploads.value.includes(file.name)
    )
      failedUploads.value.push(file.name);

    const errorContainer: Element | null = filePreview
      .getElementsByClassName("error-message-container")
      .item(0);
    if (!errorContainer || !errors) return;

    errorContainer.innerHTML = "";
    if (errors.length <= 0) {
      filePreview.classList.remove("border-2", "border-red-default");
      errorContainer.classList.add("hidden");
      return;
    }

    const errorList = document.createElement("ul");
    errorList.classList.add("list-disc");
    errors.forEach((error: string) => {
      const errorNode = document.createElement("li");
      const htmlLinkElement = checkErrorMessageForLinks(error);
      if (htmlLinkElement) {
        errorNode.appendChild(htmlLinkElement);
      } else {
        errorNode.innerHTML = error;
      }
      errorList.appendChild(errorNode);
    });
    errorContainer.appendChild(errorList);

    filePreview.classList.add("border-2", "border-red-default");
    errorContainer.classList.remove("hidden");
  };

  const extractStringBeforeLink = (input: string): string | undefined => {
    const regex = /(.*?)\$LINK\(/;
    const match = input.match(regex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return undefined;
  };

  const extractLinkContent = (error: string): string | undefined => {
    try {
      if (!error) return undefined;
      const linkRegex = /\$LINK\(([^)]+)\)/;
      const match = error.match(linkRegex);

      if (match && match[1]) return match[1];
      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const extractLinkArguments = (
    linkContent: string,
  ): [string, string] | undefined => {
    try {
      const partsRegex = /([^,]+)\s*,\s*([^)]+)/;
      const match = linkContent.match(partsRegex);

      if (match && match[1] && match[2])
        return [match[1].trim(), match[2].trim()];

      return undefined;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const extractEntityId = (entityIdWithName: string): string | undefined => {
    const entityIdregex = /^([^-]+)-/;
    const match = entityIdWithName.match(entityIdregex);

    if (match && match[1]) return match[1];

    return undefined;
  };

  const checkErrorMessageForLinks = (
    error: string,
  ): HTMLAnchorElement | undefined => {
    const linkContent = extractLinkContent(error);
    if (!linkContent) return undefined;

    const [type, entityIdWithName] = extractLinkArguments(linkContent);
    if (!type || !entityIdWithName) return undefined;

    const entityId = extractEntityId(entityIdWithName);
    if (!entityId) return undefined;

    const anchor = document.createElement("a");
    anchor.href = "#";
    anchor.textContent = extractStringBeforeLink(error) || error;
    anchor.classList.add("underline");
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      const routePath = `/${type}/${entityId}`;
      const route = router.resolve({ path: routePath });
      window.open(route.fullPath, "_blank");
    });
    return anchor;
  };

  const setDeleteFileButtonVisibility = (
    visibility: "visible" | "invisible" = "visible",
  ) => {
    const previews = document.querySelectorAll<HTMLDivElement>(
      "[data-dz-file-preview]",
    );
    const uploadedStatuses = ["uploaded", "uploading"];
    const filesThatHaveBeenUploaded = files.value.filter((file: DropzoneFile) =>
      uploadedStatuses.includes(file.status),
    );

    previews.forEach((previewItem) => {
      const previewFilename: string | undefined =
        previewItem.querySelector("[data-dz-name]")?.innerHTML;
      const deleteFileButton = previewItem.querySelector("[data-dz-remove]");
      const hasBeenUploaded: boolean = !!filesThatHaveBeenUploaded.find(
        (file: DropzoneFile) => file.name === previewFilename,
      );

      if (visibility === "invisible") {
        deleteFileButton?.classList.add("hidden");
        return;
      }

      if (!hasBeenUploaded && deleteFileButton) {
        deleteFileButton.classList.remove("hidden");
      }
    });
  };

  const sortFiles = (): void => {
    files.value = files.value.sort((a, b) => {
      if (a.name < b.name) return -1;
      else return 1;
    });
  };

  return {
    pauseUpload,
    resumeUpload,
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
    csvOnlyUploadSFailed,
    verifyAllNeededFilesArePresent,
    updateGlobalUploadProgress,
    dryRunComplete,
    uploadProgress,
    amountUploaded,
    updateFileThumbnails,
    initializeUpload,
    uploadCsvForReordering,
    uploadFlow,
    missingFileNames,
    failedUploads,
    standaloneFileType,
    jobIdentifier,
    reinitializeDynamicFormFunc,
    __getCsvString,
    extraMediafileType,
    __handleFileThumbnailError,
    containsCsv,
    containsXml,
    batchEntities,
    getCsvBlob,
    sortFiles,
    prefetchedUploadUrls,
  };
};

const mapMissingFileNamesToErrors = (): string[] => {
  return missingFileNames.value.map(
    (filename: string) =>
      `${getTranslatedMessage("actions.upload.missing", [filename])}`,
  );
};

watch(
  () => [missingFileNames.value, dryRunErrors.value],
  () => {
    if (!csvFile.value) return;

    const errors = [...dryRunErrors.value, ...mapMissingFileNamesToErrors()];
    useUpload().__handleFileThumbnailError(csvFile.value, errors);
  },
);

watch(
  () => mediafiles.value.length,
  (amountOfFiles: number) => {
    useUpload().verifyAllNeededFilesArePresent();

    if (
      uploadFlow.value !== UploadFlow.MediafilesOnly &&
      uploadFlow.value !== UploadFlow.OptionalMediafiles
    )
      return;

    if (amountOfFiles === 0 && uploadStatus.value !== UploadStatus.NoUpload) {
      uploadStatus.value = UploadStatus.NoUpload;
      amountUploaded.value = 0;
    }
  },
);

watch(
  () => failedUploads.value.length,
  (amountOfFiles: number) => {
    if (
      uploadFlow.value !== UploadFlow.MediafilesOnly &&
      uploadFlow.value !== UploadFlow.OptionalMediafiles
    )
      return;

    const shouldResetGlobalUploadProgress =
      amountOfFiles === 0 &&
      uploadStatus.value === UploadStatus.Finished &&
      mediafiles.value.length !== 0;

    if (shouldResetGlobalUploadProgress) {
      useUpload().updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Complete,
      );
    }
  },
);

watch(
  () => files.value.length,
  (amountOfFiles: number) => {
    if (uploadStatus.value === UploadStatus.Finished) return;

    const containsFiles = !!amountOfFiles;
    useBaseModal().changeCloseConfirmation(
      TypeModals.DynamicForm,
      containsFiles,
    );
  },
  { immediate: true },
);

export default useUpload;
