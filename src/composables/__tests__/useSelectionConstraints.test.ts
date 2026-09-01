import { describe, it, expect } from "vitest";
import { determineSelectionConstraintViolation } from "../useSelectionConstraints";
import type { InBulkProcessableItem } from "../useBulkOperations";

const item = (id: string, type?: string): InBulkProcessableItem => ({ id, type });

const person = (id: string) => item(id, "person");

describe("determineSelectionConstraintViolation", () => {
  it("reports no violation when the operation declares no constraints", () => {
    expect(
      determineSelectionConstraintViolation(undefined, [person("1")]),
    ).toBeUndefined();
  });

  it("reports no violation for a selection that satisfies every constraint", () => {
    expect(
      determineSelectionConstraintViolation(
        { requiresSameType: true, minSelectedItems: 2, maxSelectedItems: 2 },
        [person("1"), person("2")],
      ),
    ).toBeUndefined();
  });

  describe("selection size", () => {
    it("reports too few items below the minimum", () => {
      expect(
        determineSelectionConstraintViolation({ minSelectedItems: 2 }, [
          person("1"),
        ]),
      ).toBe("too-few-items");
    });

    it("reports too many items above the maximum", () => {
      expect(
        determineSelectionConstraintViolation({ maxSelectedItems: 2 }, [
          person("1"),
          person("2"),
          person("3"),
        ]),
      ).toBe("too-many-items");
    });
  });

  describe("same type", () => {
    it("reports mixed types when the selection spans more than one type", () => {
      expect(
        determineSelectionConstraintViolation({ requiresSameType: true }, [
          person("1"),
          item("2", "work_music"),
        ]),
      ).toBe("mixed-types");
    });

    it("treats subtypes of one abstract type as different types", () => {
      expect(
        determineSelectionConstraintViolation({ requiresSameType: true }, [
          item("1", "work_map"),
          item("2", "work_music"),
        ]),
      ).toBe("mixed-types");
    });

    it("fails closed when an item does not report its type", () => {
      // Two untyped items would otherwise look like a single type and let a
      // genuinely mixed selection through.
      expect(
        determineSelectionConstraintViolation({ requiresSameType: true }, [
          item("1"),
          item("2"),
        ]),
      ).toBe("mixed-types");
    });

    it("ignores type entirely when the operation does not require it", () => {
      expect(
        determineSelectionConstraintViolation({ requiresSameType: false }, [
          person("1"),
          item("2", "work_music"),
        ]),
      ).toBeUndefined();
    });
  });

  it("reports the size violation before the type violation", () => {
    // "Select fewer records" is the actionable message; the types may well
    // match once the selection is trimmed.
    expect(
      determineSelectionConstraintViolation(
        { requiresSameType: true, maxSelectedItems: 2 },
        [person("1"), person("2"), item("3", "work_music")],
      ),
    ).toBe("too-many-items");
  });
});
