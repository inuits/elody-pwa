import { ref } from "vue";
import { useImport } from "@/composables/useImport";

export const useCustomQuery = () => {
  const document = ref<object | undefined>(undefined);
  const { loadDocument: loadDoc } = useImport();
  const loadDocument = async (queryDoc: string, filtersQueryDoc: string) => {
    const queryDocument = await loadDoc(queryDoc);
    const filtersDocument = await loadDoc(filtersQueryDoc);

    document.value = {
      name: queryDoc,
      document: queryDocument,
      filtersDocument: filtersDocument,
    };
  };

  const getDocument = () => document.value;

  return {
    loadDocument,
    getDocument,
  };
};
