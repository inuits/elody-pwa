import useUpload from "@/composables/upload/useUpload";

export const useMediafilesWithOptionalCsvUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { mediafiles, missingFileNames, standaloneFileType } = useUpload({});

  const checkUploadValidity = () => {
    return (
      !!mediafiles.value.length &&
      !missingFileNames.value.length &&
      !!standaloneFileType.value
    );
  };

  const checkFileValidity = (): boolean => {
    return mediafiles.value.length > 0;
  };

  return { checkFileValidity, checkUploadValidity };
};
