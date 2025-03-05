import { apolloClient } from "@/main";

export const useGraphqlAsync = () => {
  const getQueryDocument = async () => {
    return await import("@/generated-types/queries");
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
