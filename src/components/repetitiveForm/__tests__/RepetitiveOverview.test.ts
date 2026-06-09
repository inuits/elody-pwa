import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";

const steps = [
  { key: "work", entityType: Entitytyping.Work, createForm: "x" },
  { key: "expression", entityType: Entitytyping.Expression, createForm: "y" },
];

const branches = [
  {
    entities: {
      work: { key: "work", id: "work-1", type: Entitytyping.Work, label: "Harry Potter", isNew: false },
      expression: { key: "expression", id: "expr-1", type: Entitytyping.Expression, label: undefined, isNew: true },
    },
  },
];

const getWrapper = (props: any = { branches, steps }) =>
  mount(RepetitiveOverview, { props, global: { mocks: { $t: (k: string) => k } } });

describe("RepetitiveOverview", () => {
  it("renders one row per staged branch", () => {
    const wrapper = getWrapper();
    expect(wrapper.findAll("[data-testid='repetitive-overview-row']")).toHaveLength(1);
  });

  it("shows each entity's label, falling back to id when no label", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("Harry Potter"); // picked work → label
    expect(row).toContain("expr-1"); // created expression → no label → id
  });

  it("emits add-another when the add button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper.find("[data-testid='repetitive-overview-add']").trigger("click");
    expect(wrapper.emitted("add-another")).toBeTruthy();
  });

  it("emits finish when the finish button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper.find("[data-testid='repetitive-overview-finish']").trigger("click");
    expect(wrapper.emitted("finish")).toBeTruthy();
  });

  it("disables finish when there are no branches", () => {
    const wrapper = getWrapper({ branches: [], steps });
    expect(
      wrapper.find("[data-testid='repetitive-overview-finish']").attributes("disabled"),
    ).toBeDefined();
  });
});
