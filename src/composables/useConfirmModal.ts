import { ref } from "vue";
import { type RouteLocationRaw, useRouter } from "vue-router";

const confirmFunction = ref<Function | undefined>(undefined);
const secondaryConfirmFunction = ref<Function | undefined>(undefined);
const declineFunction = ref<Function | undefined>(undefined);
const translationKey = ref<string>("");
const pathToNavigate = ref<string | undefined>(undefined);

export const useConfirmModal = () => {
  const router = useRouter();

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

  const setPathToNavigate = (choice: string): void => {
    pathToNavigate.value = choice;
  };

  const deletePathToNavigate = (): void => {
    return (pathToNavigate.value = undefined);
  };

  const performRoute = (): void => {
    if (pathToNavigate.value) router.push(pathToNavigate as RouteLocationRaw);
  };

  return {
    initializeConfirmModal,
    setConfirmFunction,
    setSecondaryConfirmFunction,
    setDeclineFunction,
    setTranslationKey,
    setPathToNavigate,
    deletePathToNavigate,
    pathToNavigate,
    performRoute,
    confirmFunction,
    secondaryConfirmFunction,
    declineFunction,
    translationKey,
  };
};
