import useUpload from "@/composables/upload/useUpload";
import type { DropzoneFile } from "dropzone";
import {
  type EntityInput,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";
import { useErrorCodes } from "@/composables/useErrorCodes";

export const useSharedUploadLogic = (): {
  getUploadUrl: (file: DropzoneFile) => Promise<string>;
  getUploadUrlForMediafileOnEntity: (
    entityId: string,
    file: DropzoneFile,
    entityInput: EntityInput | undefined,
  ) => Promise<string>;
} => {
  const {
    containsCsv,
    getCsvBlob,
    batchEntities,
    getUploadUrlForStandaloneMediafile,
    standaloneFileType,
    updateFileThumbnails,
  } = useUpload({});
  const { handleHttpError } = useErrorCodes();

  const getUploadUrl = async (file: DropzoneFile): Promise<string> => {
    if (!containsCsv.value) return await _getUploadUrlBatch(file);
    return _getUploadUrlStandalone(file);
  };

  const _getUploadUrlBatch = async (file: DropzoneFile): Promise<string> => {
    let prefetchedUploadUrls: string[] | "not-prefetched-yet" = useUpload(
      {},
    ).prefetchedUploadUrls;
    if (prefetchedUploadUrls === "not-prefetched-yet")
      prefetchedUploadUrls = (await batchEntities(
        getCsvBlob(),
        false,
      )) as string[];
    const fileUploadUrl = prefetchedUploadUrls.find((url: string) =>
      decodeURIComponent(url).includes(file.name),
    );
    if (!fileUploadUrl)
      throw Error(`Could not find uploadUrl for ${file.name}`);
    return fileUploadUrl;
  };

  const _getUploadUrlStandalone = async (file: DropzoneFile) => {
    return await getUploadUrlForStandaloneMediafile(
      file,
      standaloneFileType.value,
    );
  };

  const getUploadUrlForMediafileOnEntity = async (
    entityId: string,
    file: DropzoneFile,
    entityInput: EntityInput | undefined = undefined,
  ): Promise<string> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&hasRelation=true&filename=${encodeURIComponent(
        file.name,
      )}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ entityInput }),
      },
    );

    if (!response.ok) {
      const httpErrorMessage = await handleHttpError(response);
      updateFileThumbnails(
        file,
        ProgressStepType.Upload,
        ProgressStepStatus.Failed,
        [httpErrorMessage],
      );
      return Promise.reject(httpErrorMessage);
    }
    return JSON.parse(await response.text());
  };

  return { getUploadUrl, getUploadUrlForMediafileOnEntity };
};
