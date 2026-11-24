let queries: Promise<typeof import("@/generated-types/queries")> | undefined;

export const useImport = () => {
  const getQueries = () =>
    (queries ??= import(`/src/generated-types/queries.ts`).catch((error) => {
      queries = undefined;
      throw error;
    }));

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
