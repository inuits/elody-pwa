import type { DropzoneFile } from "dropzone";
import { computed, ref, watch } from "vue";
import { setCssVariable } from "@/helpers";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { TypeModals, UploadFieldType } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import useEntitySingle from "@/composables/useEntitySingle";

type FileError = {
  filename: string;
  error: "missing" | "extraneous";
};

const uploadStatus = ref<"no-upload" | "uploading" | "upload-finished">(
  "no-upload",
);
const dryRunComplete = ref<boolean>(false);
const dryRunErrors = ref<string[]>([]);
const files = ref<DropzoneFile[]>([]);
const mediafiles = computed(
  (): DropzoneFile =>
    files.value.filter((file: DropzoneFile) => file.type !== "text/csv"),
);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[] | undefined>(undefined);
const fileErrors = ref<FileError[]>([]);
const isCsvRequired = ref<boolean>(false);
const enableUploadButton = computed(() => {
  if (mediafiles.value.length && uploadType.value === UploadFieldType.Single)
    return true;
  if (!isCsvRequired.value && mediafiles.value.length) return true;
  if (!requiredMediafiles.value) return false;
  return (
    !dryRunErrors.value.length &&
    !fileErrors.value.length &&
    mediafiles.value.length
  );
});

const useUpload = () => {
  let _prefetchedUploadUrls: string[] | "not-prefetched-yet" =
    "not-prefetched-yet";

  const upload = async (isLinkedUpload: boolean, config: any, t: Function) => {
    const modalToClose: TypeModals = isLinkedUpload
      ? TypeModals.EntityPicker
      : TypeModals.DynamicForm;
    const totalAmountOfFiles: number = files.value.length;
    let amountUploaded = 0;
    toggleUploadStatus();
    const generator = uploadGenerator(
      config,
      isLinkedUpload ? useEntitySingle().getEntityUuid() : "",
    );

    for await (const upload of generator) {
      if (!upload?.response.ok) {
        __uploadExceptionHandler(await upload?.response.text(), t);
        continue;
      }

      setUploadProgressPercentage(
        calculateProgressPercentage(amountUploaded + 1, totalAmountOfFiles),
      );
      amountUploaded++;
    }
    toggleUploadStatus();
    useBaseModal().closeModal(modalToClose);
  };

  const __uploadExceptionHandler = (
    errorDescription: string | undefined,
    t: Function,
  ) => {
    if (!errorDescription)
      errorDescription = t("dropzone.errorNotification.description");
    useNotification().createNotificationOverwrite(
      NotificationType.error,
      t("dropzone.errorNotification.title"),
      errorDescription,
      15,
    );
  };

  const handleDryRunResult = (dryRunResult: any): void => {
    try {
      if (dryRunResult.message) {
        dryRunErrors.value.push(dryRunResult.message);
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
          (mediafile: any) => mediafile.filename,
        );
      }
      dryRunErrors.value = errors;
      dryRunComplete.value = true;
    } catch {
      dryRunErrors.value.push("upload-fields.errors.dry-run-failed");
    }
  };

  const dryRunCsv = async () => {
    const dryRunResult = await __batchEntities(__getCsvBlob(), true);
    handleDryRunResult(dryRunResult);
  };

  const __batchEntities = async (
    csv: Blob,
    isDryRun: boolean = false,
  ): Promise<string[] | number> => {
    const response = await fetch(
      `/api/upload/batch${isDryRun ? "?dry_run=true" : ""}`,
      {
        headers: { "Content-Type": "text/csv" },
        method: "POST",
        body: csv,
      },
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

  const __createStandaloneMediafile = async (file: DropzoneFile) => {
    const response = await fetch(`/api/upload/single?filename=${file.name}`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    return JSON.parse(await response.text());
  };

  const __createMediafileForEntity = async (
    entityId: string,
    file: DropzoneFile,
  ): Promise<string> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&filename=${file.name}&hasRelation=true`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
    return JSON.parse(await response.text());
  };

  const __getCsvBlob = () => {
    try {
      const csvFile = files.value.find(
        (file: DropzoneFile) => file.type === "text/csv",
      );
      return new Blob([csvFile], { type: csvFile.type });
    } catch (e) {
      throw Error(e);
    }
  };

  const __getUploadUrl = async (file: DropzoneFile, entityId: string = "") => {
    let uploadUrl: string | undefined = undefined;

    if (uploadType.value === UploadFieldType.Batch && isCsvRequired.value) {
      if (_prefetchedUploadUrls === "not-prefetched-yet")
        _prefetchedUploadUrls = (await __batchEntities(
          __getCsvBlob(),
        )) as string[];
      uploadUrl = _prefetchedUploadUrls.find((url: string) =>
        url.includes(file.name),
      );
    } else if (
      uploadType.value === UploadFieldType.Batch &&
      !isCsvRequired.value
    ) {
      uploadUrl = await __createStandaloneMediafile(file);
    } else if (uploadType.value === UploadFieldType.Single) {
      uploadUrl = await __createMediafileForEntity(entityId, file);
    }

    if (!uploadUrl) throw new Error("Upload url is undefined.");
    return uploadUrl;
  };

  const __constructExternalUrlForUpload = (
    url: string,
    storageApiUrl: string,
  ): string => {
    const urlObject = new URL(url);
    const origin = new URL(storageApiUrl).origin;
    return origin + urlObject.pathname + "?" + urlObject.searchParams;
  };

  const __uploadFile = async (file: DropzoneFile, url: string, config: any) => {
    const formData = new FormData();
    formData.append("file", file);
    const extUrl = __constructExternalUrlForUpload(
      url,
      config.api.storageApiUrl,
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
    if (!validateFiles()) return;

    const filesToUpload = files.value.filter(
      (file) => file.type !== "text/csv",
    );
    for (const file of filesToUpload) {
      const url = await __getUploadUrl(file, entityId);
      yield __uploadFile(file, url, config);
    }

    _prefetchedUploadUrls = "not-prefetched-yet";
  }

  const validateFiles = () => {
    const csvFilesCount = files.value.filter(
      (file) => file.type === "text/csv",
    ).length;
    const nonCsvFilesCount = files.value.filter(
      (file) => file.type !== "text/csv",
    ).length;

    if (uploadType.value === "batch")
      if (isCsvRequired.value)
        return csvFilesCount === 1 && nonCsvFilesCount > 0;
      else return nonCsvFilesCount > 0;
    if (uploadType.value === "single")
      return csvFilesCount === 0 && nonCsvFilesCount > 0;
    return false;
  };

  const removeFileToUpload = (
    fileToRemove: DropzoneFile,
    isValidationFile: boolean = false,
  ) => {
    files.value = files.value.filter(
      (file: DropzoneFile) => file !== fileToRemove,
    );
    if (isValidationFile) {
      dryRunComplete.value = false;
      dryRunErrors.value = [];
      fileErrors.value = [];
    }
  };
  const addFileToUpload = (fileToAdd: DropzoneFile) => {
    files.value.push(fileToAdd);
  };

  const setUploadProgressPercentage = (newPercentage: number): void => {
    uploadProgressPercentage.value = newPercentage;
  };

  const resetUpload = () => {
    uploadStatus.value = "no-upload";
    dryRunErrors.value = [];
    files.value = [];
    requiredMediafiles.value = undefined;
    uploadProgressPercentage.value = 0;
  };

  const verifyAllNeededFilesArePresent = (): boolean => {
    try {
      fileErrors.value = [];
      const requiredFileNames: string[] = [...requiredMediafiles.value];
      let areAllFilesPresent: boolean = true;

      if (uploadType.value === UploadFieldType.Single) return true;

      requiredFileNames.forEach((requiredFileName: string) => {
        const fileExists = mediafiles.value.some(
          (file: DropzoneFile) => file.name === requiredFileName,
        );
        if (!fileExists) {
          areAllFilesPresent = false;
          fileErrors.value.push({
            filename: requiredFileName,
            error: "missing",
          });
        }
      });

      mediafiles.value.forEach((file: DropzoneFile) => {
        if (!requiredFileNames.includes(file.name)) {
          areAllFilesPresent = false;
          fileErrors.value.push({
            filename: file.name,
            error: "extraneous",
          });
        }
      });
      return areAllFilesPresent;
    } catch {
      return false;
    }
  };

  const calculateProgressPercentage = (
    amountUploaded: number,
    amountToUpload: number,
  ): number => {
    let progress: number = 0;

    if (amountToUpload > 0) {
      progress = (amountUploaded / amountToUpload) * 100;
    }

    return progress;
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
    calculateProgressPercentage,
    setUploadProgressPercentage,
    uploadProgressPercentage,
    files,
    uploadType,
    enableUploadButton,
    mediafiles,
    requiredMediafiles,
    verifyAllNeededFilesArePresent,
    fileErrors,
    dryRunComplete,
    isCsvRequired,
  };
};

watch(
  () => uploadProgressPercentage.value,
  () => {
    setCssVariable(
      "--upload-width-percentage",
      uploadProgressPercentage.value.toString() + "%",
    );
  },
  { immediate: true },
);

watch(
  () => mediafiles.value.length,
  () => {
    useUpload().verifyAllNeededFilesArePresent();
  },
);

export default useUpload;
