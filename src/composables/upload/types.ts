import type { DropzoneFile } from "dropzone";
import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

export type UploadSettings = {
  uploadType: UploadFieldType;
  uploadFlow: UploadFlow;
  extraMediafileType: string | undefined;
  shouldIncludeTypeInUrl: boolean;
  typeToIncludeInUrl: string;
};

export type DuplicateMediafile = {
  file: DropzoneFile;
  existingId: string;
  existingName: string;
  link: boolean;
};

export class DuplicateMediafileError extends Error {
  constructor(public existingId: string) {
    super(`Duplicate of mediafile ${existingId}`);
  }
}

export enum UploadStatus {
  NoUpload = "no-upload",
  Paused = "paused",
  Uploading = "uploading",
  Finished = "upload-finished",
}
