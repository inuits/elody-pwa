export const useOptionalMediafileUpload = (): {
  checkUploadValidity: () => boolean;
  checkFileValidity: () => boolean;
} => {
  const checkUploadValidity = (): boolean => {
    return true;
  };

  const checkFileValidity = (): boolean => {
    return true;
  };

  return { checkFileValidity, checkUploadValidity };
};
