import { ref } from "vue";

const confirmFunction = ref<Function | undefined>(undefined);
const secondaryConfirmFunction = ref<Function | undefined>(undefined);
const declineFunction = ref<Function | undefined>(undefined);
const translationKey = ref<string>("");

export const useConfirmModal = () => {
  const initializeConfirmModal = (
    confirmFunc: Function,
    secondaryConfirmFunc: Function | undefined,
    declineFunc: Function,
    translationKey: string
  ) => {
    setConfirmFunction(confirmFunc);
    setDeclineFunction(declineFunc);
    setTranslationKey(translationKey);
    setSecondaryConfirmFunction(secondaryConfirmFunc || undefined);
  };

  const setConfirmFunction = (func: Function) => {
    confirmFunction.value = func;
  };

  const setSecondaryConfirmFunction = (func: Function | undefined) => {
    secondaryConfirmFunction.value = func;
  };

  const setDeclineFunction = (func: Function) => {
    declineFunction.value = func;
  };

  const setTranslationKey = (item: string) => {
    translationKey.value = item;
  };

  return {
    initializeConfirmModal,
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
