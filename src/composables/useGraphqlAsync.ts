import { apolloClient } from "@/main";
import { fetchDocuments } from "@/composables/useDocumentFetcher";

export const useGraphqlAsync = () => {
  const getQueryDocument = async () => {
    return await fetchDocuments();
  };

  const queryAsync = async (query: any, variables: any = undefined) => {
    const queryInput = { query };
    if (variables) queryInput["variables"] = variables;
    return await apolloClient.query(queryInput);
  };

  const mutateAsync = async (mutation: any, variables: any) => {
    return await apolloClient.mutate({ mutation, variables });
  };

  return { getQueryDocument, queryAsync, mutateAsync };
};
