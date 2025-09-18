import useUpload from "@/composables/upload/useUpload";

export const useXmlMarcUpload = (): {
  checkFileValidity: () => boolean;
} => {
  const { containsXml } = useUpload({});

  const checkFileValidity = (): boolean => {
    return containsXml.value;
  };

  return { checkFileValidity };
};
