import { ref } from "vue";

const activeFilter = ref<any>(null);
const filerToEdit = ref<any>(null);

export const useSaveSearchHepler = () => {
  const setActiveFilter = (filter: any) => {
    activeFilter.value = filter;
  };

  const setFilterToEdit = (filter: any) => {
    filerToEdit.value = filter;
  };

  const getActiveFilter = () => activeFilter.value;
  const getFilterToEdit = () => filerToEdit.value;

  return {
    setActiveFilter,
    getActiveFilter,
    setFilterToEdit,
    getFilterToEdit,
  };
};
