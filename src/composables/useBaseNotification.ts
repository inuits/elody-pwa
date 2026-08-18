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
  displayUndoNotification: (
    text: string,
    actionLabel: string,
    onAction: () => void,
  ) => void;
} => {
  const { notify } = useNotification();
  // feedback.md: status 6s, warn and undoable 8s; errors never auto-dismiss.
  const statusDuration = 6000;
  const warnDuration = 8000;

  const displaySuccessNotification = (
    title: string,
    text: string,
    extraOptions: NotificationsOptions = {},
  ): void => {
    notify({
      title: getTranslatedMessage(title),
      text: getTranslatedMessage(text),
      type: "success",
      duration: statusDuration,
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
      duration: warnDuration,
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

  /**
   * The undo-toast, for removals only — the row is gone, so there is nothing
   * to attach the inline chip to (feedback.md §Round 2).
   */
  const displayUndoNotification = (
    text: string,
    actionLabel: string,
    onAction: () => void,
  ): void => {
    notify({
      text: getTranslatedMessage(text),
      type: "success",
      duration: warnDuration,
      data: { actionLabel, onAction },
    });
  };

  return {
    displaySuccessNotification,
    displayWarningNotification,
    displayErrorNotification,
    displayUndoNotification,
  };
};
