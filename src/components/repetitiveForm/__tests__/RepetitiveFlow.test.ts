import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import { useRepetitiveForm } from "@/composables/useRepetitiveForm";
import RepetitiveFlow from "@/components/repetitiveForm/RepetitiveFlow.vue";

// Keep the store light and avoid pulling the heavy child import graph.
vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({ createEntity: vi.fn() }),
}));
vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({ setEntityId: vi.fn(), setDynamicFormId: vi.fn() }),
}));
vi.mock("@/components/repetitiveForm/RepetitiveStepModal.vue", () => ({
  default: {
    name: "RepetitiveStepModal",
    props: ["open"],
    emits: ["close"],
    template: "<div><slot /></div>",
  },
}));
vi.mock("@/components/repetitiveForm/RepetitiveStepField.vue", () => ({
  default: {
    name: "RepetitiveStepField",
    props: ["step", "scopeFilter", "skipSearch", "createPrefill", "pickerParentUuid"],
    emits: ["selected", "created"],
    template: "<div data-testid='step-field' />",
  },
}));

const omnibusConfig = () => ({
  repeatable: true,
  steps: [
    { key: "work", entityType: Entitytyping.Work, createForm: "GetWorkCreationForm" },
    {
      key: "expression",
      entityType: Entitytyping.Expression,
      createForm: "GetExpressionCreationForm",
      scopeToRelationOf: { step: "work", relationType: "refWork" },
      skipSearchIfPriorIsNew: true,
      relations: [{ to: "work", relationType: "refWork", createWhen: "onCreate" }],
    },
  ],
  finalize: {
    entityType: Entitytyping.Manifestation,
    createForm: "GetManifestationCreationForm",
    relations: [
      { toAllOf: "expression", relationType: "refExpressions", createWhen: "onFinalize" },
    ],
  },
});

const getWrapper = () =>
  shallowMount(RepetitiveFlow, {
    props: { open: true, config: omnibusConfig() },
    global: { mocks: { $t: (k: string) => k }, renderStubDefaultSlot: true },
  });

const field = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.findComponent({ name: "RepetitiveStepField" });

describe("RepetitiveFlow", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
  });

  it("initialises the flow and shows the first step field", () => {
    const wrapper = getWrapper();
    expect(useRepetitiveForm().flowConfig.value).not.toBeNull();
    expect(field(wrapper).exists()).toBe(true);
    expect(field(wrapper).props("step").key).toBe("work");
    expect(field(wrapper).props("scopeFilter")).toBeNull();
  });

  it("renders a step strip from the config", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("[data-testid='repetitive-flow-steps']").text()).toContain("work");
    expect(wrapper.find("[data-testid='repetitive-flow-steps']").text()).toContain("expression");
  });

  it("advances to the expression step when the field emits selected, with a scope filter", async () => {
    const wrapper = getWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1", label: "HP" });
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().currentStepIndex.value).toBe(1);
    expect(field(wrapper).props("step").key).toBe("expression");
    expect(field(wrapper).props("scopeFilter")).toEqual({
      type: "selection",
      key: ["elody:1|relations.refWork.key"],
      value: ["work-1"],
      match_exact: true,
    });
  });

  it("records a created entity and advances when the field emits created", async () => {
    const wrapper = getWrapper();
    field(wrapper).vm.$emit("created", { id: "work-9" });
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().currentBranch.value.entities.work).toEqual({
      key: "work",
      id: "work-9",
      type: Entitytyping.Work,
      label: undefined,
      isNew: true,
    });
    expect(useRepetitiveForm().currentStepIndex.value).toBe(1);
  });

  it("shows the branch-done state after the last step completes", async () => {
    const wrapper = getWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await wrapper.vm.$nextTick();
    field(wrapper).vm.$emit("selected", { id: "expr-1" });
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().branches.value).toHaveLength(1);
    expect(wrapper.find("[data-testid='repetitive-flow-branch-done']").exists()).toBe(true);
  });

  it("starts a new branch from the branch-done state", async () => {
    const wrapper = getWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await wrapper.vm.$nextTick();
    field(wrapper).vm.$emit("selected", { id: "expr-1" });
    await wrapper.vm.$nextTick();
    await wrapper.find("[data-testid='repetitive-flow-add-another']").trigger("click");
    expect(useRepetitiveForm().currentStepIndex.value).toBe(0);
    expect(field(wrapper).props("step").key).toBe("work");
  });
});
