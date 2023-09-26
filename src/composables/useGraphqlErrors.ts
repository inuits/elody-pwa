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
  const handleErrorByCode = (errorMessage: string) => {
    console.log(errorMessage, errorMessage.includes("401"));
    if (errorMessage.includes("401")) {
      auth.logout();
      setTimeout(() => {
        auth.redirectToLogin();
      }, 100);
    }
    if (errorMessage.includes("403")) {
      createErrorNotification(
        "Forbidden",
        "You don't have access to this page/action"
      );
      useRouter().go(-1);
    }
    if (errorMessage.includes("409")) {
      createErrorNotification(
        "Duplicate",
        "Duplicate file detected, upload reverted"
      );
    } else {
      createErrorNotification(
        "Error",
        "Something went wrong, please try again later"
      );
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
          handleErrorByCode(error.message as string);
        }
      }
    }
  };

  return {
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
