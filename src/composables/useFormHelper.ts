import {
  EditStatus,
  type IntialValues,
  type PanelMetaData,
  type RelationValues,
  type BaseRelationValuesInput,
} from "@/generated-types/queries";
import { findPanelMetadata } from "@/helpers";
import { useForm, type FormContext } from "vee-validate";
import { ref, inject } from "vue";
import { useRoute } from "vue-router";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { object, string, date } from "yup";

const forms = ref<{ [key: string]: FormContext<any> }>({});
const editableFields = ref<{ [key: string]: string[] }>({});
const { getRelationType } = useEntityPickerModal();
const validationSchemaObject = inject("validationSchema") as any;

export type EntityValues = {
  intialValues?: IntialValues;
  relationValues?: RelationValues;
};

const useFormHelper = () => {
  const createEntityValues = (
    intialValueFields: PanelMetaData[]
  ): EntityValues => {
    const intialValues: any = {};
    Object.values(intialValueFields).forEach((field: PanelMetaData) => {
      if (!field.key) return;
      intialValues[field.key] = "";
    });
    return { intialValues, relationValues: { label: "", relations: [] } };
  };

  const createForm = (
    key: string,
    formValues: EntityValues
  ): FormContext<any> => {
    const validationSchema = object().shape(validationSchemaObject);
    // validationSchema = object().shape({
    //   id: string().required(),
    //   name: string().required(),
    //   title: string().required(),
    //   description: string().notRequired(),
    //   email: string().email(),
    //   date: date().default(() => new Date()),
    // });
    const form = useForm<EntityValues>({
      // validationSchema,
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

  const getForm = (key: string): FormContext<any> | undefined => {
    const form = forms.value[key];
    if (!form) {
      return undefined;
    }
    return form;
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

  const getFieldError = (
    formKey: string,
    fieldKey: string
  ): string | undefined => {
    const form = getForm(formKey);
    if (!form) return undefined;
    const errorMessage = (form.errors as any)[fieldKey];
    return errorMessage || undefined;
  };

  const __isNotEmpty = (str: any) => str.trim() !== "";

  const formContainsValues = (key: string) => {
    const form = forms.value[key];
    if (!form) return false;
    const values = Object.values(form.values.intialValues);
    return values.some(__isNotEmpty);
  };

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

  const route = useRoute();

  const addRelations = (selectedItems: InBulkProcessableItem[]) => {
    const id = route.params.id as string;
    const form = getForm(id);

    if (selectedItems.length <= 0 || !form) return;

    const relations: BaseRelationValuesInput[] =
      form.values.relationValues.relations;
    selectedItems.forEach((item) => {
      relations.push({
        key: item.id,
        type: getRelationType(),
        value: item.teaserMetadata?.find((data) => data.key === "name")?.value,
        editStatus: EditStatus.New,
        teaserMetadata: item.teaserMetadata?.map((metadata) => {
          return {
            key: metadata.key,
            label: metadata.label,
            value: metadata.value,
          };
        }),
      });
    });

    form.setFieldValue("relationValues.relations", relations);
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
    createEntityValues,
    formContainsValues,
    getFieldError,
    addRelations,
  };
};

export { useFormHelper };
