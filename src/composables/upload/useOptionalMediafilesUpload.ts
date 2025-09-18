export const useOptionalMediafileUpload = (): {
  checkFileValidity: () => boolean;
} => {
  const checkFileValidity = (): boolean => {
    return true;
  };

  return { checkFileValidity };
};
