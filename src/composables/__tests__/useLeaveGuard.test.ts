import { describe, it, expect, vi } from "vitest";
import { decideLeave } from "@/composables/useLeaveGuard";

const options = (overrides: Record<string, unknown> = {}) => ({
  pageEditChanged: false,
  scopeChanged: false,
  ask: vi.fn(),
  savePageEdit: vi.fn().mockResolvedValue(undefined),
  saveScope: vi.fn().mockResolvedValue(true),
  discardScope: vi.fn(),
  ...overrides,
});

describe("decideLeave", () => {
  it("lets the user leave without asking when nothing changed", async () => {
    const o = options();
    expect(await decideLeave(o)).toBe(true);
    expect(o.ask).not.toHaveBeenCalled();
  });

  it("asks when an in-place editor holds changes", async () => {
    const o = options({ scopeChanged: true, ask: vi.fn().mockResolvedValue("cancel") });
    expect(await decideLeave(o)).toBe(false);
    expect(o.ask).toHaveBeenCalled();
  });

  it("saves the in-place editor and leaves only when the save worked", async () => {
    const o = options({ scopeChanged: true, ask: vi.fn().mockResolvedValue("secondary") });
    expect(await decideLeave(o)).toBe(true);
    expect(o.saveScope).toHaveBeenCalled();
  });

  it("stays when saving the in-place editor fails", async () => {
    const o = options({
      scopeChanged: true,
      ask: vi.fn().mockResolvedValue("secondary"),
      saveScope: vi.fn().mockResolvedValue(false),
    });
    expect(await decideLeave(o)).toBe(false);
  });

  it("discards the in-place editor's changes when the user discards", async () => {
    const o = options({ scopeChanged: true, ask: vi.fn().mockResolvedValue("confirm") });
    expect(await decideLeave(o)).toBe(true);
    expect(o.discardScope).toHaveBeenCalled();
  });

  it("keeps the legacy page-wide edit behaviour", async () => {
    const o = options({ pageEditChanged: true, ask: vi.fn().mockResolvedValue("secondary") });
    expect(await decideLeave(o)).toBe(true);
    expect(o.savePageEdit).toHaveBeenCalled();
    expect(o.saveScope).not.toHaveBeenCalled();
  });
});
