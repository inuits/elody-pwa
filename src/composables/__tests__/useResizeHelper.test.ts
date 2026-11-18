import { describe, it, expect, vi } from "vitest";
import { useColumnResizeHelper } from "@/composables/useResizeHelper";
import { ColumnSizes, type Column } from "@/generated-types/queries";

const columns = () =>
  [
    { size: ColumnSizes.Seventy, elements: {} },
    { size: ColumnSizes.Thirty, elements: {} },
  ] as unknown as Column[];

describe("useColumnResizeHelper setColumnSizes", () => {
  it("resizes both columns of a two-column entity", () => {
    const helper = useColumnResizeHelper();
    helper.setInitialColumns("entity-1", columns());
    helper.setColumnSizes("entity-1", [ColumnSizes.Fifty, ColumnSizes.Fifty]);
    expect(
      helper.currentColumnConfig.value["entity-1"].map((c) => c.size),
    ).toEqual([ColumnSizes.Fifty, ColumnSizes.Fifty]);
  });

  it("restores the configured sizes", () => {
    const helper = useColumnResizeHelper();
    helper.setInitialColumns("entity-1", columns());
    helper.setColumnSizes("entity-1", [ColumnSizes.Fifty, ColumnSizes.Fifty]);
    helper.resetToDefaultSizes("entity-1");
    expect(
      helper.currentColumnConfig.value["entity-1"].map((c) => c.size),
    ).toEqual([ColumnSizes.Seventy, ColumnSizes.Thirty]);
  });

  it("leaves the sizes alone when the size count does not match the columns", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const helper = useColumnResizeHelper();
    helper.setInitialColumns("entity-1", columns());
    helper.setColumnSizes("entity-1", [ColumnSizes.Fifty]);
    expect(
      helper.currentColumnConfig.value["entity-1"].map((c) => c.size),
    ).toEqual([ColumnSizes.Seventy, ColumnSizes.Thirty]);
    log.mockRestore();
  });
});
