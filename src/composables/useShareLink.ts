import type { ApolloClient } from "@apollo/client/core";

export const useShareLink = (apolloClient: ApolloClient<any>) => {
  const createShareLink = () => {};

  const deleteShareLink = () => {};

  return { createShareLink, deleteShareLink };
};
