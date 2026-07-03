import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import {
  Entitytyping,
  RepetitiveRelationTrigger,
} from "@/generated-types/queries";
import { useRepetitiveForm } from "@/composables/useRepetitiveForm";
import RepetitiveFlow from "@/components/repetitiveForm/RepetitiveFlow.vue";

vi.mock("vue-router", () => ({ useRouter: () => ({}), useRoute: () => ({}) }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}|${params.current}/${params.total}|${params.label}` : key,
  }),
}));
const manageMocks = vi.hoisted(() => ({
  createEntity: vi.fn(),
  addRelations: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({
    createEntity: manageMocks.createEntity,
    addRelations: manageMocks.addRelations,
  }),
}));
vi.mock("@/composables/useEntityPickerModal", () => ({
  default: () => ({ setEntityId: vi.fn(), setDynamicFormId: vi.fn() }),
}));
const confirmMocks = vi.hoisted(() => ({
  confirm: vi.fn(),
}));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({
    confirm: confirmMocks.confirm,
  }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({}),
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
    template: "<div data-testid='step-field'><slot name='actions' /></div>",
  },
}));
vi.mock("@/components/repetitiveForm/RepetitiveOverview.vue", () => ({
  default: {
    name: "RepetitiveOverview",
    props: ["branches", "steps", "repeatable"],
    emits: ["add-another", "finish", "remove"],
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
      relations: [{ to: "work", relationType: "refWork", createWhen: RepetitiveRelationTrigger.OnCreate }],
    },
  ],
  finalize: {
    label: "repetitiveForm.finalize-omnibus",
    entityType: Entitytyping.Manifestation,
    createForm: "GetManifestationCreationForm",
    relations: [
      { toAllOf: "expression", relationType: "refExpressions", createWhen: RepetitiveRelationTrigger.OnFinalize },
    ],
  },
});

const getWrapper = () =>
  shallowMount(RepetitiveFlow, {
    props: { open: true, config: omnibusConfig() },
    global: {
      mocks: { $t: (k: string) => k },
      renderStubDefaultSlot: true,
      // render the mocked step field for real so its named `actions` slot
      // (which now hosts the flow's back button) is part of the DOM
      stubs: { RepetitiveStepField: false },
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
  await flushPromises();
  field(w).vm.$emit("selected", { id: "expr-1" });
  await flushPromises();
};

describe("RepetitiveFlow", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
    confirmMocks.confirm.mockReset();
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

  it("shows the back button by default (no showBackButton on the step)", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    expect(wrapper.find("[data-testid='repetitive-flow-back']").exists()).toBe(true);
  });

  it("hides the back button when the step sets showBackButton: false", async () => {
    const config = {
      label: "repetitiveForm.omnibus-title",
      repeatable: true,
      steps: [
        {
          key: "work",
          label: "repetitiveForm.step-work",
          entityType: Entitytyping.Work,
          createForm: "GetWorkCreationForm",
          showBackButton: false,
        },
        {
          key: "expression",
          entityType: Entitytyping.Expression,
          createForm: "GetExpressionCreationForm",
        },
      ],
    };
    const wrapper = shallowMount(RepetitiveFlow, {
      props: { open: true, config },
      global: {
        mocks: { $t: (k: string) => k },
        renderStubDefaultSlot: true,
        stubs: { RepetitiveStepField: false },
      },
    });
    await startBranch(wrapper);
    expect(field(wrapper).props("step").key).toBe("work");
    expect(wrapper.find("[data-testid='repetitive-flow-back']").exists()).toBe(false);
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
    await flushPromises();
    expect(useRepetitiveForm().currentStepIndex.value).toBe(1);
    expect(field(wrapper).props("step").key).toBe("expression");
    expect(field(wrapper).props("scopeFilter")).toEqual({
      type: "selection",
      key: ["elody:1|relations.refWork.key"],
      value: ["work-1"],
      match_exact: true,
    });
  });

  it("records a created entity with a derived label and details, then advances", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    field(wrapper).vm.$emit("created", {
      id: "work-9",
      intialValues: { title: "Mooi werk", record_type: "tekst" },
    });
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().currentBranch.value.entities.work).toEqual({
      key: "work",
      id: "work-9",
      type: Entitytyping.Work,
      label: "Mooi werk",
      details: [{ label: "record_type", value: "tekst" }],
      values: { title: "Mooi werk", record_type: "tekst" },
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

  it("goes back from the second step to the first via the back button", async () => {
    const wrapper = getWrapper();
    await startBranch(wrapper);
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await flushPromises();
    expect(field(wrapper).props("step").key).toBe("expression");
    await wrapper.find("[data-testid='repetitive-flow-back']").trigger("click");
    expect(field(wrapper).props("step").key).toBe("work");
    expect(overview(wrapper).exists()).toBe(false);
  });

  it("goes back from the first step to the overview, discarding the branch in progress", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    await startBranch(wrapper);
    field(wrapper).vm.$emit("selected", { id: "work-2" });
    await flushPromises();
    await wrapper.find("[data-testid='repetitive-flow-back']").trigger("click");
    await wrapper.find("[data-testid='repetitive-flow-back']").trigger("click");
    expect(overview(wrapper).exists()).toBe(true);
    // the half-finished branch is discarded; the completed one remains
    expect(useRepetitiveForm().branches.value).toHaveLength(1);
    expect(useRepetitiveForm().currentBranch.value.entities).toEqual({});
  });

  it("removes a staged branch when the overview emits remove", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    overview(wrapper).vm.$emit("remove", 0);
    await wrapper.vm.$nextTick();
    expect(useRepetitiveForm().branches.value).toHaveLength(0);
    expect(overview(wrapper).props("branches")).toHaveLength(0);
  });

  it("returns to the overview from the finalize view via the back button", async () => {
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    overview(wrapper).vm.$emit("finish");
    await wrapper.vm.$nextTick();
    expect(form(wrapper).exists()).toBe(true);
    await wrapper
      .find("[data-testid='repetitive-flow-back-to-overview']")
      .trigger("click");
    expect(form(wrapper).exists()).toBe(false);
    expect(overview(wrapper).exists()).toBe(true);
  });

  it("asks for confirmation before closing once a branch has been staged", async () => {
    confirmMocks.confirm.mockResolvedValue("confirm");
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    modal(wrapper).vm.$emit("close");
    await flushPromises();
    expect(confirmMocks.confirm).toHaveBeenCalledTimes(1);
    expect(confirmMocks.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: "confirm.close-guided-flow.title" }),
    );
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("does not close when user cancels the confirmation", async () => {
    confirmMocks.confirm.mockResolvedValue("cancel");
    const wrapper = getWrapper();
    await completeOneBranch(wrapper);
    modal(wrapper).vm.$emit("close");
    await flushPromises();
    expect(confirmMocks.confirm).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("close")).toBeFalsy();
  });

  it("closes immediately without confirmation when nothing is staged", async () => {
    const wrapper = getWrapper();
    modal(wrapper).vm.$emit("close");
    await wrapper.vm.$nextTick();
    expect(confirmMocks.confirm).not.toHaveBeenCalled();
    expect(wrapper.emitted("close")).toBeTruthy();
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

const linearConfig = () => ({
  label: "repetitiveForm.linear-title",
  repeatable: false,
  linear: true,
  routeToStep: "work",
  steps: [
    { key: "work", label: "repetitiveForm.step-work", entityType: Entitytyping.Work, createForm: "GetWorkForm" },
    {
      key: "expression",
      label: "repetitiveForm.step-expression",
      entityType: Entitytyping.Expression,
      createForm: "GetExpressionForm",
      relations: [{ to: "work", relationType: "refWork", createWhen: RepetitiveRelationTrigger.Always }],
    },
    {
      key: "manifestation",
      label: "repetitiveForm.step-manifestation",
      entityType: Entitytyping.Manifestation,
      createForm: "GetManifestationForm",
      relations: [{ to: "expression", relationType: "refExpressions", createWhen: RepetitiveRelationTrigger.Always }],
    },
  ],
});

const getLinearWrapper = () =>
  shallowMount(RepetitiveFlow, {
    props: { open: true, config: linearConfig() },
    global: {
      mocks: { $t: (k: string) => k },
      renderStubDefaultSlot: true,
      stubs: { RepetitiveStepField: false },
    },
  });

describe("RepetitiveFlow — linear mode", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
  });

  it("opens directly on the first step (no overview) when linear", () => {
    const wrapper = getLinearWrapper();
    expect(overview(wrapper).exists()).toBe(false);
    expect(field(wrapper).exists()).toBe(true);
    expect(field(wrapper).props("step").key).toBe("work");
  });

  it("advances through the three steps and emits finished with the route target (work)", async () => {
    const wrapper = getLinearWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await flushPromises();
    expect(field(wrapper).props("step").key).toBe("expression");
    field(wrapper).vm.$emit("selected", { id: "expr-1" });
    await flushPromises();
    expect(field(wrapper).props("step").key).toBe("manifestation");
    field(wrapper).vm.$emit("selected", { id: "manif-1" });
    await flushPromises();
    expect(wrapper.emitted("finished")?.[0]?.[0]).toMatchObject({
      id: "work-1",
      type: Entitytyping.Work,
    });
    expect(overview(wrapper).exists()).toBe(false);
  });

  it("creating the entity at the last step also finishes and routes to the target", async () => {
    const wrapper = getLinearWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await flushPromises();
    field(wrapper).vm.$emit("selected", { id: "expr-1" });
    await flushPromises();
    expect(field(wrapper).props("step").key).toBe("manifestation");
    // create (rather than select) the final manifestation
    field(wrapper).vm.$emit("created", { id: "manif-9", intialValues: { title: "New" } });
    await flushPromises();
    expect(wrapper.emitted("finished")?.[0]?.[0]).toMatchObject({
      id: "work-1",
      type: Entitytyping.Work,
    });
  });

  it("does not add relations after create — the relation rides on the create prefill", async () => {
    manageMocks.addRelations.mockClear();
    const wrapper = getLinearWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await flushPromises();
    // the expression create form is prefilled with the refWork relation, so the
    // single create call links it; no extra (replacing) relation call is made
    expect(field(wrapper).props("createPrefill")).toEqual({
      relationValues: {
        refWork: [{ key: "work-1", type: "refWork", editStatus: "new" }],
      },
    });
    field(wrapper).vm.$emit("created", { id: "expr-9", intialValues: { title: "E" } });
    await flushPromises();
    expect(manageMocks.addRelations).not.toHaveBeenCalled();
  });

  it("resets the store and local state when the modal closes", async () => {
    const wrapper = getLinearWrapper();
    field(wrapper).vm.$emit("selected", { id: "work-1" });
    await flushPromises();
    expect(useRepetitiveForm().currentBranch.value.entities.work).toBeTruthy();

    await wrapper.setProps({ open: false });
    await flushPromises();

    expect(useRepetitiveForm().flowConfig.value).toBeNull();
    expect(useRepetitiveForm().currentBranch.value.entities).toEqual({});
    expect(useRepetitiveForm().currentStepIndex.value).toBe(0);
    expect(useRepetitiveForm().branches.value).toEqual([]);
  });
});

const bulkConfig = () => ({
  label: "repetitiveForm.bulk-works-title",
  repeatable: true,
  steps: [
    {
      key: "work",
      label: "repetitiveForm.step-work",
      entityType: Entitytyping.Work,
      createForm: "GetWorkForm",
      // no pickerQuery → create-only (nothing to search)
      creatableTypes: [
        { label: "x", entityType: Entitytyping.Work, createForm: "GetWorkForm" },
      ],
    },
  ],
  // no finalize
});

const getBulkWrapper = () =>
  shallowMount(RepetitiveFlow, {
    props: { open: true, config: bulkConfig() },
    global: {
      mocks: { $t: (k: string) => k },
      renderStubDefaultSlot: true,
      stubs: { RepetitiveStepField: false },
    },
  });

describe("RepetitiveFlow — create-only / no finalize", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
  });

  it("treats a step without a pickerQuery as create-only (skipSearch)", async () => {
    const wrapper = getBulkWrapper();
    overview(wrapper).vm.$emit("add-another");
    await wrapper.vm.$nextTick();
    expect(field(wrapper).props("step").key).toBe("work");
    expect(field(wrapper).props("skipSearch")).toBe(true);
  });

  it("closes the flow on finish when there is no finalize config", async () => {
    const wrapper = getBulkWrapper();
    overview(wrapper).vm.$emit("add-another");
    await wrapper.vm.$nextTick();
    // create the entity (persisted per-step) → branch pushed, back to overview
    field(wrapper).vm.$emit("created", { id: "work-1", intialValues: { title: "W1" } });
    await flushPromises();
    expect(overview(wrapper).exists()).toBe(true);
    expect(useRepetitiveForm().branches.value).toHaveLength(1);
    // finishing a flow with no finalize just closes (entities already exist)
    overview(wrapper).vm.$emit("finish");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("close")).toBeTruthy();
    expect(form(wrapper).exists()).toBe(false);
  });
});
