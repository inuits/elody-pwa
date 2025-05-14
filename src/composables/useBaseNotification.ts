import {
  useNotification,
  type NotificationOptions,
} from "@kyvg/vue3-notification";

type NotificationType = "warn" | "success" | "error" | (string & {});

const { notify } = useNotification();

export const useBaseNotification = (): {
  dispalySuccessNotification: (title: string, text: string) => void;
  dispayWarningNotification: (title: string, text: string) => void;
  displayErrorNotification: (title: string, text: string) => void;
} => {
  const baseDuration: number = 10000;

  const displaySuccessNotification = (title: string, text: string): void => {
    notify({ title, text, type: "success", duration: baseDuration });
  };

  const dispalyWarningNotification = (title: string, text: string): void => {
    notify({ title, text, type: "warn", duration: baseDuration });
  };

  const displayErrorNotification = (title: string, text: string): void => {
    notify({ title, text, type: "error", duration: baseDuration });
  };

  return {
    displaySuccessNotification,
    dispalyWarningNotification,
    displayErrorNotification,
  };
};
