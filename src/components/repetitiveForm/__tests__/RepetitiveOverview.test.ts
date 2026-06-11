import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const steps = [
  {
    key: "work",
    label: "repetitiveForm.step-work",
    entityType: Entitytyping.Work,
    createForm: "x",
  },
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

const getWrapper = (props: any = { branches, steps, repeatable: true }) =>
  mount(RepetitiveOverview, {
    props,
    global: { mocks: { $t: (k: string) => k }, stubs: { unicon: true } },
  });

describe("RepetitiveOverview", () => {
  it("renders one list row per staged branch", () => {
    const wrapper = getWrapper();
    expect(wrapper.findAll("[data-testid='repetitive-overview-row']")).toHaveLength(1);
  });

  it("shows the step label and each entity's label, falling back to id", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("repetitiveForm.step-work"); // configured step label
    expect(row).toContain("expression"); // step key fallback
    expect(row).toContain("Harry Potter"); // picked work → label
    expect(row).toContain("expr-1"); // created expression → no label → id
  });

  it("shows an empty-state message instead of the list when nothing is staged", () => {
    const wrapper = getWrapper({ branches: [], steps, repeatable: true });
    expect(wrapper.find("[data-testid='repetitive-overview-empty']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='repetitive-overview-list']").exists()).toBe(false);
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
    const wrapper = getWrapper({ branches: [], steps, repeatable: true });
    expect(
      wrapper.find("[data-testid='repetitive-overview-finish']").attributes("disabled"),
    ).toBeDefined();
  });

  it("hides the add button when a non-repeatable flow already has a branch", () => {
    const wrapper = getWrapper({ branches, steps, repeatable: false });
    expect(wrapper.find("[data-testid='repetitive-overview-add']").exists()).toBe(false);
  });

  it("shows the add button on an empty non-repeatable flow", () => {
    const wrapper = getWrapper({ branches: [], steps, repeatable: false });
    expect(wrapper.find("[data-testid='repetitive-overview-add']").exists()).toBe(true);
  });
});
