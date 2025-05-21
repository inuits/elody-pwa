import {
  useNotification,
  type NotificationsOptions,
} from "@kyvg/vue3-notification";
import { getTranslatedMessage } from "@/helpers";

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
} => {
  const { notify } = useNotification();
  const baseDuration: number = 10000;

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
      ...extraOptions,
    });
  };

  return {
    displaySuccessNotification,
    displayWarningNotification,
    displayErrorNotification,
  };
};
