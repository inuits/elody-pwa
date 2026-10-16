import { describe, it, expect } from "vitest";
import { sharedColumnLabels } from "../sharedColumnLabels";

const field = (key: string, label?: string, extra = {}) =>
  ({ key, label, ...extra }) as any;

describe("sharedColumnLabels", () => {
  it("returns the labels when every row has the same fields", () => {
    const rows = [
      [field("id", "ID"), field("script", "Script")],
      [field("id", "ID"), field("script", "Script")],
    ];
    expect(sharedColumnLabels(rows)).toEqual(["ID", "Script"]);
  });

  it("returns nothing for a mixed list", () => {
    const rows = [
      [field("id", "ID"), field("script", "Script")],
      [field("id", "ID"), field("title", "Title")],
    ];
    expect(sharedColumnLabels(rows)).toBeUndefined();
  });

  it("ignores fields shown only in edit mode", () => {
    const rows = [
      [field("id", "ID"), field("order", "Order", { showOnlyInEditMode: true })],
      [field("id", "ID")],
    ];
    expect(sharedColumnLabels(rows)).toEqual(["ID"]);
  });

  it("returns nothing when no field has a label", () => {
    expect(sharedColumnLabels([[field("type")]])).toBeUndefined();
  });

  it("returns nothing for an empty page", () => {
    expect(sharedColumnLabels([])).toBeUndefined();
  });
});
