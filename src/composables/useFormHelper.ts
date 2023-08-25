import type {
  IntialValues,
  PanelMetaData,
  RelationValues,
} from "@/generated-types/queries";
import { useForm, type FormContext } from "vee-validate";
import { ref } from "vue";

const forms = ref<{ [key: string]: FormContext<any> }>({});
const editableFields = ref<{ [key: string]: string[] }>({});

export type EntityValues = {
  intialValues: IntialValues;
  relationValues: RelationValues;
};

const useFormHelper = () => {
  const createForm = (
    key: string,
    formValues: EntityValues
  ): FormContext<any> => {
    const form = useForm<EntityValues>({
      initialValues: {
        intialValues: formValues.intialValues,
        relationValues: formValues.relationValues,
      },
    });
    addForm(key, form);
    return form;
  };

  const addForm = (key: string, form: FormContext<any>) => {
    forms.value[key] = form;
  };

  const getForm = (key: string): FormContext<any> => {
    return forms.value[key] || undefined;
  };

  const getForms = (): { [key: string]: FormContext<any> } => {
    return forms.value;
  };

  const deleteForm = (key: string) => {
    delete forms.value[key];
  };

  const deleteForms = () => {
    forms.value = {};
  };

  function findPanelMetadata(
    obj: any,
    parentIsEditable?: boolean
  ): PanelMetaData[] {
    const results: PanelMetaData[] = [];

    if (obj && obj.__typename === "PanelMetaData") {
      if (parentIsEditable !== false) {
        results.push(obj);
      }
    }

    if (typeof obj === "object") {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const nestedResults = findPanelMetadata(obj[key], obj.isEditable);
          results.push(...nestedResults);
        }
      }
    }

    return results;
  }

  const getEditableMetadataKeys = (
    columnList: Record<string, any>,
    formId: string
  ): string[] => {
    const keyArray: string[] = [];
    const panelMetadataItems = findPanelMetadata(columnList);

    panelMetadataItems.forEach((metadataItem: PanelMetaData) => {
      if (!metadataItem.inputField) return;
      keyArray.push(metadataItem.key);
    });
    editableFields.value[formId] = keyArray;
    return keyArray;
  };

  return {
    createForm,
    addForm,
    getForm,
    getForms,
    deleteForm,
    deleteForms,
    forms,
    getEditableMetadataKeys,
    editableFields,
  };
};

export { useFormHelper };
