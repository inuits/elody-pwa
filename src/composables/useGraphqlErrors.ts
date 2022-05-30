import { ErrorResponse } from '@apollo/client/link/error';

const useGraphqlErrors = (_errorResponse: ErrorResponse) => {
  const checkForUnauthorized = () => {
    const gqlErrors = _errorResponse.graphQLErrors;
    let authErrors: Array<Boolean | undefined> = [];
    if (gqlErrors) {
      authErrors = gqlErrors.map(error => {
        if (error.extensions) {
          if (error.extensions?.statusCode === 401) return true;
          if (error.extensions?.response && error.extensions?.response.status && error.extensions?.response.status === 401) return true;
        };
      });
    };
    return authErrors.some(errors => errors);
  };

  const logFormattedErrors = () => {
    const gqlErrors = _errorResponse.graphQLErrors;
    if (gqlErrors) {
      for (const error of gqlErrors) {
        if (error.extensions) {
          console.log(`Graphql error:`);
          console.log(`Status:`, error.extensions?.statusCode ? error.extensions?.statusCode : undefined);
          console.log(`Code:`, error.extensions?.code ? error.extensions?.code : undefined);
          console.log(`Message:`, error.message);
          console.log(`---`);
        };
      };
    };
  };

  return {
    checkForUnauthorized,
    logFormattedErrors,
  };

};

export default useGraphqlErrors;