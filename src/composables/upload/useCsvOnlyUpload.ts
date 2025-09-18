import useUpload from "@/composables/upload/useUpload";

export const useCsvOnlyUpload = (): {
  checkFileValidity: () => boolean;
} => {
  const { containsCsv } = useUpload({});

  const checkFileValidity = (): boolean => {
    return containsCsv.value;
  };

  return { checkFileValidity };
};
