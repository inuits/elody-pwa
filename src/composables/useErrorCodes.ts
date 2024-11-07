import type { GraphQLError } from "graphql/error";

export const useErrorCodes = (): {
  handleErrorByCode: (code: string) => void;
  handleGraphqlError: (error: GraphQLError) => void;
  handleHttpError: (httpResponse: Response) => string;
} => {
  const extractMessageAndCodeFromErrorResponse = (
    httpErrorMessage: string
  ): {
    code: string;
    message: string;
  } => {
    const errorCodeRegex = /\b[RW]\d{4,5}\b/g;
    const errorCodeMatch = httpErrorMessage.match(errorCodeRegex);
    const errorCode: string = errorCodeMatch[0];

    const messageParts: string[] = httpErrorMessage.split(errorCode);
    const message: string = messageParts[1] ? messageParts[1].trim() : "";

    return { code: errorCode, message };
  };

  const handleErrorByCode = (code: string): void => {
    console.log(code);
  };

  const handleGraphqlError = (error: GraphQLError): void => {
    console.log(error);
  };

  const handleHttpError = async (httpResponse: Response): Promise<string> => {
    const responseBody = await httpResponse.json();
    const httpErrorMessage: string =
      responseBody.extensions.response.body.message;
    const { code, message } =
      extractMessageAndCodeFromErrorResponse(httpErrorMessage);
    handleErrorByCode(code);
    console.log(message);
    return message;
  };

  return { handleErrorByCode, handleGraphqlError, handleHttpError };
};
