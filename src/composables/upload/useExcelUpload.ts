import useUpload from "@/composables/upload/useUpload";
import { watch } from "vue";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";

export const useExcelUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const {
    containsExcel,
    uploadProgress,
    mediafiles,
    requiredMediafiles,
    missingFileNames,
    updateGlobalUploadProgress,
  } = useUpload();

  const checkUploadValidity = (): boolean => {
    const noExtraUploadedFiles = mediafiles.value.every(
      (file: { name: string }) => {
        return requiredMediafiles.value.includes(file.name);
      },
    );
    return (
      containsExcel.value &&
      noExtraUploadedFiles &&
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

  const checkFileValidity = (): boolean => {
    return containsExcel.value && missingFileNames.value.length === 0;
  };

  watch(
    () => missingFileNames.value.length,
    () => {
      if (
        missingFileNames.value.length > 0 &&
        requiredMediafiles.value.length > 0
      ) {
        updateGlobalUploadProgress(
          ProgressStepType.Prepare,
          ProgressStepStatus.Failed,
        );
      }
    },
  );

  return { checkFileValidity, checkUploadValidity };
};
