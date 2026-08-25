import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { useJobStatusPolling } from "../useJobStatusPolling";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  displayPersistentNotification: vi.fn(),
  closeNotification: vi.fn(),
  displaySuccessNotification: vi.fn(),
  displayWarningNotification: vi.fn(),
  displayErrorNotification: vi.fn(),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: mocks.useQuery,
}));

vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displayPersistentNotification: mocks.displayPersistentNotification,
    closeNotification: mocks.closeNotification,
    displaySuccessNotification: mocks.displaySuccessNotification,
    displayWarningNotification: mocks.displayWarningNotification,
    displayErrorNotification: mocks.displayErrorNotification,
  }),
}));

const setup = (jobPollResult: unknown = null) => {
  const result = ref(
    jobPollResult ? { jobStatusForEntity: jobPollResult } : null,
  );
  const stop = vi.fn();
  mocks.useQuery.mockReturnValue({ result, stop });

  const options = {
    enabled: ref(true),
    entityId: ref("DL-1"),
    entityType: ref("download"),
    onJobCompleted: vi.fn(),
  };
  useJobStatusPolling(options);

  return { result, stop, options };
};

describe("useJobStatusPolling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(42);
  });

  it("passes id and type as query variables", () => {
    setup();

    const [, variablesFn] = mocks.useQuery.mock.calls[0];
    expect(variablesFn()).toEqual({ id: "DL-1", type: "download" });
  });

  it("does not enable the query when disabled", () => {
    const { options } = setup();
    options.enabled.value = false;

    const [, , optionsFn] = mocks.useQuery.mock.calls[0];
    expect(optionsFn().enabled).toBe(false);
  });

  it("polls every 10 seconds while enabled", () => {
    setup();

    const [, , optionsFn] = mocks.useQuery.mock.calls[0];
    expect(optionsFn().pollInterval).toBe(10000);
  });

  it("does not show a toast when the entity has no job", async () => {
    const { result } = setup();
    result.value = { jobStatusForEntity: { hasJob: false, jobId: null, status: null } };
    await nextTick();

    expect(mocks.displayPersistentNotification).not.toHaveBeenCalled();
  });

  it("shows a persistent in-progress toast while the job is running", async () => {
    const { result } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "running" } };
    await nextTick();

    expect(mocks.displayPersistentNotification).toHaveBeenCalledWith(
      42,
      "job-status-polling.in-progress-title",
      "job-status-polling.in-progress-description",
      "warn",
    );
  });

  it("closes the in-progress toast, shows success, and calls onJobCompleted when finished", async () => {
    const { result, stop, options } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "running" } };
    await nextTick();

    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "finished" } };
    await nextTick();

    expect(mocks.closeNotification).toHaveBeenCalledWith(42);
    expect(mocks.displaySuccessNotification).toHaveBeenCalledWith(
      "job-status-polling.finished-title",
      "job-status-polling.finished-description",
    );
    expect(options.onJobCompleted).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("shows an error toast and stops polling without calling onJobCompleted when failed", async () => {
    const { result, stop, options } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "running" } };
    await nextTick();

    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "failed" } };
    await nextTick();

    expect(mocks.displayErrorNotification).toHaveBeenCalledWith(
      "job-status-polling.failed-title",
      "job-status-polling.failed-description",
    );
    expect(options.onJobCompleted).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("shows a warning toast and calls onJobCompleted when the job finished with a warning", async () => {
    const { result, options } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "running" } };
    await nextTick();

    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "warning" } };
    await nextTick();

    expect(mocks.displayWarningNotification).toHaveBeenCalledWith(
      "job-status-polling.warning-title",
      "job-status-polling.warning-description",
    );
    expect(options.onJobCompleted).toHaveBeenCalledOnce();
  });

  it("disables the query once polling has stopped", async () => {
    const { result } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "running" } };
    await nextTick();

    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "failed" } };
    await nextTick();

    const [, , optionsFn] = mocks.useQuery.mock.calls[0];
    expect(optionsFn().enabled).toBe(false);
  });

  it("stays silent and just stops when the job was already terminal on the very first check", async () => {
    const { result, stop, options } = setup();
    result.value = { jobStatusForEntity: { hasJob: true, jobId: "job-1", status: "finished" } };
    await nextTick();

    expect(mocks.displayPersistentNotification).not.toHaveBeenCalled();
    expect(mocks.displaySuccessNotification).not.toHaveBeenCalled();
    expect(options.onJobCompleted).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalledOnce();
  });
});
