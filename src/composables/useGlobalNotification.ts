import { useBaseNotification } from "./useBaseNotification";

export const useGlobalNotification = (config: any) => {
  if (config.features?.globalNotification) {
    useBaseNotification().displaySuccessNotification(
      config.features?.globalNotification.title,
      config.features?.globalNotification.description,
      { duration: -1, group: "globalNotification" },
    );
  }
};
