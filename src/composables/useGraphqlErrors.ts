import type { ErrorResponse } from "@apollo/client/link/error";
import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import { useRouter } from "vue-router";
import { auth } from "@/main";
import type { GraphQLError } from "graphql/error";

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

  const getStatusCodeFromError = (error: GraphQLError): number => {
    if (error.extensions?.statusCode)
      return error.extensions.statusCode as number;
    if (error.extensions?.status) return error.extensions.status as number;
    if (error.message) return parseInt(error.message.split(":")[0]);
    return 0;
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
          const statusCode = getStatusCodeFromError(error);
          handleErrorByCode(statusCode);
        }
      }
    }
  };

  return {
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
