import useUpload from "@/composables/upload/useUpload";
import { computed, ref, type Ref, watch } from "vue";
import type { DropzoneFile } from "dropzone";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";
import { getTranslatedMessage } from "@/helpers";
import { UploadFlow } from "@/__mocks__/queries";

const optionalFileNames = ref<string[]>([]);

export const useOcrUpload = (): {
  checkUploadValidity: () => boolean;
  handleOcrDryRunResult: (mediafilesInDryRun: any[]) => void;
  checkFileValidity: () => boolean;
  optionalFileNames: Ref<string[]>;
} => {
  const {
    requiredMediafiles,
    mediafiles,
    files,
    containsCsv,
    updateGlobalUploadProgress,
    dryRunErrors,
    uploadProgress,
    uploadFlow,
  } = useUpload({});

  const checkUploadValidity = (): boolean => {
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

  const containsOptionalFile = computed<boolean>(() => {
    if (!optionalFileNames.value) return true;
    const fileNamesInDropzone = files.value.map(
      (file: DropzoneFile) => file.name,
    );
    return fileNamesInDropzone.some((filename: string) =>
      optionalFileNames.value.includes(filename),
    );
  });

  const optionalFilesMissingMessage = computed<string>(() =>
    getTranslatedMessage(
      "actions.upload.ocr-optional-missing",
      optionalFileNames.value,
    ),
  );

  const handleOcrDryRunResult = (mediafilesInDryRun: any[]) => {
    const optionalFiles: any[] = mediafilesInDryRun.filter(
      (file: any) =>
        file.filename.includes(".xml") || file.filename.includes(".txt"),
    );
    if (optionalFiles)
      optionalFileNames.value.push(
        ...optionalFiles.map((file: any) => file.filename),
      );
    requiredMediafiles.value.push(
      ...mediafilesInDryRun
        .filter((file: any) => !optionalFiles.includes(file))
        .map((file: any) => file.filename),
    );
  };

  const checkFileValidity = (): boolean => {
    return (
      containsCsv.value &&
      mediafiles.value.length > 0 &&
      containsOptionalFile.value
    );
  };

  watch(
    () => mediafiles.value.length,
    () => {
      if (uploadFlow.value === UploadFlow.MediafilesWithOcr) {
        if (!containsOptionalFile.value) {
          if (!dryRunErrors.value.includes(optionalFilesMissingMessage.value))
            dryRunErrors.value.push(optionalFilesMissingMessage.value);

          updateGlobalUploadProgress(
            ProgressStepType.Prepare,
            ProgressStepStatus.Incomplete,
          );
        } else {
          dryRunErrors.value = dryRunErrors.value.filter(
            (error: string) => error !== optionalFilesMissingMessage.value,
          );
        }
      }
    },
  );

  return {
    handleOcrDryRunResult,
    checkFileValidity,
    optionalFileNames,
    checkUploadValidity,
  };
};
