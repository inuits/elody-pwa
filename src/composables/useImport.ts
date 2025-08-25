export const useImport = () => {
  const getQueries = async () => {
    return await import(`/src/generated-types/queries.ts`);
  };

  const loadDocument = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}Document`];
    } catch {}
  };
  const loadQuery = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}Query`];
    } catch {}
  };
  const loadQueryVariables = async (queryName: string) => {
    try {
      const queries = await getQueries();
      return queries[`${queryName}QueryVariables`];
    } catch {}
  };

  return {
    loadDocument,
    loadQuery,
    loadQueryVariables,
  };
};
