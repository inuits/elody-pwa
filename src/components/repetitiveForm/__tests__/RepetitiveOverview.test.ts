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
      work: {
        key: "work",
        id: "work-1",
        type: Entitytyping.Work,
        label: "Harry Potter",
        isNew: false,
        details: [{ label: "metadata.labels.author", value: "Rowling" }],
      },
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

  it("shows each staged entity's details in its row", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("metadata.labels.author");
    expect(row).toContain("Rowling");
  });

  it("renders configured overviewFields from the entity values instead of the derived details", () => {
    const wrapper = getWrapper({
      branches: [
        {
          entities: {
            work: {
              key: "work",
              id: "work-1",
              type: Entitytyping.Work,
              label: "Harry Potter",
              isNew: false,
              details: [{ label: "derived", value: "should not show" }],
              values: {
                original_headtitle: "Harry Potter", // equals label → skipped
                original_subtitle: "De gevangene",
                literary_type: "Fictie",
                refLanguages: ["Nederlands", "Engels"],
                work_type: "work_word", // not configured → not shown
              },
            },
          },
        },
      ],
      steps: [
        {
          key: "work",
          label: "repetitiveForm.step-work",
          entityType: Entitytyping.Work,
          createForm: "x",
          overviewFields: [
            { key: "original_headtitle", label: "metadata.labels.headtitle" },
            { key: "original_subtitle", label: "metadata.labels.subtitle" },
            { key: "literary_type", label: "metadata.labels.literary-type" },
            { key: "refLanguages", label: "metadata.labels.original-language" },
          ],
        },
      ],
      repeatable: true,
    });
    const row = wrapper.find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("metadata.labels.subtitle");
    expect(row).toContain("De gevangene");
    expect(row).toContain("Fictie");
    expect(row).toContain("Nederlands, Engels");
    // the configured field equal to the displayed label is not repeated
    expect(row).not.toContain("metadata.labels.headtitle");
    expect(row).not.toContain("work_type");
    expect(row).not.toContain("should not show");
  });

  it("emits remove with the row index when the row's delete button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper
      .find("[data-testid='repetitive-overview-remove']")
      .trigger("click");
    expect(wrapper.emitted("remove")?.[0]).toEqual([0]);
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
