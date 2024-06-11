import type { EntityInput } from "@/generated-types/queries";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { ref } from "vue";

const dynamicForm = ref<any | undefined>(undefined);
const dynamicFormUploadFields = ref<any[]>([]);
const { selectedTenant } = useTenant(undefined)

const useDynamicForm = () => {
  const getDynamicFormTabs = () => {
    return dynamicForm.value;
  };

  const getDynamicForm = (queryDocument: any): void => {
    apolloClient
      .query({
        query: queryDocument,
      })
      .then((result) => {
        dynamicForm.value = result.data;
      })
      .catch((error) => {
        console.error('Error fetching dynamicFormTabs:', error);
      });
  };

  const performSubmitAction = async (
    queryDocument: any,
    entity: EntityInput
  ): Promise<any> => {
    return await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entity, tenantId: selectedTenant.value },
    });
  };

  const performDownloadAction = async (
    queryDocument: any,
    savedContext: any,
    downloadEntity: any,
    form: any
  ): Promise<any> => {
    const variables = {
      entities: savedContext.entities,
      mediafiles: savedContext.mediafiles,
      basicCsv: !!form.intialValues.basic_csv,
      includeAssetCsv: savedContext.includeAssetCsv,
      downloadEntity: downloadEntity,
    };
    return await apolloClient.query({
      query: queryDocument,
      variables,
    });
  };

  const resetDynamicForm = () => {
    dynamicForm.value = undefined;
    dynamicFormUploadFields.value = [];
  };

  return {
    getDynamicForm,
    dynamicForm,
    performSubmitAction,
    performDownloadAction,
    dynamicFormUploadFields,
    resetDynamicForm,
    getDynamicFormTabs,
  };
};

const getDynamicFormTabs = async () => {
  const dynamicFormInstance = useDynamicForm();
  return dynamicFormInstance.getDynamicFormTabs();
};

export { useDynamicForm, getDynamicFormTabs };
