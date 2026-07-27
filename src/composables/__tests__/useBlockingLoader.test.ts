import { describe, it, expect } from "vitest";
import { useBlockingLoader } from "../useBlockingLoader";

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
});
