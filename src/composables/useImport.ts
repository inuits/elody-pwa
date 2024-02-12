export const useImport = () => {
  const getQueries = async () => {
    return await import(`/src/generated-types/queries.ts`);
  };

  const loadDocument = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}Document`];
    } catch (e) {}
  };
  const loadQuery = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}Query`];
    } catch (e) {}
  };
  const loadQueryVariables = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}QueryVariables`];
    } catch (e) {}
  };

  return {
    loadDocument,
    loadQuery,
    loadQueryVariables,
  };
};
