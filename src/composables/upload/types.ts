import { UploadFieldType, UploadFlow } from "@/generated-types/queries";

export type UploadSettings = {
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
