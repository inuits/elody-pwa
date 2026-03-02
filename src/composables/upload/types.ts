import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

export type UploadSettings = {
  uploadType: UploadFieldType;
  uploadFlow: UploadFlow;
  extraMediafileType: string | undefined;
  shouldIncludeTypeInUrl: boolean;
  typeToIncludeInUrl: string;
};

export enum UploadStatus {
  NoUpload = "no-upload",
  Paused = "paused",
  Uploading = "uploading",
  Finished = "upload-finished",
}
