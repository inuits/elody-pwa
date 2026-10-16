import { describe, it, expect, vi } from "vitest";
import { decideLeave, leavesRecord } from "@/composables/useLeaveGuard";

const options = (overrides: Record<string, unknown> = {}) => ({
  pageEditChanged: false,
  scopeChanged: false,
  ask: vi.fn(),
  savePageEdit: vi.fn().mockResolvedValue(undefined),
  saveScope: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe("decideLeave", () => {
  it("lets the user leave without asking when nothing changed", async () => {
    const o = options();
    expect(await decideLeave(o)).toBe(true);
    expect(o.ask).not.toHaveBeenCalled();
  });

  // Leaving the page is leaving the field: it saves, as a click elsewhere does.
  it("saves a changed in-place editor without asking, and leaves", async () => {
    const o = options({ scopeChanged: true });
    expect(await decideLeave(o)).toBe(true);
    expect(o.saveScope).toHaveBeenCalled();
    expect(o.ask).not.toHaveBeenCalled();
  });

  it("stays when saving the in-place editor fails", async () => {
    const o = options({
      scopeChanged: true,
      saveScope: vi.fn().mockResolvedValue(false),
    });
    expect(await decideLeave(o)).toBe(false);
    expect(o.ask).not.toHaveBeenCalled();
  });

  it("keeps the legacy page-wide edit behaviour", async () => {
    const o = options({ pageEditChanged: true, ask: vi.fn().mockResolvedValue("secondary") });
    expect(await decideLeave(o)).toBe(true);
    expect(o.savePageEdit).toHaveBeenCalled();
    expect(o.saveScope).not.toHaveBeenCalled();
  });
});

describe("leavesRecord", () => {
  const route = (path: string, query = {}, hash = "") => ({ path, query, hash });

  it("is true when the route moves to another record", () => {
    expect(leavesRecord(route("/entities/A"), route("/entities/B"))).toBe(true);
  });

  it("is false when only the query changes (paging a related list, a tab)", () => {
    expect(
      leavesRecord(route("/entities/A", { page: "2" }), route("/entities/A", { page: "1" })),
    ).toBe(false);
  });

  it("is false when only the hash changes", () => {
    expect(leavesRecord(route("/entities/A", {}, "#x"), route("/entities/A"))).toBe(false);
  });
});
