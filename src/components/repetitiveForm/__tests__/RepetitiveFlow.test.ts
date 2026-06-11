import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import { useRepetitiveForm } from "@/composables/useRepetitiveForm";
import RepetitiveFlow from "@/components/repetitiveForm/RepetitiveFlow.vue";

vi.mock("vue-router", () => ({ useRouter: () => ({}), useRoute: () => ({}) }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}|${params.current}/${params.total}|${params.label}` : key,
  }),
}));
vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({ createEntity: vi.fn() }),
}));
vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({ setEntityId: vi.fn(), setDynamicFormId: vi.fn() }),
}));
vi.mock("@/components/repetitiveForm/RepetitiveStepModal.vue", () => ({
  default: {
    name: "RepetitiveStepModal",
    props: ["open", "title"],
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
vi.mock("@/components/repetitiveForm/RepetitiveOverview.vue", () => ({
  default: {
    name: "RepetitiveOverview",
    props: ["branches", "steps", "repeatable"],
    emits: ["add-another", "finish"],
    template: "<div data-testid='overview-stub' />",
  },
}));
vi.mock("@/components/dynamicForms/DynamicForm.vue", () => ({
  default: {
    name: "DynamicForm",
    props: ["dynamicFormQuery", "router", "prefilledFormValues", "emitEntityCreated"],
    emits: ["entityCreated"],
    template: "<div data-testid='dynamic-form-stub' />",
  },
}));

const omnibusConfig = () => ({
  label: "repetitiveForm.omnibus-title",
  repeatable: true,
  steps: [
    {
      key: "work",
      label: "repetitiveForm.step-work",
      entityType: Entitytyping.Work,
      createForm: "GetWorkCreationForm",
    },
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
    label: "repetitiveForm.finalize-omnibus",
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
    global: {
      mocks: { $t: (k: string) => k },
      renderStubDefaultSlot: true,
    },
  });

const field = (w: ReturnType<typeof getWrapper>) => w.findComponent({ name: "RepetitiveStepField" });
const overview = (w: ReturnType<typeof getWrapper>) => w.findComponent({ name: "RepetitiveOverview" });
const form = (w: ReturnType<typeof getWrapper>) => w.findComponent({ name: "DynamicForm" });
const modal = (w: ReturnType<typeof getWrapper>) => w.findComponent({ name: "RepetitiveStepModal" });

const startBranch = async (w: ReturnType<typeof getWrapper>) => {
  overview(w).vm.$emit("add-another");
  await w.vm.$nextTick();
};

const completeOneBranch = async (w: ReturnType<typeof getWrapper>) => {
  await startBranch(w);
  field(w).vm.$emit("selected", { id: "work-1" });
  await w.vm.$nextTick();
  field(w).vm.$emit("selected", { id: "expr-1" });
  await w.vm.$nextTick();
};

describe("RepetitiveFlow", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
  });

  it("initialises the flow and starts on the (empty) overview", () => {
    const wrapper = getWrapper();
    expect(useRepetitiveForm().flowConfig.value).not.toBeNull();
    expect(overview(wrapper).exists()).toBe(true);
    expect(overview(wrapper).props("branches")).toHaveLength(0);
    expect(overview(wrapper).props("repeatable")).toBe(true);
    expect(field(wrapper).exists()).toBe(false);
  });

  it("titles the modal with the configured flow label on the overview", () => {
    const wrapper = getWrapper();
    expect(modal(wrapper).props("title")).toBe("repetitiveForm.omnibus-title");
  });

  it("shows the first step field after add-another on the empty overview", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    expect(field(wrapper).exists()).toBe(true);
    expect(field(wrapper).props("step").key).toBe("work");
    expect(field(wrapper).props("scopeFilter")).toBeNull();
  });

  it("titles the modal with the step counter while in a step", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    expect(modal(wrapper).props("title")).toBe(
      "repetitiveForm.step-of|1/2|repetitiveForm.step-work",
    );
  });

  it("renders a numbered step strip with step labels during a step", async () => {
    const wrapper = getWrapper();
    expect(wrapper.find("[data-testid='repetitive-flow-steps']").exists()).toBe(false);
    await startBranch(wrapper);
    const strip = wrapper.find("[data-testid='repetitive-flow-steps']");
    expect(strip.text()).toContain("repetitiveForm.step-work");
    expect(strip.text()).toContain("expression"); // key fallback
    expect(strip.text()).toContain("1");
    expect(strip.text()).toContain("2");
  });

  it("advances to the expression step when the field emits selected, with a scope filter", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
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

  it("records a created entity with a derived label and advances", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    field(wrapper).vm.$emit("created", {
      id: "work-9",
      intialValues: { title: "Mooi werk" },
    });
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().currentBranch.value.entities.work).toEqual({
      key: "work",
      id: "work-9",
      type: Entitytyping.Work,
      label: "Mooi werk",
      isNew: true,
    });
    expect(useRepetitiveForm().currentStepIndex.value).toBe(1);
  });

  it("shows the overview after the last step completes", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    expect(useRepetitiveForm().branches.value).toHaveLength(1);
    expect(overview(wrapper).exists()).toBe(true);
    expect(overview(wrapper).props("branches")).toHaveLength(1);
  });

  it("starts a new branch when the overview emits add-another", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    overview(wrapper).vm.$emit("add-another");
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().currentStepIndex.value).toBe(0);
    expect(field(wrapper).exists()).toBe(true);
  });

  it("opens the finalize form with heading and prefilled relations on finish", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    overview(wrapper).vm.$emit("finish");
    await wrapper.vm.$nextTick();
    expect(form(wrapper).exists()).toBe(true);
    expect(form(wrapper).props("dynamicFormQuery")).toBe("GetManifestationCreationForm");
    expect(form(wrapper).props("emitEntityCreated")).toBe(true);
    expect(form(wrapper).props("prefilledFormValues")).toEqual({
      relationValues: {
        refExpressions: [{ key: "expr-1", type: "refExpressions", editStatus: "new" }],
      },
      intialValues: {},
    });
    expect(
      wrapper.find("[data-testid='repetitive-flow-finalize-heading']").text(),
    ).toBe("repetitiveForm.finalize-omnibus");
  });

  it("emits finished when the finalize form creates the manifestation", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    overview(wrapper).vm.$emit("finish");
    await wrapper.vm.$nextTick();
    form(wrapper).vm.$emit("entityCreated", { id: "manif-1" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("finished")?.[0]).toEqual([{ id: "manif-1" }]);
  });
});
