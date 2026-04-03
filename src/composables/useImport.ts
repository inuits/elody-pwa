import { fetchDocuments } from "@/composables/useDocumentFetcher";

export const useImport = () => {
  const loadDocument = async (queryName: string) => {
    try {
      const documents = await fetchDocuments();
      return documents[`${queryName}Document`];
    } catch {}
  };
  const loadQuery = async (queryName: string) => {
    try {
      console.warn(`loadQuery("${queryName}") is deprecated`);
      return undefined;
    } catch {}
  };
  const loadQueryVariables = async (queryName: string) => {
    try {
      console.warn(`loadQueryVariables("${queryName}") is deprecated`);
      return undefined;
    } catch {}
  };

  return {
    loadDocument,
    loadQuery,
    loadQueryVariables,
  };
};
