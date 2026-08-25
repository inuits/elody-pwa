import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch, type Ref } from "vue";
import {
  JobStatusForEntityDocument,
  type JobStatusForEntityQuery,
} from "@/generated-types/queries";
import { useBaseNotification } from "@/composables/useBaseNotification";

const POLL_INTERVAL_MS = 10000;
const TERMINAL_STATUSES = ["finished", "warning", "failed"];

export const useJobStatusPolling = (options: {
  enabled: Ref<boolean>;
  entityId: Ref<string>;
  entityType: Ref<string>;
  onJobCompleted: () => void;
}): void => {
  const {
    displayPersistentNotification,
    closeNotification,
    displaySuccessNotification,
    displayWarningNotification,
    displayErrorNotification,
  } = useBaseNotification();

  const isPollingActive = ref(true);
  const notificationId = ref<number>();
  const hasObservedInProgress = ref(false);

  const shouldPoll = computed(
    () => options.enabled.value && isPollingActive.value,
  );

  const { result, stop } = useQuery<JobStatusForEntityQuery>(
    JobStatusForEntityDocument,
    () => ({ id: options.entityId.value, type: options.entityType.value }),
    () => ({ pollInterval: POLL_INTERVAL_MS, enabled: shouldPoll.value }),
  );

  watch(
    () => result.value?.jobStatusForEntity,
    (jobPollResult) => {
      if (!jobPollResult?.hasJob) return;

      if (!TERMINAL_STATUSES.includes(jobPollResult.status ?? "")) {
        hasObservedInProgress.value = true;
        if (notificationId.value === undefined) {
          notificationId.value = Date.now();
          displayPersistentNotification(
            notificationId.value,
            "job-status-polling.in-progress-title",
            "job-status-polling.in-progress-description",
            "warn",
          );
        }
        return;
      }

      isPollingActive.value = false;
      stop();

      if (!hasObservedInProgress.value) {
        // Job was already finished/failed before we started watching —
        // nothing changed during this page visit, so stay silent.
        return;
      }

      if (notificationId.value !== undefined) {
        closeNotification(notificationId.value);
      }

      if (jobPollResult.status === "finished") {
        displaySuccessNotification(
          "job-status-polling.finished-title",
          "job-status-polling.finished-description",
        );
        options.onJobCompleted();
      } else if (jobPollResult.status === "warning") {
        displayWarningNotification(
          "job-status-polling.warning-title",
          "job-status-polling.warning-description",
        );
        options.onJobCompleted();
      } else if (jobPollResult.status === "failed") {
        displayErrorNotification(
          "job-status-polling.failed-title",
          "job-status-polling.failed-description",
        );
      }
    },
  );
};
