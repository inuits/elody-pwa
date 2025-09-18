import useUpload from "@/composables/upload/useUpload";

export const useMediafilesOnlyUpload = (): {
  checkFileValidity: () => boolean;
} => {
  const { containsCsv, mediafiles } = useUpload({});

  const checkFileValidity = (): boolean => {
    return !containsCsv.value && mediafiles.value.length > 0;
  };

  return { checkFileValidity };
};
