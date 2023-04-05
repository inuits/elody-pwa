import type { FormContext, FormOptions } from "vee-validate";
import { ref } from "vue";

const forms = ref<{ [key: string]: FormContext }>({});

const useFormHelper = () => {
  const addForm = (key: string, form: FormContext) => {
    forms.value[key] = form;
  };

  const getForm = (key: string): FormContext => {
    return forms.value[key];
  };

  const getForms = (): { [key: string]: FormContext } => {
    return forms.value;
  };

  const deleteForm = (key: string) => {
    delete forms.value[key];
  };

  const deleteForms = () => {
    forms.value = {};
  };

  return { addForm, getForm, getForms, deleteForm, deleteForms, forms };
};

export { useFormHelper };
