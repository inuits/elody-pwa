import { apolloClient } from "@/main";
import { ref } from "vue";

const dynamicForm = ref<Object | undefined>(undefined);

const useDynamicFormModal = () => {
  const getDynamicForm = (queryDocument: object): void => {
    apolloClient
      .query({
        query: queryDocument,
      })
      .then((result: Object) => {
        dynamicForm.value = result.data;
      });
  };

  return { getDynamicForm, dynamicForm };
};

export { useDynamicFormModal };
