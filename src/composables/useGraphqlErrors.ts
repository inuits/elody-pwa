import type { ErrorResponse } from "@apollo/client/link/error";
import type { GraphQLError } from "graphql/error";
import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import { auth } from "@/main";
import { getApplicationDetails, i18n } from "@/helpers";
import { useRouter } from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";

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
  const handleErrorByCode = async (errorMessage: number, message: string) => {
    const { config, translations } = await getApplicationDetails();
    let language = config.customization.applicationLocale;

    const displayPreferences = useStateManagement().getGlobalState(
      "_displayPreferences"
    );
    if (displayPreferences) {
      const preferences = JSON.parse(displayPreferences);
      if (preferences.lang) language = preferences.lang;
    }

    const { t } = i18n(translations, language).global;

    switch (errorMessage) {
      case 401:
        auth.logout();
        setTimeout(() => {
          auth.redirectToLogin();
        }, 100);
        break;
      case 403:
        createErrorNotification(
          t("notifications.graphql-errors.forbidden.title"),
          t("notifications.graphql-errors.forbidden.description")
        );
        useRouter().go(-1);
        break;
      case 409:
        let errorMessage: string =
          "notifications.graphql-errors.duplicate-upload";
        let duplicateKey = "";

        if (_errorResponse.operation.operationName == "createEntity") {
          errorMessage = "notifications.graphql-errors.duplicate-entity";
          const responseBody: string = (
            _errorResponse.graphQLErrors?.[0].extensions.response as any
          )?.body;
          if (responseBody) {
            const key = responseBody.match(/"([^"]*)"/)?.[0];
            if (key) duplicateKey = `: ${key}`;
          }
        }

        createErrorNotification(
          t(`${errorMessage}.title`),
          `${t(`${errorMessage}.description`)}${duplicateKey}`
        );
        break;
      default:
        createErrorNotification("Error", message);
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

  const getMessageFromError = (error: GraphQLError): string => {
    if (error.extensions?.response?.body?.message)
      return error.extensions?.response?.body?.message;
    return "Something went wrong, please try again later";
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
          console.log(`Error:`, error.message);
          console.log(`Message:`, error.extensions?.response?.body?.message);
          console.log(`---`);
          const statusCode = getStatusCodeFromError(error);
          const message = getMessageFromError(error);
          handleErrorByCode(statusCode, message);
        }
      }
    }
  };

  return {
    logFormattedErrors,
  };
};

export default useGraphqlErrors;
