import { useErrorCodes } from "@/composables/useErrorCodes";

export const useGetMediafile = () => {
  const { handleHttpError } = useErrorCodes();

  const fetchFile = async (path: string, signal?: AbortSignal) => {
    const response = await fetch(path, {
      cache: "force-cache",
      headers: {
        "Cache-Control": "max-age=36000",
      },
      signal,
    });

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response;
  };

  const getMediafile = async (path: string, signal?: AbortSignal) => {
    try {
      const response = await fetchFile(path, signal);
      return response;
    } catch (error: any) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      handleHttpError(error);
    }
  };

  const getMediafilePath = (originalFileLocation?: string) => {
    if (!originalFileLocation) return null;

    return originalFileLocation.replace(
      /.*\/download-with-ticket\//,
      "download-with-ticket/",
    );
  };

  return {
    getMediafile,
    getMediafilePath,
  };
};
