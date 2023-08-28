import { ref } from "vue";

const confirmFunction = ref<Function | undefined>(undefined);
const secondaryConfirmFunction = ref<Function | undefined>(undefined);
const declineFunction = ref<Function | undefined>(undefined);
const translationKey = ref<string>("");

export const useConfirmModal = () => {
  const setConfirmFunction = (func: Function) => {
    confirmFunction.value = func;
  };

  const setSecondaryConfirmFunction = (func: Function) => {
    secondaryConfirmFunction.value = func;
  };

  const setDeclineFunction = (func: Function) => {
    declineFunction.value = func;
  };

  const setTranslationKey = (item: string) => {
    translationKey.value = item;
  };

  return {
    setConfirmFunction,
    setSecondaryConfirmFunction,
    setDeclineFunction,
    setTranslationKey,
    confirmFunction,
    secondaryConfirmFunction,
    declineFunction,
    translationKey,
  };
};
