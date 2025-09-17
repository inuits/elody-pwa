import useUpload from "@/composables/upload/useUpload";
import { computed, ref, type Ref, watch } from "vue";
import type { DropzoneFile } from "dropzone";
import {
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";
import { getTranslatedMessage } from "@/helpers";

const optionalFileNames = ref<string[]>([]);

export const useOcrUpload = (): {
  handleOcrDryRunResult: (mediafilesInDryRun: any[]) => void;
  checkOcrFileValidity: () => boolean;
  optionalFileNames: Ref<string[]>;
} => {
  const {
    requiredMediafiles,
    mediafiles,
    files,
    containsCsv,
    updateGlobalUploadProgress,
    dryRunErrors,
  } = useUpload({});

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

  const checkOcrFileValidity = (): boolean => {
    return (
      containsCsv.value &&
      mediafiles.value.length > 0 &&
      containsOptionalFile.value
    );
  };

  watch(
    () => mediafiles.value.length,
    () => {
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
    },
  );

  return {
    handleOcrDryRunResult,
    checkOcrFileValidity,
    optionalFileNames,
  };
};
