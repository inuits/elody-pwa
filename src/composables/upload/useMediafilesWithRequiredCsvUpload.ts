import useUpload from "@/composables/upload/useUpload";

export const useMediafilesWithRequiredCsvUpload = (): {
  checkFileValidity: () => boolean;
} => {
  const { mediafiles } = useUpload({});

  const checkFileValidity = (): boolean => {
    return mediafiles.value.length > 0;
  };

  return { checkFileValidity };
};
