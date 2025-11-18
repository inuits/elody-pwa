import { useErrorCodes } from "@/composables/useErrorCodes";

export enum CacheStrategy {
  "noCache" = "no-cache",
  "forceCache" = "force-cache",
}

export const useGetMediafile = () => {
  const { handleHttpError } = useErrorCodes();

  const fetchFile = async (
    path: string,
    signal?: AbortSignal,
    cacheStrategy: CacheStrategy = CacheStrategy.forceCache,
  ) => {
    const response = await fetch(path, {
      cache: cacheStrategy,
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

  const getMediafile = async (
    path: string,
    signal?: AbortSignal,
    cacheStrategy: CacheStrategy = CacheStrategy.forceCache,
  ) => {
    try {
      const response = await fetchFile(path, signal, cacheStrategy);
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
