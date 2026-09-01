import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";

// The global setup stubs t as identity, which cannot distinguish a translated
// label from a raw one. Make the call observable instead.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => `translated(${key})` }),
}));
vi.mock("@/main", () => ({
  typeUrlMapping: { mapping: {}, reverseMapping: {} },
}));
import MergeDiffTable from "../MergeDiffTable.vue";
import type { MergeRow } from "@/composables/useMergeDiff";

const rows: MergeRow[] = [
  { key: "name", label: "Name", leftValue: "A", rightValue: "B" },
  { key: "birth_year", label: "Birth year", leftValue: 1920, rightValue: undefined },
];

const mountTable = (props = {}) =>
  mount(MergeDiffTable, {
    props: {
      rows,
      leftSideInfo: { label: "Record A", id: "PERS-A", type: "person" },
      rightSideInfo: { label: "Record B", id: "PERS-B", type: "person" },
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        "i18n-t": true,
        unicon: true,
        RouterLink: RouterLinkStub,
      },
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

  it("links each column header to its own record, in a new tab", () => {
    const links = mountTable().findAllComponents(RouterLinkStub);

    expect(links[0].props("to")).toMatchObject({ params: { id: "PERS-A" } });
    expect(links[1].props("to")).toMatchObject({ params: { id: "PERS-B" } });
    expect(links[0].attributes("target")).toBe("_blank");
  });

  it("shows a placeholder where a record has no value", () => {
    expect(mountTable().text()).toContain(
      "translated(bulk-operations.merge-modal.empty-value)",
    );
  });

  it("translates the field label", () => {
    // Panel labels are translation keys (metadata.labels.created-at), not
    // display text.
    const table = mountTable({
      rows: [
        {
          key: "name",
          label: "metadata.labels.name",
          leftValue: "A",
          rightValue: "B",
        },
      ],
    });

    expect(table.text()).toContain("translated(metadata.labels.name)");
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
    expect(table.text()).toContain(
      "translated(bulk-operations.merge-modal.no-differences)",
    );
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
