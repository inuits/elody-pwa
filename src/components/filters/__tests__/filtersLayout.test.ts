import { describe, it, expect, afterEach, vi } from "vitest";
import { filtersLayout } from "@/components/filters/filtersLayout";

describe("filtersLayout", () => {
  afterEach(() => {
    localStorage.removeItem("elody.filtersLayout");
    vi.restoreAllMocks();
  });

  it("defaults to the pane inside the list panel", () => {
    expect(filtersLayout()).toBe("pane");
  });

  it("goes back to the separate rail when the browser asks for it", () => {
    localStorage.setItem("elody.filtersLayout", "rail");
    expect(filtersLayout()).toBe("rail");
  });

  it("falls back to the pane when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(filtersLayout()).toBe("pane");
  });
});
