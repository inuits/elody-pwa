import useUpload from "@/composables/upload/useUpload";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";

export const useMediafilesWithRequiredCsvUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const {
    mediafiles,
    verifyAllNeededFilesArePresent,
    containsCsv,
    uploadProgress,
  } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return (
      verifyAllNeededFilesArePresent() &&
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

  const checkFileValidity = (): boolean => {
    return mediafiles.value.length > 0;
  };

  return { checkFileValidity, checkUploadValidity };
};
