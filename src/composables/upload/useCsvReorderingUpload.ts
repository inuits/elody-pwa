import useUpload from "@/composables/upload/useUpload";

export const useCsvReorderingUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsFileOfType } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return containsFileOfType.value.csv;
  };

  const checkFileValidity = (): boolean => {
    return true;
  };

  return { checkFileValidity, checkUploadValidity };
};
