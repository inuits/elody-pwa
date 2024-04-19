import useHttpErrors from "@/composables/useHttpErrors";
import { useRouter } from "vue-router";

export const useGetMediafile = () => {
  const { logFormattedErrors, getStatusCodeFromError } = useHttpErrors();
  const router = useRouter();
  const errorCodesToReact = [401, 403];

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
      const errorCode = getStatusCodeFromError(error)
      const shouldLogError = errorCodesToReact.includes(Number(errorCode));
      if (shouldLogError) {
        logFormattedErrors(router, error);
      }
      throw error;
    }
  };

  return {
    getMediafile,
  };
};
