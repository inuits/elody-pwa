import type { FormContext } from "vee-validate";
import { ref } from "vue";

const forms = ref<{ [key: string]: FormContext<any> }>({});

const useFormHelper = () => {
  const addForm = (key: string, form: FormContext<any>) => {
    forms.value[key] = form;
  };

  const getForm = (key: string): FormContext<any> => {
    return forms.value[key];
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

  return { addForm, getForm, getForms, deleteForm, deleteForms, forms };
};

export { useFormHelper };
