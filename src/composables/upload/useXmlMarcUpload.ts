import useUpload from "@/composables/upload/useUpload";

export const useXmlMarcUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const { containsFileOfType } = useUpload({});

  const checkUploadValidity = (): boolean => {
    return containsFileOfType.value.xml;
  };

  const checkFileValidity = (): boolean => {
    return containsFileOfType.value.xml;
  };

  return { checkFileValidity, checkUploadValidity };
};
