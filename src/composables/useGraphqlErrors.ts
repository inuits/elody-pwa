import type { ErrorResponse } from "@apollo/client/link/error";
import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import { useRoute, useRouter } from "vue-router";
import { auth } from "@/main";

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
  const handleErrorByCode = (errorMessage: number) => {
    switch (errorMessage) {
      case 401:
        auth.logout();
        setTimeout(() => {
          auth.redirectToLogin();
        }, 100);
        break;
      case 403:
        createErrorNotification(
          "Forbidden",
          "You don't have access to this page/action"
        );
        useRouter().go(-1);
        break;
      case 409:
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
        break;
    }
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
          handleErrorByCode(
            error.extensions?.statusCode || error.extensions?.status
          );
        }
      }
    }
  };

  return {
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
