import { Job } from '@/queries';

export type State = {
  name: 'failed' | 'pending' | 'finished';
  color: 'red-default' | 'neutral-700' | 'green-default';
  message?: string;
};

export enum Status {
  Finished = 'finished',
  Failed = 'failed',
  Pending = 'pending',
}

export enum JobType {
  All = '',
  Mediafile = 'mediafile',
  CSVImport = 'import csv',
  FileUpload = 'file_upload',
}

export const jobTypeLabels: Record<string, string> = {
  All: '',
  Mediafile: 'mediafile',
  CSVImport: 'import csv',
  FileUpload: 'file_upload',
};

const useJobHelpers = (): {
  getJobStatus: (job: Job) => State;
  getJobTypes: () => string[];
  getFormatedDate: (dateString: string) => string;
} => {
  const getJobStatus = (job: Job) => {
    switch (job.status) {
      case Status.Finished:
        return {
          name: Status.Finished,
          color: 'green-default',
          message: `finished`,
        } as State;
      case Status.Failed:
        return {
          name: Status.Failed,
          color: 'red-default',
          message: 'failed',
        } as State;
      default:
        return {
          name: Status.Pending,
          color: 'neutral-700',
          message: 'pending',
        } as State;
    }
  };

  const getJobTypes = () => {
    return Object.keys(JobType);
  };

  const getFormatedDate = (dateString: string) => {
    return new Date(dateString as string).toLocaleString();
  };

  return {
    getJobStatus,
    getJobTypes,
    getFormatedDate,
  };
};

export default useJobHelpers;
