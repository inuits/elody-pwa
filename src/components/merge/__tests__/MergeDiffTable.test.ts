import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import MergeDiffTable from "../MergeDiffTable.vue";
import type { MergeRow } from "@/composables/useMergeDiff";

const rows: MergeRow[] = [
  { key: "name", label: "Name", leftValue: "A", rightValue: "B" },
  { key: "birth_year", label: "Birth year", leftValue: 1920, rightValue: undefined },
];

const mountTable = (props = {}) =>
  mount(MergeDiffTable, {
    props: { rows, leftLabel: "Record A", rightLabel: "Record B", ...props },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { "i18n-t": true },
    },
  });

describe("MergeDiffTable", () => {
  it("renders one row per contested field", () => {
    expect(mountTable().findAll("tbody tr")).toHaveLength(2);
  });

  it("shows both record labels as column headers", () => {
    const headers = mountTable().findAll("thead th");

    expect(headers[1].text()).toBe("Record A");
    expect(headers[2].text()).toBe("Record B");
  });

  it("shows a placeholder where a record has no value", () => {
    expect(mountTable().text()).toContain("merge-modal.empty-value");
  });

  it("selects the surviving record's value by default", () => {
    const table = mountTable();

    expect(
      table.get('[data-testid="choice-name-left"]').attributes("checked"),
    ).toBeDefined();
    expect(
      table.get('[data-testid="choice-name-right"]').attributes("checked"),
    ).toBeUndefined();
  });

  it("emits the updated choice when the other side is picked", async () => {
    const table = mountTable();

    await table.get('[data-testid="choice-name-right"]').trigger("change");

    expect(table.emitted("update:choices")?.[0]).toEqual([{ name: "right" }]);
  });

  it("keeps choices already made for other fields", async () => {
    const table = mountTable({ choices: { birth_year: "right" } });

    await table.get('[data-testid="choice-name-right"]').trigger("change");

    expect(table.emitted("update:choices")?.[0]).toEqual([
      { birth_year: "right", name: "right" },
    ]);
  });

  it("tells the user there is nothing to decide when no field differs", () => {
    const table = mountTable({ rows: [] });

    expect(table.find("table").exists()).toBe(false);
    expect(table.text()).toContain("merge-modal.no-differences");
  });

  it("renders list values as a readable list", () => {
    const table = mountTable({
      rows: [
        { key: "aliases", label: "Aliases", leftValue: ["a", "b"], rightValue: [] },
      ],
    });

    expect(table.text()).toContain("a, b");
  });
});
