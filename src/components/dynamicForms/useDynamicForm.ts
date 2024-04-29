import { apolloClient } from "@/main";
import { ref } from "vue";
import { type EntityInput } from "@/generated-types/queries";

const dynamicForm = ref<any | undefined>(undefined);
const dynamicFormUploadFields = ref<any[]>([]);

const useDynamicForm = () => {
  const getDynamicForm = (queryDocument: any): void => {
    apolloClient
      .query({
        query: queryDocument,
      })
      .then((result) => {
        dynamicForm.value = result.data;
      });
  };

  const performSubmitAction = async (
    queryDocument: any,
    entity: EntityInput
  ): Promise<any> => {
    return await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entity },
    });
  };

  const performDownloadAction = async (
    queryDocument: any,
    listOfIds: any,
    downloadEntity: any,
    form: any
  ): Promise<any> => {
    const variables = {
      downloadEntity: downloadEntity,
      entities: listOfIds.entities,
      mediafiles: listOfIds.mediafiles,
      includeCsv: !!form.intialValues.include_csv,
    };
    return await apolloClient.query({
      query: queryDocument,
      variables
    });
  };

  return {
    getDynamicForm,
    dynamicForm,
    performSubmitAction,
    performDownloadAction,
    dynamicFormUploadFields,
  };
};

export { useDynamicForm };
