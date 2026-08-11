import { describe, it, expect, afterEach } from "vitest";
import { useBlockingLoader } from "../useBlockingLoader";

// The composable is a module-level singleton, so each test has to hand back
// whatever it started rather than relying on a fresh module per test.
afterEach(() => {
  const { isBlocking, stopBlocking } = useBlockingLoader();
  while (isBlocking.value) stopBlocking();
});

describe("useBlockingLoader", () => {
  it("starts blocking with an optional message", () => {
    const { isBlocking, blockingMessage, startBlocking } = useBlockingLoader();

    startBlocking("Reordering entities...");

    expect(isBlocking.value).toBe(true);
    expect(blockingMessage.value).toBe("Reordering entities...");
  });

  it("stops blocking and clears the message", () => {
    const { isBlocking, blockingMessage, startBlocking, stopBlocking } =
      useBlockingLoader();

    startBlocking("Reordering entities...");
    stopBlocking();

    expect(isBlocking.value).toBe(false);
    expect(blockingMessage.value).toBeUndefined();
  });

  it("shares state across every call site", () => {
    const first = useBlockingLoader();
    const second = useBlockingLoader();

    first.startBlocking();

    expect(second.isBlocking.value).toBe(true);
  });

  it("keeps blocking until every concurrent operation has stopped", () => {
    const { isBlocking, startBlocking, stopBlocking } = useBlockingLoader();

    startBlocking("First");
    startBlocking("Second");
    stopBlocking();

    expect(isBlocking.value).toBe(true);

    stopBlocking();

    expect(isBlocking.value).toBe(false);
  });

  it("lets the outermost operation own the message", () => {
    const { blockingMessage, startBlocking, stopBlocking } =
      useBlockingLoader();

    startBlocking("First");
    startBlocking("Second");

    expect(blockingMessage.value).toBe("First");

    stopBlocking();
    stopBlocking();
    startBlocking();

    expect(blockingMessage.value).toBeUndefined();
  });

  it("does not go negative when stopped more often than started", () => {
    const { isBlocking, startBlocking, stopBlocking } = useBlockingLoader();

    stopBlocking();
    startBlocking();
    stopBlocking();

    expect(isBlocking.value).toBe(false);
  });
});
