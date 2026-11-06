import { describe, it, expect } from "vitest";
import { savedSearchIsModified } from "../savedSearchIsModified";

const item = (key: string, value: unknown, isActive = true, matcher = "ContainsMatcher") =>
  ({
    isActive,
    isDisplayed: true,
    advancedFilter: { key },
    inputFromState: { key, value },
    selectedMatcher: matcher,
  }) as any;

describe("savedSearchIsModified", () => {
  it("is false when the active filters match the saved ones", () => {
    expect(
      savedSearchIsModified([item("a", "x"), item("b", "y", false)], [item("a", "x")]),
    ).toBe(false);
  });

  it("is true when a value changed", () => {
    expect(savedSearchIsModified([item("a", "x")], [item("a", "z")])).toBe(true);
  });

  it("is true when a filter was added or removed", () => {
    expect(savedSearchIsModified([item("a", "x")], [item("a", "x"), item("b", "y")])).toBe(true);
    expect(savedSearchIsModified([item("a", "x"), item("b", "y")], [item("a", "x")])).toBe(true);
  });

  it("is true when the matcher changed", () => {
    expect(
      savedSearchIsModified([item("a", "x")], [item("a", "x", true, "ExactInputMatcher")]),
    ).toBe(true);
  });

  it("handles an active filter without a key, like the hidden type filter", () => {
    const typeFilter = (key: unknown) => ({
      ...item("", "production"),
      advancedFilter: { key },
      inputFromState: { type: "type", value: "production" },
    });
    expect(
      savedSearchIsModified(
        [item("a", "x"), typeFilter(undefined)],
        [typeFilter(null), item("a", "x")],
      ),
    ).toBe(false);
  });
});
