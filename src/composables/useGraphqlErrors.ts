import type { ErrorResponse } from "@apollo/client/link/error";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import BaseNotification, {
  useNotification,
} from "../components/base/BaseNotification.vue";

const useGraphqlErrors = (_errorResponse: ErrorResponse) => {
  const checkForUnauthorized = () => {
    const gqlErrors = _errorResponse.graphQLErrors;
    let authErrors: Array<Boolean | undefined> = [];
    if (gqlErrors) {
      authErrors = gqlErrors.map((error: any) => {
        if (error.extensions) {
          if (error.extensions?.statusCode === 401) return true;
          if (
            error.extensions?.response &&
            error.extensions?.response.status &&
            error.extensions?.response.status === 401
          )
            return true;
        }
      });
    }
    return authErrors.some((errors) => errors);
  };

  const checkForDuplicateFileUpload = () => {
    let authErrors: Array<Boolean | undefined> = [];
    const gqlErrors = _errorResponse.graphQLErrors;
    if (gqlErrors) {
      authErrors = gqlErrors.map((graphQLError: any) => {
        if (
          graphQLError?.extensions?.response?.status === 409 &&
          graphQLError?.extensions?.response?.body?.includes("Duplicate file")
        ) {
          const { setDropzoneErrorMessages, increaseFailedCounter } =
            useDropzoneHelper();
          setDropzoneErrorMessages(graphQLError.extensions.response.body);
          increaseFailedCounter();
          return true;
        }
      });
    }
    return authErrors.some((errors) => errors);
  };

  const logFormattedErrors = () => {
    const gqlErrors = _errorResponse.graphQLErrors;
    if (gqlErrors) {
      for (const error of gqlErrors) {
        if (error.extensions) {
          console.log(`Graphql error:`);
          console.log(
            `Status:`,
            error.extensions?.statusCode
              ? error.extensions?.statusCode
              : undefined
          );
          console.log(
            `Code:`,
            error.extensions?.code ? error.extensions?.code : undefined
          );
          console.log(`Message:`, error.message);
          console.log(`---`);
          if (error.extensions.statusCode != 401) {
            useNotification().createNotification({
              displayTime: 10,
              title: (error.extensions.code as string) || "Error",
              description: error.message,
              shown: true,
            });
          }
        }
      }
    }
  };

  return {
    checkForDuplicateFileUpload,
    checkForUnauthorized,
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
