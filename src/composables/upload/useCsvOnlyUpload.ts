import useUpload from "@/composables/upload/useUpload";
import {
  type ActionProgressStep,
  ProgressStepStatus,
  ProgressStepType,
} from "@/generated-types/queries";

export const useCsvOnlyUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsFileOfType, uploadProgress } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return (
      containsFileOfType.value.csv &&
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
    return containsFileOfType.value.csv;
  };

  return { checkFileValidity, checkUploadValidity };
};
