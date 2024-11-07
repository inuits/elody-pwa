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
    const [errorCode, ...messageParts] = httpErrorMessage.split(" ");
    return { code: errorCode, message: messageParts.join(" ") };
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
    return message;
  };

  return { handleErrorByCode, handleGraphqlError, handleHttpError };
};
