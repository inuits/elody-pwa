import { describe, it, expect } from "vitest";
import { useHistoryFieldDiff } from "../useHistoryFieldDiff";

describe("useHistoryFieldDiff", () => {
  it("tags a field that differs between current and the selected historical version", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;
    const historical = { id: "hist-1", intialValues: { significance: "Low" } } as any;

    const result = useHistoryFieldDiff(current, historical, ["significance"]);

    expect(result.selectedVersion.intialValues.significance).toEqual({
      formatter: "pill|added",
      label: "High",
    });
    expect(result.previousVersion.intialValues.significance).toEqual({
      formatter: "pill|modified",
      label: "Low",
    });
  });

  it("leaves unchanged fields untouched", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;
    const historical = { id: "hist-1", intialValues: { significance: "High" } } as any;

    const result = useHistoryFieldDiff(current, historical, ["significance"]);

    expect(result.selectedVersion.intialValues.significance).toBe("High");
  });

  it("treats a missing historical version as nothing to diff against", () => {
    const current = { id: "current", intialValues: { significance: "High" } } as any;

    const result = useHistoryFieldDiff(current, null, ["significance"]);

    expect(result.previousVersion).toEqual({});
    expect(result.selectedVersion.intialValues.significance).toBe("High");
  });
});
