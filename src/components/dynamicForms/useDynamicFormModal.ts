import { apolloClient } from "@/main";
import { ref } from "vue";
import { type EntityInput } from "@/generated-types/queries";

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

  const performSubmitAction = async (
    queryDocument: object,
    entity: EntityInput
  ): Promise<any> => {
    return await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entity },
    });
  };

  return { getDynamicForm, dynamicForm, performSubmitAction };
};

export { useDynamicFormModal };
