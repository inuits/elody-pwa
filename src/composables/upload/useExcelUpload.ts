import useUpload from "@/composables/upload/useUpload";
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
    verifyAllNeededFilesArePresent,
  } = useUpload({});

  const checkUploadValidity = (): boolean => {
    const noExtraUploadedFiles = mediafiles.value.every(
      (file: { name: string }) => {
        return requiredMediafiles.value.includes(file.name);
      },
    );
    return (
      containsExcel.value &&
      noExtraUploadedFiles &&
      verifyAllNeededFilesArePresent() &&
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
    return containsExcel.value;
  };

  return { checkFileValidity, checkUploadValidity };
};
