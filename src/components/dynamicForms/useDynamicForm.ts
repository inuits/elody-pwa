import { type EntityInput, ModalStyle } from "@/generated-types/queries";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { ref } from "vue";
import { OcrType } from "@/generated-types/queries";

const dynamicForm = ref<any | undefined>(undefined);
const dynamicFormUploadFields = ref<any[]>([]);
const isPerformingAction = ref<boolean>(false);
const { selectedTenant } = useTenant(undefined);

const useDynamicForm = () => {
  const getDynamicFormTabs = (tabName: string | undefined = undefined) => {
    if (tabName && dynamicForm.value) {
      return dynamicForm.value[tabName];
    }
    return dynamicForm.value;
  };

  const getDynamicForm = (
    queryDocument: any,
    tabName: string | undefined = undefined
  ): void => {
    apolloClient
      .query({
        query: queryDocument,
      })
      .then((result) => {
        if (!dynamicForm.value) {
          dynamicForm.value = {};
        }
        if (tabName) {
          dynamicForm.value[tabName] = result.data;
          return;
        }
        dynamicForm.value = result.data;
      });
  };

  const performSubmitAction = async (
    queryDocument: any,
    entity: EntityInput
  ): Promise<any> => {
    isPerformingAction.value = true;
    const submitResult = await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entity, tenantId: selectedTenant.value },
    });
    isPerformingAction.value = false;
    return submitResult;
  };

  const performDownloadAction = async (
    queryDocument: any,
    variables: any,
    downloadEntity: any,
    form: any
  ): Promise<any> => {
    variables["basicCsv"] = !!form.intialValues.basic_csv;
    variables["downloadEntity"] = downloadEntity;
    return await apolloClient.query({
      query: queryDocument,
      variables,
    });
  };

  const performUpdateMetadataAction = async (
    queryDocument: any,
    entityType: string,
    csv: any
  ): Promise<any> => {
    return await apolloClient.mutate({
      mutation: queryDocument,
      variables: { entityType: entityType, csv: csv },
    });
  };

  const performOcrAction = async (
    queryDocument: any,
    id: any,
    form: any
  ): Promise<any> => {
    const operation = [form.intialValues.ocr_type];
    if (operation[0] === OcrType.Pdf) operation.unshift(OcrType.Alto);
    const variables = {
      assetId: id,
      operation: operation,
      language: form.intialValues.ocr_language,
    };
    return await apolloClient.query({
      query: queryDocument,
      variables,
    });
  };

  const resetDynamicForm = (tabName: string | undefined = undefined) => {
    dynamicFormUploadFields.value = [];
    if (tabName) {
      delete dynamicForm.value[tabName];
      return;
    }
    dynamicForm.value = undefined;
  };

  return {
    getDynamicForm,
    dynamicForm,
    performSubmitAction,
    performDownloadAction,
    performUpdateMetadataAction,
    performOcrAction,
    dynamicFormUploadFields,
    resetDynamicForm,
    isPerformingAction,
    getDynamicFormTabs,
  };
};

export { useDynamicForm };
