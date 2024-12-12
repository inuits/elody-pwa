import type { GraphQLError } from "graphql/error";
import { setupScopedUseI18n } from "@/helpers";
import { useStateManagement } from "@/composables/useStateManagement";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import useTenant from "@/composables/useTenant";
import { auth, router } from "@/main";
import { ErrorCodeType } from "@/generated-types/queries";
import type { ApolloError } from "@apollo/client/core";
import { useBaseModal } from "@/composables/useBaseModal";

export const useErrorCodes = (): {
  handleErrorByCode: (code: string) => void;
  handleGraphqlError: (error: GraphQLError) => string;
  handleHttpError: (httpResponse: Response) => string;
  getMessageAndCodeFromApolloError: (apolloError: ApolloError) => Promise<{
    code: string;
    message: string;
  }>;
  getMessageAndCodeFromErrorString: (
    error: string,
  ) => Promise<{ code: string; message: string }>;
} => {
  let t;
  const { createNotificationOverwrite } = useNotification();

  const authHandlers: Record<string, Function> = {
    "1001": (errorCodeType) => handleUnauthorized(errorCodeType),
    "1003": (errorCodeType) => handleAccessDenied(errorCodeType),
    "1004": (errorCodeType) => handleAccessDenied(errorCodeType),
  };

  const readHandlers: Record<string, Function> = {
    R0004: () => handleNotFound(),
  };

  const writeHandlers: Record<string, Function> = {};

  const statusCodeHandlers: Record<number, Function> = {
    401: (errorCodeType) => handleUnauthorized(errorCodeType),
    403: (errorCodeType) => handleAccessDenied(errorCodeType),
    404: (errorCodeType) => handleNotFound(errorCodeType),
    500: (errorCodeType) => undefined,
  };

  const __parseVariableStringToVariableObject = (
    stringVariables: string[],
  ): Record<string, string> | undefined => {
    try {
      const variablesObject: record<string, string> = {};
      stringVariables.forEach((variable) => {
        const colonIndex = variable.indexOf(":");

        if (colonIndex !== -1) {
          const key = variable.substring(0, colonIndex);
          const value = variable.substring(colonIndex + 1);
          variablesObject[key] = value;
        }
      });
      return variablesObject;
    } catch {
      return undefined;
    }
  };

  const __getStringVariablesFromErrorMessage = (
    errorMessage: string,
  ): string[] => {
    try {
      return errorMessage.split("|", 2)[1].split("-")[0].trim().split("|");
    } catch {
      return [];
    }
  };

  const extractErrorComponentsFromErrorResponse = async (
    errorMessage: string,
  ): Promise<{
    code: string | undefined;
    message: string | undefined;
    variables: Record<string, string> | undefined;
  }> => {
    try {
      const errorCodeRegex = /\b[RW]\d{4,5}\b/g;
      const errorCodeMatch = errorMessage.match(errorCodeRegex);
      const errorCode: string = errorCodeMatch[0];

      const stringVariables =
        __getStringVariablesFromErrorMessage(errorMessage);
      const variableObjects =
        __parseVariableStringToVariableObject(stringVariables);

      const messageParts: string[] = errorMessage.split("-", 2);
      const message: string = messageParts[1] ? messageParts[1].trim() : "";
      const translatedMessage = await getTranslatedErrorMessageForCode(
        errorCode,
        message,
        variableObjects,
      );

      return {
        code: errorCode,
        message: translatedMessage,
        variables: variableObjects,
      };
    } catch (e) {
      return { code: undefined, message: errorMessage, variables: undefined };
    }
  };

  const getTranslatedErrorMessageForCode = async (
    code: string | undefined,
    defaultMessage: string,
    variables: Record<string, string> | undefined,
  ): Promise<string> => {
    if (!code) return defaultMessage;
    return t(`error-codes.${code}`, variables);
  };

  const handleUnauthorized = async (
    errorCodeType: ErrorCodeType = ErrorCodeType.Read,
  ) => {
    const { setTennantInSession } = useTenant();
    const { closeAllModals } = useBaseModal();

    await auth.logout();
    useStateManagement().clearStorage();
    setTennantInSession("");
    closeAllModals();
    router.push("/unauthorized");
  };

  const handleAccessDenied = (
    errorCodeType: ErrorCodeType = ErrorCodeType.Read,
  ) => {
    const { closeAllModals } = useBaseModal();

    if (errorCodeType === ErrorCodeType.Write) {
      createNotificationOverwrite(
        NotificationType.error,
        t("notifications.graphql-errors.forbidden.title"),
        t("notifications.graphql-errors.forbidden.description"),
      );
      return;
    }
    closeAllModals();
    router.push("/accessDenied");
  };

  const handleNotFound = (
    errorCodeType: ErrorCodeType = ErrorCodeType.Read,
  ) => {
    router.push("/not-found");
  };

  const handleAuthCodes = (
    genericCodePart: string,
    errorCodeType: ErrorCodeType,
  ) => {
    authHandlers[genericCodePart](errorCodeType);
  };

  const handleWriteTypeError = (code: string, message: string): void => {
    if (!Object.keys(writeHandlers).includes(code)) {
      createNotificationOverwrite(NotificationType.error, "Error", message);
      return;
    }
    writeHandlers[code]();
  };

  const handleReadTypeError = (code: string, message: string): void => {
    if (!Object.keys(readHandlers).includes(code)) return;
    readHandlers[code]();
  };

  const handleErrorByCodeType = async (code: string): promise<void> => {
    const message = await getTranslatedErrorMessageForCode(code);
    const genericCodePart: string = code.substring(1);
    const actionCodePart: string = Array.from(code)[0];

    const actionTypeMapper: Record<string, ErrorCodeType> = {
      R: ErrorCodeType.Read,
      W: ErrorCodeType.Write,
    };
    const errorCodeType: ErrorCodeType = actionTypeMapper[actionCodePart];

    if (Object.keys(authHandlers).includes(genericCodePart))
      handleAuthCodes(genericCodePart, errorCodeType);
    if (errorCodeType === ErrorCodeType.Read)
      handleReadTypeError(code, message);
    if (errorCodeType === ErrorCodeType.Write)
      handleWriteTypeError(code, message);
  };

  const fallbackOnRequestStatusCode = (
    statusCode: string,
    errorCodeType: ErrorCodeType,
  ): void => {
    if (!Object.keys(statusCodeHandlers).includes(statusCode)) {
      console.info(
        `An error with status code ${statusCode} could not be handled, add it to the statusCodeHandlers mapper or handle the error with the 'onError' directive on the call itself`,
      );
      return;
    }
    statusCodeHandlers[statusCode](errorCodeType);
  };

  const getMessageAndCodeFromErrorString = async (
    error: string,
  ): Promise<{ code: string; message: string }> => {
    t = await setupScopedUseI18n();
    const errorObject = await extractErrorComponentsFromErrorResponse(error);
    return { code: errorObject.code, message: errorObject.message };
  };

  const getMessageAndCodeFromApolloError = async (
    apolloError: ApolloError,
  ): Promise<{ code: string; message: string }> => {
    t = await setupScopedUseI18n();
    let apolloMessage: string =
      apolloError.graphQLErrors[0].extensions.response.body;
    if (apolloMessage.message) apolloMessage = apolloMessage.message;

    return await getMessageAndCodeFromErrorString(apolloMessage);
  };

  const handleGraphqlError = async (error: GraphQLError): Promise<string> => {
    t = await setupScopedUseI18n();
    const graphqlErrorMessage =
      error.response.errors[0]?.extensions?.response?.body?.message ||
      error.response.errors[0]?.message;

    const { code, message, variables } =
      await extractErrorComponentsFromErrorResponse(graphqlErrorMessage);

    if (!code) {
      const statusCode: number =
        error.response.errors[0]?.extensions?.response?.status ||
        error.response.errors[0]?.extensions?.statusCode;
      if (statusCode) {
        fallbackOnRequestStatusCode(statusCode.toString(), ErrorCodeType.Read);
      } else {
        createNotificationOverwrite(
          NotificationType.error,
          "Error",
          graphqlErrorMessage,
        );
      }
      return;
    }

    handleErrorByCodeType(code);
    return message;
  };

  const handleHttpError = async (httpResponse: Response): Promise<string> => {
    if (new URL(httpResponse.url).pathname.includes("api/iiif")) return;
    t = await setupScopedUseI18n();
    const responseBody = await httpResponse.json();
    const httpErrorMessage: string =
      responseBody?.extensions?.response?.body?.message;

    const { code, message, variables } =
      await extractErrorComponentsFromErrorResponse(httpErrorMessage);

    if (!code) {
      fallbackOnRequestStatusCode(
        httpResponse.status?.toString() ||
          responseBody?.extensions?.statusCode?.toString(),
        ErrorCodeType.Read,
      );
      return;
    }

    handleErrorByCodeType(code);
    return message;
  };

  return {
    handleErrorByCodeType,
    handleGraphqlError,
    handleHttpError,
    getMessageAndCodeFromApolloError,
    getMessageAndCodeFromErrorString,
  };
};
