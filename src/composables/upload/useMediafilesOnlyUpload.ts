import useUpload from "@/composables/upload/useUpload";

export const useMediafilesOnlyUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsCsv, mediafiles } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return !!mediafiles.value.length;
  };

  const checkFileValidity = (): boolean => {
    return !containsCsv.value && mediafiles.value.length > 0;
  };

  return { checkFileValidity, checkUploadValidity };
};
