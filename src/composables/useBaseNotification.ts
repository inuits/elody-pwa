import {
  useNotification,
  type NotificationOptions,
} from "@kyvg/vue3-notification";
import { getTranslatedMessage } from "@/helpers";

type NotificationType = "warn" | "success" | "error" | (string & {});

export const useBaseNotification = (): {
  dispalySuccessNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationOptions,
  ) => void;
  dispayWarningNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationOptions,
  ) => void;
  displayErrorNotification: (
    title: string,
    text: string,
    extraOptions?: NotificationOptions,
  ) => void;
} => {
  const { notify } = useNotification();
  const baseDuration: number = 10000;

  const displaySuccessNotification = (
    title: string,
    text: string,
    extraOptions: NotificationOptions = {},
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "success",
      duration: baseDuration,
      ...extraOptions,
    });
  };

  const dispalyWarningNotification = (
    title: string,
    text: string,
    extraOptions: NotificationOptions = {},
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
    extraOptions: NotificationOptions = {},
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
    dispalyWarningNotification,
    displayErrorNotification,
  };
};
