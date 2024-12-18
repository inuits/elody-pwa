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

  const statusCodeHandlers: Record<number | string, Function> = {
    401: (errorCodeType: ErrorCodeType) => handleUnauthorized(errorCodeType),
    403: (errorCodeType: ErrorCodeType) => handleAccessDenied(errorCodeType),
    404: (errorCodeType: ErrorCodeType) => handleNotFound(errorCodeType),
    default: (errorCodeType: ErrorCodeType, errorMessage: string) =>
      showNotification(errorCodeType, errorMessage),
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
      const variablesString = errorMessage.split("|");
      const variables: string[] = [];
      variablesString.forEach((variable, index) => {
        if (index !== 0)
          variables.push(...variable.split(" - ")[0].trim().split("|"));
      })
      return variables;
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

  const showNotification = (
    errorCodeType: ErrorCodeType = ErrorCodeType.Read,
    errorMessage: string,
  ) => {
    const { createNotificationOverwrite } = useNotification();
    createNotificationOverwrite(
      NotificationType.error,
      "Error",
      errorMessage,
    );
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
    errorMessage: string
  ): void => {
    if (!Object.keys(statusCodeHandlers).includes(statusCode)) {
      statusCodeHandlers["default"](errorCodeType, errorMessage);
      console.info(
        `An error with status code ${statusCode} was handled by the default handler, add it to the statusCodeHandlers mapper to implement custom behaviour`,
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

  const __extractStatusCodeAndMessageFromResponse = (
    responseType: "graphql" | "http",
    error: GraphQLError | Response,
  ): {
    statusCode: string;
    message: string;
  } => {
    if (responseType === "graphql") {
      const graphQLError = error as GraphQLError;
      const statusCode: number =
        graphQLError.response.errors[0]?.extensions?.response?.status.toString() ||
        graphQLError.response.errors[0]?.extensions?.statusCode.toString();
      const message: string =
        graphQLError.extensions?.response?.body?.message ||
        graphQLError.message;
      return { statusCode, message };
    }
    const httpError = error as Response;
    const statusCode: number =
      httpError.status || httpError?.extensions?.statusCode;
    const message =
      httpError.statusText.toString() || httpError.message.toString();
    return { statusCode, message };
  };

  const handleGraphqlError = async (error: GraphQLError): Promise<string> => {
    t = await setupScopedUseI18n();
    const graphqlErrorMessage =
      error.response.errors[0]?.extensions?.response?.body?.message ||
      error.response.errors[0]?.message;

    const { code, message, variables } =
      await extractErrorComponentsFromErrorResponse(graphqlErrorMessage);

    if (!code) {
      const { statusCode, message } = __extractStatusCodeAndMessageFromResponse(
        "graphql",
        error,
      );
      fallbackOnRequestStatusCode(statusCode, ErrorCodeType.Read, graphqlErrorMessage);
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
      const { statusCode, message } = __extractStatusCodeAndMessageFromResponse(
        "http",
        error,
      );
      fallbackOnRequestStatusCode(statusCode, ErrorCodeType.Read, message);
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
