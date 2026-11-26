import useUpload from "@/composables/upload/useUpload";
import type { DropzoneFile } from "dropzone";
import {
  type EntityInput,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";
import { useErrorCodes } from "@/composables/useErrorCodes";
import { useImport } from "@/composables/useImport";
import { DuplicateMediafileError } from "@/composables/upload/types";

export const useSharedUploadLogic = (): {
  getUploadUrl: (file: DropzoneFile) => Promise<string>;
  getUploadUrlForMediafileOnEntity: (
    entityId: string,
    file: DropzoneFile,
    entityInput: EntityInput | undefined,
  ) => Promise<string>;
} => {
  const { prefetchedUploadUrls, batchUploadError } = useUpload({});
  const {
    containsFileOfType,
    getCsvBlob,
    getExcelFile,
    batchEntities,
    standaloneFileType,
    updateFileThumbnails,
  } = useUpload({});
  const { handleHttpError } = useErrorCodes();

  const getUploadUrl = async (file: DropzoneFile): Promise<string> => {
    if (containsFileOfType.value.csv || containsFileOfType.value.excel)
      return await _getUploadUrlBatch(file);
    return _getUploadUrlStandalone(file);
  };

  const _getUploadUrlBatch = async (file: DropzoneFile): Promise<string> => {
    // A failed import has no upload links; don't send the CSV again per file
    if (batchUploadError.value) throw batchUploadError.value;
    if (!prefetchedUploadUrls.value.length) {
      const file = containsFileOfType.value.excel
        ? getExcelFile()
        : getCsvBlob();
      const result = await batchEntities(file, false);
      const links = (result as { links?: string[] })?.links;
      if (!Array.isArray(links)) {
        batchUploadError.value = __getBatchErrorMessage(result);
        throw batchUploadError.value;
      }
      prefetchedUploadUrls.value = links;
    }

    const fileUploadUrl = prefetchedUploadUrls.value.find((url: string) =>
      decodeURIComponent(url).includes(file.name),
    );
    if (!fileUploadUrl)
      throw Error(`Could not find uploadUrl for ${file.name}`);
    return fileUploadUrl;
  };

  // The import's own errors, e.g. "2) keyword 'haven' does not exist"
  const __getBatchErrorMessage = (result: unknown): string => {
    const body = result as {
      errors?: { entities?: unknown[]; mediafiles?: unknown[] };
      message?: unknown;
    };
    const messages = [
      ...(body?.errors?.entities ?? []),
      ...(body?.errors?.mediafiles ?? []),
      ...(body?.message ? [body.message] : []),
    ]
      .map((message) => String(message).trim())
      .filter(Boolean);
    return messages.length ? messages.join("\n") : "Something went wrong";
  };

  const _getUploadUrlStandalone = async (file: DropzoneFile) => {
    const response = await fetch(
      `/api/upload/single?filename=${file.name}${standaloneFileType.value ? "&type=" + standaloneFileType.value : ""}`,
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

  // Clients that use the filename as identifier reject a second upload of it when creating the mediafile
  const __getDuplicateIdentifier = async (
    response: Response,
  ): Promise<string | undefined> => {
    try {
      const body = await response.json();
      const errorBody = body?.extensions?.response?.body;
      const message: string = errorBody?.message ?? errorBody ?? "";
      return String(message).match(
        /\bW2004\b.*duplicate_keys:(.+?)(?:, | - )/,
      )?.[1];
    } catch {
      return undefined;
    }
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
      const existingId = await __getDuplicateIdentifier(response.clone());
      if (
        existingId &&
        (await useImport().loadDocument("LinkMediafileToEntity"))
      )
        throw new DuplicateMediafileError(existingId);
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

  const createMediafileOnEntityWithoutFile = async (
    entityId: string,
    entityInput: EntityInput | undefined = undefined,
  ): Promise<void> => {
    const response = await fetch(
      `/api/upload/single?entityId=${entityId}&hasRelation=true`,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ entityInput }),
      },
    );

    if (!response.ok) {
      const httpErrorMessage = await handleHttpError(response);
      return Promise.reject(httpErrorMessage);
    }
    // ponytail: the response body is not needed and is empty when no upload ticket is
    // generated, so it is deliberately not parsed.
  };

  return {
    getUploadUrl,
    getUploadUrlForMediafileOnEntity,
    createMediafileOnEntityWithoutFile,
  };
};
