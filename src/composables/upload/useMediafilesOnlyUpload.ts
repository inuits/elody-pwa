import useUpload from "@/composables/upload/useUpload";

export const useMediafilesOnlyUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsFileOfType, mediafiles } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return !!mediafiles.value.length;
  };

  const checkFileValidity = (): boolean => {
    return !containsFileOfType.value.csv && mediafiles.value.length > 0;
  };

  return { checkFileValidity, checkUploadValidity };
};
