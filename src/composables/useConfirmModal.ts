import { ref } from "vue";
import { type RouteLocationRaw, useRouter } from "vue-router";
import type {
  ButtonSize,
  ButtonStyle,
} from "@/components/base/BaseButtonNew.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { TypeModals } from "@/generated-types/queries";

const { openModal } = useBaseModal();

const confirmModalConfiguration = ref<ConfirmModalConfiguration | undefined>(
  undefined
);
const pathToNavigate = ref<string | undefined>(undefined);

type ButtonConfiguration = {
  buttonCallback: Function;
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
};

export type ConfirmModalConfiguration = {
  confirmButton: ButtonConfiguration;
  secondaryConfirmButton?: ButtonConfiguration;
  declineButton: ButtonConfiguration;
  translationKey: string;
  openImmediately?: boolean;
};

export const useConfirmModal = () => {
  const router = useRouter();

  const initializeConfirmModal = (configuration: ConfirmModalConfiguration) => {
    confirmModalConfiguration.value = configuration;
    if (configuration.openImmediately)
      openModal(TypeModals.Confirm, undefined, "center");
  };

  const setPathToNavigate = (choice: string): void => {
    pathToNavigate.value = choice;
  };

  const deletePathToNavigate = (): void => {
    return (pathToNavigate.value = undefined);
  };

  const performRoute = (): void => {
    if (pathToNavigate.value)
      router.push(pathToNavigate.value as RouteLocationRaw);
  };

  return {
    initializeConfirmModal,
    confirmModalConfiguration,
    setPathToNavigate,
    deletePathToNavigate,
    pathToNavigate,
    performRoute,
  };
};
