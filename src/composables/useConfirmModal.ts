import { ref } from "vue";
import type {
  ButtonSize,
  ButtonStyle,
} from "@/components/base/BaseButtonNew.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";

const { openModal, closeModal } = useBaseModal();

export type ConfirmChoice = "confirm" | "secondary" | "cancel";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  secondaryLabel?: string;
  confirmButtonStyle?: ButtonStyle;
  confirmButtonSize?: ButtonSize;
  secondaryButtonStyle?: ButtonStyle;
  secondaryButtonSize?: ButtonSize;
  cancelButtonStyle?: ButtonStyle;
  cancelButtonSize?: ButtonSize;
};

const pendingConfirm = ref<{
  options: ConfirmOptions;
  resolve: (choice: ConfirmChoice) => void;
} | null>(null);

export const useConfirmModal = () => {
  const confirm = (options: ConfirmOptions): Promise<ConfirmChoice> => {
    if (pendingConfirm.value) {
      pendingConfirm.value.resolve("cancel");
    }
    openModal(TypeModals.Confirm, ModalStyle.Center);
    return new Promise<ConfirmChoice>((resolve) => {
      pendingConfirm.value = { options, resolve };
    });
  };

  const resolveConfirm = (choice: ConfirmChoice): void => {
    if (!pendingConfirm.value) return;
    const resolve = pendingConfirm.value.resolve;
    pendingConfirm.value = null;
    closeModal(TypeModals.Confirm);
    resolve(choice);
  };

  return { confirm, pendingConfirm, resolveConfirm };
};
