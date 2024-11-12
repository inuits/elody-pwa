import { useErrorCodes } from "@/composables/useErrorCodes";

export const useGetMediafile = () => {
  const { handleHttpError } = useErrorCodes();

  const fetchFile = async (path: string) => {
    const response = await fetch(path);

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response;
  };

  const getMediafile = async (path: string) => {
    try {
      const response = await fetchFile(path);
      return response;
    } catch (error: any) {
      handleHttpError(error);
    }
  };

  const getMediafilePath = (originalFileLocation?: string) => {
    if (!originalFileLocation) return null;

    return originalFileLocation.replace(
      /.*\/download-with-ticket\//,
      "download-with-ticket/"
    );
  };

  return {
    getMediafile,
    getMediafilePath,
  };
};
