import {
  useNotification,
  type NotificationsOptions,
} from "@kyvg/vue3-notification";
import { getTranslatedMessage } from "@/helpers";
import { useBaseModal } from "@/composables/useBaseModal";

export const modalNotificationGroup = "modal";

export const useBaseNotification = (): {
  displaySuccessNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationsOptions,
  ) => void;
  displayWarningNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationsOptions,
  ) => void;
  displayErrorNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationsOptions,
  ) => void;
  displayPersistentNotification: (
    id: number,
    title: string,
    text: string,
    type: "warn" | "success" | "error",
  ) => void;
  closeNotification: (id: number) => void;
} => {
  const { notify } = useNotification();
  const { someModalIsOpened } = useBaseModal();
  const baseDuration: number = 10000;
  const visibleGroup = (): string =>
    someModalIsOpened.value ? modalNotificationGroup : "";

  const displaySuccessNotification = (
    title: string,
    text: string,
    extraOptions: NotificationsOptions = {},
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "success",
      duration: baseDuration,
      group: visibleGroup(),
      ...extraOptions,
    });
  };

  const displayWarningNotification = (
    title: string,
    text: string,
    extraOptions: NotificationsOptions = {},
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "warn",
      duration: baseDuration,
      group: visibleGroup(),
      ...extraOptions,
    });
  };

  const displayErrorNotification = (
    title: string,
    text: string,
    extraOptions: NotificationsOptions = {},
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "error",
      duration: baseDuration,
      group: visibleGroup(),
      ...extraOptions,
    });
  };

  const displayPersistentNotification = (
    id: number,
    title: string,
    text: string,
    type: "warn" | "success" | "error",
  ): void => {
    notify({
      id,
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type,
      duration: -1,
    });
  };

  const closeNotification = (id: number): void => {
    notify.close(id);
  };

  return {
    displaySuccessNotification,
    displayWarningNotification,
    displayErrorNotification,
    displayPersistentNotification,
    closeNotification,
  };
};
