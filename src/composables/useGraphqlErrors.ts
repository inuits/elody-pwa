import type { ErrorResponse } from "@apollo/client/link/error";
import useDropzoneHelper from "../composables/useDropzoneHelper";
import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import { useRouter } from "vue-router";

const baseGraphQLError = {
  displayTime: 10,
  type: NotificationType.error,
  shown: true,
};

const createErrorNotification = (title: string, description: string) => {
  useNotification().createNotification({
    title,
    description,
    ...baseGraphQLError,
  });
};

const useGraphqlErrors = (_errorResponse: ErrorResponse) => {
  const handleErrorByCode = (errorCode: string) => {
    const { increaseFailedCounter } = useDropzoneHelper();
    switch (errorCode) {
      case "FORBIDDEN":
        createErrorNotification(
          "Forbidden",
          "You don't have access to this page/action"
        );
        useRouter().go(-1);
        break;
      case "DUPLICATE":
        increaseFailedCounter();
        createErrorNotification(
          "Duplicate",
          "Duplicate file detected, upload reverted"
        );
        break;
      default:
        createErrorNotification(
          "Error",
          "Something went wrong, please try again later"
        );
    }
  };

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
          handleErrorByCode(error.extensions.statusCode);
        }
      }
    }
  };

  return {
    checkForUnauthorized,
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
