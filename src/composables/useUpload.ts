import type { DropzoneFile } from "dropzone";
import { ref, watch, computed } from "vue";
import { getEntityIdFromRoute, setCssVariable } from "@/helpers";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { UploadFieldType } from "@/generated-types/queries";

const uploadStatus = ref<"no-upload" | "uploading" | "upload-finished">(
  "no-upload"
);
const dryRunStatus = ref<
  "not-yet-verified" | "loading" | "rejected" | "correctly-verified"
>("not-yet-verified");
const files = ref<DropzoneFile[]>([]);
const mediafiles = computed(
  (): DropzoneFile =>
    files.value.filter((file: DropzoneFile) => file.type !== "text/csv"),
);
const uploadProgressPercentage = ref<number>(0);
const uploadType = ref<UploadFieldType>(UploadFieldType.Batch);
const requiredMediafiles = ref<string[] | undefined>(undefined);
const enableUploadButton = computed(() => {
  if (mediafiles.value.length && uploadType.value === UploadFieldType.Single)
    return true;
  if (!requiredMediafiles.value) return false;
  return (
    dryRunStatus.value === "correctly-verified" &&
    useUpload().verifyAllNeededFilesArePresent()
  );
});

const useUpload = () => {
  let _prefetchedUploadUrls: string[] | "not-prefetched-yet" =
    "not-prefetched-yet";

  const upload = async (isLinkedUpload: boolean, config: any, t: Function) => {
    const totalAmountOfFiles: number = files.value.length;
    let amountUploaded = 0;
    toggleUploadStatus();
    const generator = uploadGenerator(
      config,
      isLinkedUpload ? getEntityIdFromRoute() : "",
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

  const handleDryRunResult = (dryRunResult: any) => {
    try {
      const errorKeys = Object.keys(dryRunResult.errors);
      let containsErrors: boolean = false;
      errorKeys.forEach((key: string) => {
        const errorList = dryRunResult.errors[key];
        if (errorList.length) {
          containsErrors = true;
        }
      });
      if (dryRunResult?.mediafiles.length) {
        requiredMediafiles.value = dryRunResult.mediafiles.map(
          (mediafile: any) => mediafile.filename,
        );
      }
      if (containsErrors) dryRunStatus.value = "rejected";
      else dryRunStatus.value = "correctly-verified";
    } catch {
      dryRunStatus.value = "rejected";
    }
  };

  const dryRunCsv = async () => {
    dryRunStatus.value = "loading";
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

  const __createMediafileForEntity = async (
    entityId: string,
    file: DropzoneFile
  ): Promise<string> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&filename=${file.name}`,
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
        (file: DropzoneFile) => file.type === "text/csv",
      );
      return new Blob([csvFile], { type: csvFile.type });
    } catch (e) {
      throw Error(e);
    }
  };

  const __getUploadUrl = async (file: DropzoneFile, entityId: string = "") => {
    let uploadUrl: string | undefined = undefined;

    if (uploadType.value === UploadFieldType.Batch) {
      if (_prefetchedUploadUrls === "not-prefetched-yet")
        _prefetchedUploadUrls = (await __batchEntities(
          __getCsvBlob(),
        )) as string[];
      uploadUrl = _prefetchedUploadUrls.find((url: string) =>
        url.includes(file.name)
      );
    } else if (uploadType.value === UploadFieldType.Single) {
      uploadUrl = await __createMediafileForEntity(entityId, file);
    }

    if (!uploadUrl) throw new Error("Upload url is undefined.");
    return uploadUrl;
  };

  const __uploadFile = async (file: DropzoneFile, url: string, config: any) => {
    const formData = new FormData();
    formData.append("file", file);
    return {
      response: await fetch(
        url.replace(
          "http://storage-api-digipolis-dams:5000/",
          config.api.storageApiUrl,
        ),
        {
          method: "POST",
          body: formData,
        }
      ),
      file: file,
    };
  };

  async function* uploadGenerator(config: any, entityId: string = "") {
    if (!validateFiles()) return; // TODO: Show feedback to user

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
      (file) => file.type === "text/csv"
    ).length;
    const nonCsvFilesCount = files.value.filter(
      (file) => file.type !== "text/csv"
    ).length;

    if (uploadType.value === "batch")
      return csvFilesCount === 1 && nonCsvFilesCount > 0;
    if (uploadType.value === "single")
      return csvFilesCount === 0 && nonCsvFilesCount > 0;
    return false;
  };

  const removeFileToUpload = (fileToRemove: DropzoneFile) => {
    if (!files.value) return;
    files.value = files.value.filter(
      (file: DropzoneFile) => file !== fileToRemove,
    );
  };
  const addFileToUpload = (fileToAdd: DropzoneFile) => {
    files.value.push(fileToAdd);
  };

  const setUploadProgressPercentage = (newPercentage: number): void => {
    uploadProgressPercentage.value = newPercentage;
  };

  const resetUpload = () => {
    uploadStatus.value = "no-upload";
    dryRunStatus.value = "not-yet-verified";
    files.value = [];
    requiredMediafiles.value = undefined;
    uploadProgressPercentage.value = 0;
    uploadType.value = UploadFieldType.Batch;
  };

  const verifyAllNeededFilesArePresent = (): boolean => {
    const requiredFileNames: string[] = [...requiredMediafiles.value];
    let filesArePreset: boolean = true;
    if (uploadType.value === UploadFieldType.Single) return true;
    if (mediafiles.value.length !== requiredFileNames.length) return false;
    requiredFileNames.forEach((requiredFileName: string) => {
      const fileExists = files.value.some(
        (file: DropzoneFile) => file.name === requiredFileName,
      );
      if (!fileExists) {
        filesArePreset = false;
        return;
      }
    });
    return filesArePreset;
  };

  const calculateProgressPercentage = (
    amountUploaded: number,
    amountToUpload: number
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
    dryRunStatus,
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
  };
};

watch(
  () => uploadProgressPercentage.value,
  () => {
    setCssVariable(
      "--upload-width-percentage",
      uploadProgressPercentage.value.toString() + "%"
    );
  },
  { immediate: true }
);

export default useUpload;
