import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionId, SESSION_ID_KEY } from "@/observability/sessionId";

describe("getSessionId", () => {
  beforeEach(() => sessionStorage.clear());

  it("makes one id per browser tab and keeps it across calls and reloads", () => {
    const first = getSessionId();
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(getSessionId()).toBe(first);
    expect(sessionStorage.getItem(SESSION_ID_KEY)).toBe(first);
  });

  it("makes a new id in a fresh tab", () => {
    const first = getSessionId();
    sessionStorage.clear();
    expect(getSessionId()).not.toBe(first);
  });

  it("still gives an id when sessionStorage cannot be used", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getSessionId()).toMatch(/^[0-9a-f-]{36}$/);
    vi.restoreAllMocks();
  });
});
