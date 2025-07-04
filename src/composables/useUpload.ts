import type Dropzone from "dropzone";
import { type DropzoneFile } from "dropzone";
import { computed, ref, toRaw, watch } from "vue";
import type {
  Entitytyping,
  UploadEntityTypes,
} from "@/generated-types/queries";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
  UploadFieldType,
  UploadFlow,
  TypeModals,
} from "@/generated-types/queries";
import useEntitySingle from "@/composables/useEntitySingle";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { useBaseModal } from "@/composables/useBaseModal";
import { useErrorCodes } from "@/composables/useErrorCodes";

type UploadSettings = {
  uploadType: UploadFieldType;
  uploadFlow: UploadFlow;
  extraMediafileType: string | undefined;
};

export enum UploadStatus {
  NoUpload = "no-upload",
  Uploading = "uploading",
  Finished = "upload-finished",
}

import { router } from "@/main";
const { handleHttpError, getMessageAndCodeFromErrorString } = useErrorCodes();
const uploadStatus = ref<UploadStatus>(UploadStatus.NoUpload);
const uploadProgress = ref<ActionProgressStep[]>([]);
const amountUploaded = ref<number>(0);
const dryRunComplete = ref<boolean>(false);
const dryRunErrors = ref<string[]>([]);
const files = ref<DropzoneFile[]>([]);
const mediafiles = computed((): DropzoneFile[] =>
  files.value.filter(
    (file: DropzoneFile) =>
      file.type !== "text/csv" && file.type !== "application/vnd.ms-excel",
  ),
);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[]>([]);
const containsCsv = computed(
  () =>
    !!files.value.find(
      (file: DropzoneFile) =>
        file.type === "text/csv" || file.type === "application/vnd.ms-excel",
    ),
);
const containsXml = computed(
  () => !!files.value.find((file: DropzoneFile) => file.type === "text/xml"),
);
const uploadFlow = ref<UploadFlow>(UploadFlow.MediafilesOnly);
const uploadValidationFn = ref<Function>(() => {
  return false;
});
const enableUploadButton = computed(() => uploadValidationFn.value());
const missingFileNames = ref<string[]>([]);
const failedUploads = ref<string[]>([]);
const standaloneFileType = ref<UploadEntityTypes | undefined>(undefined);
const reinitializeDynamicFormFunc = ref<Function | undefined>(undefined);
const csvOnlyUploadSFailed = ref<boolean>(false);
const extraMediafileType = ref<string | undefined>(undefined);
const jobIdentifier = ref<string | undefined>(undefined);

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
      updateMetadata: {
        checkUploadValidityFn: () => __checkUploadValidityUpdateMetadata(),
      },
      csvOnly: {
        checkUploadValidityFn: () => __checkUploadValidityCsvOnly(),
      },
      mediafilesOnly: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesOnly(),
      },
      mediafilesWithRequiredCsv: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesWithCsv(),
      },
      mediafilesWithOptionalCsv: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesWithCsv(),
      },
      uploadCsvForReordening: {
        checkUploadValidityFn: () =>
          __checkUploadValidityuploadCsvForReordening(),
      },
      mediafilesWithOcr: {
        checkUploadValidityFn: () => __checkUploadValidityMediafilesWithOcr(),
      },
      optionalMediafiles: {
        checkUploadValidityFn: () => __checkUploadValidityOptionalMediafiles(),
      },
      xmlMarc: {
        checkUploadValidityFn: () => __checkUploadValidityXmlFile(),
      },
    };
    uploadValidationFn.value =
      settingsObject[uploadSettings.uploadFlow].checkUploadValidityFn;

    if (uploadSettings.extraMediafileType)
      extraMediafileType.value = uploadSettings.extraMediafileType;
  };

  const __checkUploadValidityUpdateMetadata = (): boolean => {
    return containsCsv.value;
  };

  const __checkUploadValidityXmlFile = (): boolean => {
    return containsXml.value;
  };

  const __checkUploadValidityCsvOnly = (): boolean => {
    return (
      containsCsv.value &&
      uploadProgress.value
        .filter(
          (progressStep: ActionProgressStep) =>
            progressStep.stepType !== ProgressStepType.Upload,
        )
        .every(
          (progressStep: ActionProgressStep) =>
            progressStep.status === ProgressStepStatus.Complete,
        )
    );
  };

  const __checkUploadValidityMediafilesOnly = (): boolean => {
    return !!mediafiles.value.length;
  };

  const __checkUploadValidityMediafilesWithCsv = (): boolean => {
    if (uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv) {
      return (
        verifyAllNeededFilesArePresent() &&
        containsCsv.value &&
        uploadProgress.value
          .filter(
            (progressStep: ActionProgressStep) =>
              progressStep.stepType !== ProgressStepType.Upload,
          )
          .every(
            (progressStep: ActionProgressStep) =>
              progressStep.status === ProgressStepStatus.Complete,
          )
      );
    }
    return (
      !!mediafiles.value.length &&
      !missingFileNames.value.length &&
      !!standaloneFileType.value
    );
  };

  const __checkUploadValidityuploadCsvForReordening = (): boolean => {
    return containsCsv.value;
  };

  const __checkUploadValidityMediafilesWithOcr = (): boolean => {
    return (
      containsCsv.value &&
      uploadProgress.value
        .filter(
          (progressStep: ActionProgressStep) =>
            progressStep.stepType !== ProgressStepType.Upload,
        )
        .every(
          (progressStep: ActionProgressStep) =>
            progressStep.status === ProgressStepStatus.Complete,
        )
    );
  };

  const __checkUploadValidityOptionalMediafiles = (): boolean => {
    return true;
  };

  const __uploadCsvWithoutMediafiles = async () => {
    try {
      await __batchEntities(__getCsvBlob(), false);
      toggleUploadStatus();
      __updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Complete,
      );
      csvOnlyUploadSFailed.value = false;
    } catch (error: Promise<string>) {
      csvOnlyUploadSFailed.value = true;
      const message = await error;
      __updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      throw Error(message);
    }
  };

  const __uploadMediafilesWithTicketUrl = async (
    isLinkedUpload: boolean,
    config: any,
    t: Function,
  ) => {
    const generator = uploadGenerator(
      config,
      isLinkedUpload ? useEntitySingle().getEntityUuid() : "",
    );

    const errors = [];

    for await (const upload of generator) {
      if (!upload?.response.ok) {
        __uploadExceptionHandler(upload?.response.text(), upload.file, t);
        errors.push(upload?.response.text());
        continue;
      }
      __updateFileThumbnails(
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
    __updateGlobalUploadProgress(ProgressStepType.Upload, uploadStatus);
    if (errors.length > 0) {
      throw errors.join(", ");
    }
  };

  const upload = async (isLinkedUpload: boolean, config: any, t: Function) => {
    if (!validateFiles()) return;
    __updateGlobalUploadProgress(
      ProgressStepType.Upload,
      ProgressStepStatus.Loading,
    );
    toggleUploadStatus();

    if (uploadFlow.value === UploadFlow.XmlMarc) {
      await __uploadXml();

      [
        ProgressStepType.Prepare,
        ProgressStepType.Validate,
        ProgressStepType.Upload,
      ].forEach((status: ProgressStepType) => {
        __updateGlobalUploadProgress(status, ProgressStepStatus.Complete);
      });

      toggleUploadStatus();
      return;
    }

    if (
      uploadFlow.value === UploadFlow.MediafilesOnly ||
      uploadFlow.value === UploadFlow.OptionalMediafiles
    )
      __updateGlobalUploadProgress(
        ProgressStepType.Prepare,
        ProgressStepStatus.Complete,
      );

    if (uploadFlow.value === UploadFlow.CsvOnly)
      await __uploadCsvWithoutMediafiles();
    else await __uploadMediafilesWithTicketUrl(isLinkedUpload, config, t);
  };

  const uploadCsvForReordering = async (parentId: string) => {
    const response = await fetch(`/api/upload/csv?parentId=${parentId}`, {
      headers: { "Content-Type": "text/csv" },
      method: "POST",
      body: __getCsvBlob(),
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
    t: Function,
  ) => {
    if (!errorDescription)
      errorDescription = t("dropzone.errorNotification.description") as string;
    __updateFileThumbnails(
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
      if (dryRunResult?.mediafiles?.length) {
        requiredMediafiles.value = dryRunResult.mediafiles.map(
          (mediafile: any) => mediafile.filename,
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
        dryRunErrors.value || [],
      );
      if (
        dryRunStatus === ProgressStepStatus.Complete &&
        mediafiles.value.length
      )
        mediafiles.value.forEach((mediafile: DropzoneFile) => {
          __updateFileThumbnails(
            mediafile,
            ProgressStepType.Validate,
            ProgressStepStatus.Complete,
          );
        });
      verifyAllNeededFilesArePresent();
    } catch {
      dryRunErrors.value.push("upload-fields.errors.dry-run-failed");
      __updateGlobalUploadProgress(
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
      __updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
    }
  };

  const dryRunCsv = async (file: DropzoneFile) => {
    __updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Loading,
    );
    __updateFileThumbnails(
      file,
      ProgressStepType.Validate,
      ProgressStepStatus.Loading,
    );
    let dryRunResult;
    try {
      dryRunResult = await __batchEntities(__getCsvBlob(), true);
      await handleDryRunResult(dryRunResult, file);
    } catch (error: Promise<string>) {
      const message = await error;
      dryRunErrors.value.push(message);
      __updateGlobalUploadProgress(
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
      );
      __updateFileThumbnails(
        file,
        ProgressStepType.Validate,
        ProgressStepStatus.Failed,
        [message],
      );
    }
  };

  const __batchEntities = async (
    csv: Blob,
    isDryRun: boolean = false,
  ): Promise<string[] | number> => {
    const response = await fetch(
      `/api/upload/batch?${isDryRun ? "dry_run=true" : ""}${extraMediafileType.value ? `&extra_mediafile_type=${extraMediafileType.value}` : ""}${jobIdentifier.value ? `&main_job_id=${jobIdentifier.value}` : ""}`,
      {
        headers: { "Content-Type": "text/csv" },
        method: "POST",
        body: csv,
      },
    );
    if (!response.ok) {
      const httpErrorMessage = handleHttpError(response);
      __updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      toggleUploadStatus();
      return Promise.reject(httpErrorMessage);
    }

    const parsedResult = JSON.parse(await response.text());
    if (parsedResult.parent_job_id)
      jobIdentifier.value = parsedResult.parent_job_id;

    if (isDryRun) return parsedResult;
    else return parsedResult.links;
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

  const __getUploadUrlForStandaloneMediafile = async (
    file: DropzoneFile,
    type?: Entitytyping,
  ) => {
    const response = await fetch(
      `/api/upload/single?filename=${file.name}${type ? "&type=" + type : ""}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    if (!response.ok) {
      const httpErrorMessage = handleHttpError(response);
      return Promise.reject(httpErrorMessage);
    }

    return JSON.parse(await response.text());
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

  const __getUploadUrlForMediafileOnEntity = async (
    entityId: string,
    file: DropzoneFile,
  ): Promise<string> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&hasRelation=true&filename=${encodeURIComponent(
        file.name,
      )}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );

    if (!response.ok) {
      const httpErrorMessage = await handleHttpError(response);
      __updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        [httpErrorMessage],
      );
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

  const __getCsvBlob = () => {
    try {
      const csvFile = __getCsvFile();
      return new Blob([csvFile], { type: csvFile.type });
    } catch (e: any) {
      throw Error(e);
    }
  };

  const __getUploadUrl = async (file: DropzoneFile, entityId: string = "") => {
    let uploadUrl: string | undefined = undefined;

    if (
      uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithOcr
    ) {
      if (containsCsv.value) {
        if (_prefetchedUploadUrls === "not-prefetched-yet")
          _prefetchedUploadUrls = (await __batchEntities(
            __getCsvBlob(),
            false,
          )) as string[];
        uploadUrl = _prefetchedUploadUrls.find((url: string) =>
          decodeURIComponent(url).includes(file.name),
        );
      } else {
        uploadUrl = await __getUploadUrlForStandaloneMediafile(
          file,
          standaloneFileType.value as UploadEntityTypes,
        );
      }
    }
    if (
      uploadFlow.value === UploadFlow.MediafilesOnly ||
      uploadFlow.value === UploadFlow.OptionalMediafiles
    ) {
      uploadUrl = await __getUploadUrlForMediafileOnEntity(entityId, file);
    }

    if (uploadFlow.value === UploadFlow.XmlMarc) {
      uploadUrl = "url";
    }

    if (!uploadUrl) throw new Error("Upload url is undefined.");
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
      __updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        ["Something went wrong during upload"],
      );
      __updateGlobalUploadProgress(
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
      );
      throw Error(e);
    }
  };

  const __uploadFile = async (file: DropzoneFile, url: string, config: any) => {
    __updateFileThumbnails(
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
    const response = await fetch(extUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const httpErrorMessage = (
        await getMessageAndCodeFromErrorString(await response.text())
      ).message;
      __updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        [httpErrorMessage],
      );
      return Promise.reject(httpErrorMessage);
    }

    return {
      response,
      file: file,
    };
  };

  async function* uploadGenerator(config: any, entityId: string = "") {
    __updateGlobalUploadProgress(
      ProgressStepType.Validate,
      ProgressStepStatus.Complete,
    );
    __updateGlobalUploadProgress(
      ProgressStepType.Prepare,
      ProgressStepStatus.Complete,
    );

    const filesToUpload = mediafiles.value;
    for (const file of filesToUpload) {
      __updateFileThumbnails(
        file,
        ProgressStepType.Prepare,
        ProgressStepStatus.Loading,
      );
      try {
        const url = await __getUploadUrl(file, entityId);
        __updateFileThumbnails(
          file,
          ProgressStepType.Prepare,
          ProgressStepStatus.Complete,
        );
        yield await __uploadFile(file, url, config);
      } catch (error) {
        __updateFileThumbnails(
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
    _prefetchedUploadUrls = "not-prefetched-yet";
  }

  const validateFiles = () => {
    if (uploadFlow.value === UploadFlow.CsvOnly) return containsCsv.value;
    if (uploadFlow.value === UploadFlow.XmlMarc) return containsXml.value;

    if (
      uploadFlow.value === UploadFlow.MediafilesWithOptionalCsv ||
      uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv
    ) {
      if (uploadFlow.value === UploadFlow.MediafilesWithRequiredCsv)
        return containsCsv.value && verifyAllNeededFilesArePresent();
      else return mediafiles.value.length > 0;
    }

    if (uploadFlow.value === UploadFlow.OptionalMediafiles) return true;

    if (uploadFlow.value === UploadFlow.MediafilesOnly)
      return !containsCsv.value && mediafiles.value.length > 0;

    if (uploadFlow.value === UploadFlow.MediafilesWithOcr)
      return containsCsv.value && mediafiles.value.length > 0;
    return false;
  };

  const removeFileToUpload = (
    fileToRemove: DropzoneFile,
    isValidationFile: boolean = false,
  ) => {
    failedUploads.value = failedUploads.value.filter(
      (fileName: String) => fileName !== fileToRemove.name,
    );
    files.value = files.value.filter(
      (file: DropzoneFile) => file !== fileToRemove,
    );
    if (!files.value.length || isValidationFile) {
      resetUpload(true);
    }
    if (!mediafiles.value.length)
      __updateGlobalUploadProgress(
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
      __updateFileThumbnails(
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

  const resetUpload = (isDryRunReset: boolean = false) => {
    if (!isDryRunReset) {
      standaloneFileType.value = undefined;
      uploadStatus.value = UploadStatus.NoUpload;
      files.value = [];
      failedUploads.value = [];
      amountUploaded.value = 0;
      resetUploadDropzone();
      if (reinitializeDynamicFormFunc.value)
        reinitializeDynamicFormFunc.value();
    }
    dryRunErrors.value = [];
    dryRunComplete.value = false;
    missingFileNames.value = [];
    requiredMediafiles.value = [];
    jobIdentifier.value = undefined;
    resetUploadProgress();
    __resetFileThumbnails();
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

      __updateGlobalUploadProgress(
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

      mediafiles.value.forEach((file: DropzoneFile) => {
        if (!requiredFileNames.includes(file.name) && dryRunComplete.value) {
          areAllFilesPresent = false;
          __updateFileThumbnails(
            file,
            ProgressStepType.Validate,
            ProgressStepStatus.Failed,
            [`${file.name} is not in CSV`],
          );
        }
      });

      __updateGlobalUploadProgress(
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
        __updateGlobalUploadProgress(
          ProgressStepType.Prepare,
          ProgressStepStatus.Failed,
        );
        return false;
      }

      return areAllFilesPresent;
    } catch {
      __updateGlobalUploadProgress(
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

  const __updateGlobalUploadProgress = (
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
        __updateFileThumbnails(file, progressStepType, progressStepStatus);
      },
    );
  };

  const __updateFileThumbnails = (
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
    if (!failedUploads.value.includes(file.name))
      failedUploads.value.push(file.name);

    filePreview.classList.add("border-2", "border-red-default");
    const errorContainer: Element | null = filePreview
      .getElementsByClassName("error-message-container")
      .item(0);

    if (!errorContainer || !errors) return;
    errorContainer.innerHTML = "";
    const errorList = document.createElement("ul");
    errorList.classList.add("list-disc");
    errorContainer.appendChild(errorList);
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
    const linkRegex = /\$LINK\(([^)]+)\)/;
    const match = error.match(linkRegex);

    if (match && match[1]) return match[1];

    return undefined;
  };

  const extractLinkArguments = (
    linkContent: string,
  ): [string, string] | undefined => {
    const partsRegex = /([^,]+)\s*,\s*([^)]+)/;
    const match = linkContent.match(partsRegex);

    if (match && match[1] && match[2])
      return [match[1].trim(), match[2].trim()];

    return undefined;
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
    csvOnlyUploadSFailed,
    verifyAllNeededFilesArePresent,
    __updateGlobalUploadProgress,
    dryRunComplete,
    uploadProgress,
    amountUploaded,
    __updateFileThumbnails,
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
  };
};

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
      useUpload().__updateGlobalUploadProgress(
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
