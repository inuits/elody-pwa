import useUpload from "@/composables/upload/useUpload";

export const useCsvReorderingUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsCsv } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return containsCsv.value;
  };

  const checkFileValidity = (): boolean => {
    return true;
  };

  return { checkFileValidity, checkUploadValidity };
};
