import type { GraphQLError } from "graphql/error";
import { getApplicationDetails, i18n } from "@/helpers";
import { useStateManagement } from "@/composables/useStateManagement";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import useTenant from "@/composables/useTenant";
import { auth, router } from "@/main";

export const useErrorCodes = (): {
  handleErrorByCode: (code: string) => void;
  handleGraphqlError: (error: GraphQLError) => void;
  handleHttpError: (httpResponse: Response) => string;
} => {
  let t;

  const authHandlers: Record<string, Function> = {
    "1001": () => handleUnauthorized(),
    "1003": () => handleAccessDenied(),
    "1004": () => handleAccessDenied(),
  };

  const readHandlers: Record<string, Function> = {};

  const writeHandlers: Record<string, Function> = {};

  const statusCodeHandlers: Record<number, Function> = {
    401: () => handleUnauthorized(),
    403: () => handleAccessDenied(),
  };

  const setupUseI18n = async () => {
    const { translations, config } = await getApplicationDetails();
    let language = config.customization.applicationLocale;
    const displayPreferences = useStateManagement().getGlobalState(
      "_displayPreferences"
    );
    if (displayPreferences)
      if (displayPreferences.lang) language = displayPreferences.lang;

    const { t } = i18n(translations, language).global;
    return t;
  };

  const extractMessageAndCodeFromErrorResponse = (
    errorMessage: string
  ): {
    code: string | undefined;
    message: string | undefined;
  } => {
    try {
      const errorCodeRegex = /\b[RW]\d{4,5}\b/g;
      const errorCodeMatch = errorMessage.match(errorCodeRegex);
      const errorCode: string = errorCodeMatch[0];

      const messageParts: string[] = errorMessage.split(errorCode);
      const message: string = messageParts[1] ? messageParts[1].trim() : "";

      return { code: errorCode, message };
    } catch (e) {
      return { code: undefined, message: undefined };
    }
  };

  const getTranslatedErrorMessageForCode = async (
    code: string
  ): string | undefined => {
    return t(`error-codes.${code}`);
  };

  const handleUnauthorized = async () => {
    const { setTennantInSession } = useTenant();

    await auth.logout();
    useStateManagement().clearStorage();
    setTennantInSession("");
    router.push("/unauthorized");
  };

  const handleAccessDenied = () => {
    useNotification().createNotificationOverwrite({
      type: NotificationType.error,
      title: t("notifications.graphql-errors.forbidden.title"),
      description: t("notifications.graphql-errors.forbidden.description"),
    });
    router.push("/accessDenied");
  };

  const handleAuthCodes = (genericCodePart: string) => {
    authHandlers[genericCodePart]();
  };

  const handleWriteTypeError = (code: string, message: string): void => {
    if (!Object.keys(writeHandlers).includes(code)) {
      useNotification().createNotificationOverwrite({
        type: NotificationType.error,
        title: "Error",
        description: message,
      });
      return;
    }
    writeHandlers[code]();
  };

  const handleReadTypeError = (code: string, message: string): void => {
    if (!Object.keys(readHandlers).includes(code)) return;
    readHandlers[code]();
  };

  const handleErrorByCodeType = async (
    code: string,
    defaultMessage: string
  ): promise<void> => {
    const message =
      (await getTranslatedErrorMessageForCode(code)) || defaultMessage;
    const genericCodePart: string = code.substring(1);

    if (Object.keys(authHandlers).includes(genericCodePart)) handleAuthCodes();
    if (code.startsWith("R")) handleReadTypeError(code, message);
    if (code.startsWith("W")) handleWriteTypeError(code, message);
  };

  const fallbackOnRequestStatusCode = (statusCode: string): void => {
    if (!Object.keys(statusCodeHandlers).includes(statusCode)) {
      console.info(
        `An error with status code ${statusCode} could not be handled, add it to the statusCodeHandlers mapper to determine what should happen`
      );
      return;
    }
    statusCodeHandlers[statusCode]();
  };

  const handleGraphqlError = async (error: GraphQLError): Promise<string> => {
    t = await setupUseI18n();
    const graphqlErrorMessage =
      error.response.errors[0]?.extensions?.response?.body?.message;

    const { code, message } =
      extractMessageAndCodeFromErrorResponse(graphqlErrorMessage);

    if (!code) {
      const statusCode: number =
        error.response.errors[0]?.extensions?.response?.status;
      fallbackOnRequestStatusCode(statusCode.toString());
      return;
    }

    handleErrorByCodeType(code);
    return message;
  };

  const handleHttpError = async (httpResponse: Response): Promise<string> => {
    t = await setupUseI18n();
    const responseBody = await httpResponse.json();
    const httpErrorMessage: string =
      responseBody.extensions.response.body.message;

    const { code, message } =
      extractMessageAndCodeFromErrorResponse(httpErrorMessage);

    if (!code) {
      fallbackOnRequestStatusCode(httpResponse.status.toString());
      return;
    }

    handleErrorByCodeType(code);
    return message;
  };

  return { handleErrorByCodeType, handleGraphqlError, handleHttpError };
};
