import type { DropzoneFile } from "dropzone";

export type UploadType = "batch" | "single";

const useUpload = () => {
  let _files: DropzoneFile[] = [];
  let _prefetchedUploadUrls: string[] | "not-prefetched-yet" =
    "not-prefetched-yet";
  let _uploadType: UploadType;

  const __batchEntities = async (csv: Blob): Promise<string[]> => {
    const response = await fetch("/api/upload/batch", {
      headers: { "Content-Type": "text/csv" },
      method: "POST",
      body: csv,
    });
    return JSON.parse(await response.text());
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

  const __getCsvBlob = (files: DropzoneFile[]) => {
    const csvFile = files.filter((file) => file.type === "text/csv")[0];
    return new Blob([csvFile], { type: csvFile.type });
  };

  const __getUploadUrl = async (file: DropzoneFile, entityId: string = "") => {
    let uploadUrl: string | undefined = undefined;

    if (_uploadType === "batch") {
      if (_prefetchedUploadUrls === "not-prefetched-yet")
        _prefetchedUploadUrls = await __batchEntities(__getCsvBlob(_files));

      uploadUrl = _prefetchedUploadUrls.find((url: string) =>
        url.includes(file.name)
      );
    } else if (_uploadType === "single") {
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
        url.replace("http://storage-api:5000/", config.api.storageApiUrl),
        {
          method: "POST",
          body: formData,
        }
      ),
      file: file,
    };
  };

  async function* uploadGenerator(
    files: DropzoneFile[],
    uploadType: UploadType,
    config: any,
    entityId: string = ""
  ) {
    if (!validateFiles(files, uploadType)) return;
    _files = files;
    _uploadType = uploadType;

    const filesToUpload = files.filter((file) => file.type !== "text/csv");
    for (const file of filesToUpload) {
      const url = await __getUploadUrl(file, entityId);
      yield __uploadFile(file, url, config);
    }

    _prefetchedUploadUrls = "not-prefetched-yet";
  }

  const validateFiles = (files: DropzoneFile[], uploadType: UploadType) => {
    const csvFilesCount = files.filter(
      (file) => file.type === "text/csv"
    ).length;
    const nonCsvFilesCount = files.filter(
      (file) => file.type !== "text/csv"
    ).length;

    if (uploadType === "batch")
      return csvFilesCount === 1 && nonCsvFilesCount > 0;
    if (uploadType === "single")
      return csvFilesCount === 0 && nonCsvFilesCount > 0;
    return false;
  };

  return { uploadGenerator, validateFiles };
};

export default useUpload;
