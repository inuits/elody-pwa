import type { IntialValues, RelationValues } from "@/generated-types/queries";
import { useForm, type FormContext } from "vee-validate";
import { ref } from "vue";

const forms = ref<{ [key: string]: FormContext<any> }>({});

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

  return {
    createForm,
    addForm,
    getForm,
    getForms,
    deleteForm,
    deleteForms,
    forms,
  };
};

export { useFormHelper };
