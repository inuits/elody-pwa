import {
  useNotification,
  type NotificationOptions,
} from "@kyvg/vue3-notification";

type NotificationType = "warn" | "success" | "error" | (string & {});

export const useBaseNotification = (): {
  getSuccessNotification: (title: string, text: string) => NotificationOptions;
  getWarningNotification: (title: string, text: string) => NotificationOptions;
  getErrorNotification: (title: string, text: string) => NotificationOptions;
} => {
  const baseDuration: number = 10000;

  const getSuccessNotification = (
    title: string,
    text: string,
  ): NotificationOptions => {
    return { title, text, type: "success", duration: baseDuration };
  };

  const getWarningNotification = (
    title: string,
    text: string,
  ): NotificationOptions => {
    return { title, text, type: "warn", duration: baseDuration };
  };

  const getErrorNotification = (
    title: string,
    text: string,
  ): NotificationOptions => {
    return { title, text, type: "error", duration: baseDuration };
  };

  return {
    getSuccessNotification,
    getWarningNotification,
    getErrorNotification,
  };
};
