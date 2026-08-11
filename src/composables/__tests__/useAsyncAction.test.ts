import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAsyncAction } from "@/composables/useAsyncAction";

const notifySpy = vi.fn();
// the real one resolves keys through the global i18n instance, which no
// standalone composable test bootstraps
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({ displayErrorNotification: notifySpy }),
}));

beforeEach(() => {
  notifySpy.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("useAsyncAction", () => {
  it("is not busy initially", () => {
    const { isBusy } = useAsyncAction();
    expect(isBusy.value).toBe(false);
  });

  it("is busy while the action is in flight and returns its result", async () => {
    const { isBusy, run } = useAsyncAction();
    const action = deferred<string>();

    const result = run(() => action.promise);
    expect(isBusy.value).toBe(true);

    action.resolve("done");
    await expect(result).resolves.toBe("done");
    expect(isBusy.value).toBe(false);
  });

  it("reports a failing action and resets busy without rejecting", async () => {
    const { isBusy, run } = useAsyncAction();

    await expect(
      run(() => Promise.reject(new Error("boom"))),
    ).resolves.toBeUndefined();
    expect(isBusy.value).toBe(false);
    expect(notifySpy).toHaveBeenCalledWith(
      "notifications.errors.generic.title",
      "notifications.errors.generic.description",
    );
  });

  it("skips work queued after a failure inside the same action", async () => {
    const { run } = useAsyncAction();
    const afterFailure = vi.fn();

    await run(async () => {
      await Promise.reject(new Error("boom"));
      afterFailure();
    });

    expect(afterFailure).not.toHaveBeenCalled();
  });

  it("ignores a second call while the first is still running", async () => {
    const { run } = useAsyncAction();
    const action = deferred<void>();
    const secondAction = vi.fn();

    const first = run(() => action.promise);
    await run(async () => secondAction());
    expect(secondAction).not.toHaveBeenCalled();

    action.resolve();
    await first;

    await run(async () => secondAction());
    expect(secondAction).toHaveBeenCalledOnce();
  });

  it("keeps separate instances independent", async () => {
    const first = useAsyncAction();
    const second = useAsyncAction();
    const action = deferred<void>();

    const pending = first.run(() => action.promise);
    expect(second.isBusy.value).toBe(false);

    action.resolve();
    await pending;
  });
});
