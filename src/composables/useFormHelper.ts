import type {
  IntialValues,
  PanelMetaData,
  RelationValues,
  WindowElement,
  WindowElementPanel,
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

  const getEditableMetadataKeys = (
    windowElement: WindowElement,
    formId: string
  ): string[] => {
    const keys: string[] = [];
    Object.keys(windowElement).forEach((key: string) => {
      const panel: WindowElementPanel = windowElement[key];
      if (!panel) return;
      if (panel.__typename !== "WindowElementPanel" || !panel.isEditable)
        return;
      Object.keys(panel).forEach((metadataItemKey: string) => {
        const metadataItem: PanelMetaData = panel[metadataItemKey];
        if (!metadataItem || !metadataItem.inputField) return;
        keys.push(metadataItem.key);
      });
    });
    editableFields.value[formId] = keys;
    console.log(editableFields.value);
    return keys;
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
