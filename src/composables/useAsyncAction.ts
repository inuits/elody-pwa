import { ref } from "vue";
import { useBaseNotification } from "@/composables/useBaseNotification";

/**
 * Tracks a single in-flight user action so a button can show a spinner and
 * reject double-submits.
 *
 * A failing action is reported to the user and swallowed: these run from
 * template handlers that cannot await, so rethrowing would only produce an
 * unhandled rejection. Callers that need to branch on failure — or that want a
 * more specific message than the generic one — should catch inside their own
 * callback; run() never sees those errors.
 */
export const useAsyncAction = () => {
  const { displayErrorNotification } = useBaseNotification();
  const isBusy = ref<boolean>(false);

  const run = async <T>(
    action: () => Promise<T> | T,
  ): Promise<T | undefined> => {
    if (isBusy.value) return undefined;
    isBusy.value = true;
    try {
      return await action();
    } catch (error) {
      console.error("Async action failed:", error);
      displayErrorNotification(
        "notifications.errors.generic.title",
        "notifications.errors.generic.description",
      );
      return undefined;
    } finally {
      isBusy.value = false;
    }
  };

  return { isBusy, run };
};
