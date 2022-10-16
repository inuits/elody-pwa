import type { Job } from "@/queries";
import { computed, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";

export type State = {
  name: "failed" | "pending" | "finished";
  color: "red-default" | "neutral-700" | "green-default";
  message?: string;
};

export enum Status {
  Finished = "finished",
  Failed = "failed",
  Pending = "pending",
}

export const jobTypeLabels: Record<string, string> = {
  "csv import": "csv_import",
  "csv row": "csv_row_import",
  "csv read": "csv_read",
  "upload file": "upload_file",
  "upload transcode": "upload_transcode",
};

export const getJobTypes = () => {
  return Object.keys(jobTypeLabels);
};

const useJobHelpers = (
  job: Job
): {
  getJobStatus: ComputedRef<State>;
  getJobTypes: () => string[];
  getFormatedDate: ComputedRef<string>;
  } => {
  const { t } = useI18n();
  const getJobStatus = computed<State>(() => {
    switch (job.status) {
      case Status.Finished:
        return {
          name: Status.Finished,
          color: "green-default",
          message: t('job-helper.finished'),
        } as State;
      case Status.Failed:
        return {
          name: Status.Failed,
          color: "red-default",
          message: t('job-helper.failed'),
        } as State;
      default:
        return {
          name: Status.Pending,
          color: "neutral-700",
          message: t('job-helper.pending'),
        } as State;
    }
  });

  const getFormatedDate = computed<string>(() => {
    return new Date(job.start_time as string).toLocaleString();
  });

  return {
    getJobStatus,
    getJobTypes,
    getFormatedDate,
  };
};

export default useJobHelpers;
