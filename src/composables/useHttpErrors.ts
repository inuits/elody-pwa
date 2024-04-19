import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import { auth } from "@/main";
import { getApplicationDetails, i18n } from "@/helpers";
import { useStateManagement } from "@/composables/useStateManagement";
import type { Router } from "vue-router";

const baseHttpError = {
  displayTime: 10,
  type: NotificationType.error,
  shown: true,
};

const createErrorNotification = (title: string, description: string) => {
  useNotification().createNotification({
    title,
    description,
    ...baseHttpError,
  });
};

const useHttpErrors = () => {
  const handleErrorByCode = async (
    errorMessage: number,
    message: string,
    router: Router
  ) => {
    const { config, translations } = await getApplicationDetails();
    let language = config.customization.applicationLocale;

    const displayPreferences = useStateManagement().getGlobalState(
      "_displayPreferences"
    );
    if (displayPreferences)
      if (displayPreferences.lang) language = displayPreferences.lang;

    const { t } = i18n(translations, language).global;

    switch (errorMessage) {
      case 401:
        await auth.logout();
        await auth.redirectToLogin();
        break;
      case 403:
        createErrorNotification(
          t("notifications.graphql-errors.forbidden.title"),
          t("notifications.graphql-errors.forbidden.description")
        );
        try {
          router.go(-1);
        } catch {
          router.push("/");
        }
        break;
      default:
        createErrorNotification("Error", message);
        break;
    }
  };

  const getStatusCodeFromError = (error: any): number => {
    if (error?.status) return error.status as number;
    if (error?.statusCode) return error.statusCode as number;
    if (error.extensions?.status) return error.extensions.status as number;
    if (error.message) return parseInt(error.message.split(":")[0]);
    return 0;
  };

  const getMessageFromError = (error: any): string => {
    if (error?.statusText) return error?.statusText;
    if (error?.message) return error.message;
    return "Something went wrong, please try again later";
  };

  const logFormattedErrors = (router: Router, error: any) => {
    const statusCode = getStatusCodeFromError(error);
    const message = getMessageFromError(error);
    console.log(`Http error:`);
    console.log(`Status:`, statusCode);
    console.log(`Message:`, message);
    console.log(`---`);

    handleErrorByCode(statusCode, message, router);
  };

  return {
    logFormattedErrors,
    getStatusCodeFromError,
  };
};

export default useHttpErrors;
