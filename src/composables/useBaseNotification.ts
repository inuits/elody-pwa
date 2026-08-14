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
  // Design system: status 6s, warning 8s; errors never auto-dismiss.
  const baseDuration: number = 6000;
  const warningDuration: number = 8000;

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
      duration: warningDuration,
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
      duration: -1,
      ...extraOptions,
    });
  };

  return {
    displaySuccessNotification,
    displayWarningNotification,
    displayErrorNotification,
  };
};
