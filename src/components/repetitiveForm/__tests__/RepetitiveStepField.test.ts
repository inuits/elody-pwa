import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import {
  Entitytyping,
  EntityPickerMode,
  EntityPickerSearchMode,
} from "@/generated-types/queries";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import RepetitiveCreateButton from "@/components/repetitiveForm/RepetitiveCreateButton.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({}),
  useRoute: () => ({
    name: "TestRoute",
    path: "/test",
    fullPath: "/test",
    meta: {},
    params: {},
    query: {},
  }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
const { mockGetForm } = vi.hoisted(() => ({
  mockGetForm: vi.fn(() => undefined as any),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: mockGetForm }),
}));

const expressionStep = () => ({
  key: "expression",
  entityType: Entitytyping.Expression,
  createForm: "GetExpressionCreationForm",
  pickerQuery: "GetExpressionsForPicker",
  pickerFiltersQuery: "GetExpressionsForPickerFilters",
});

const scopeFilter = {
  type: "selection",
  key: ["elody:1|relations.refWork.key"],
  value: ["work-1"],
  match_exact: true,
};

const getDefaultProps = () => ({
  step: expressionStep(),
  scopeFilter,
  skipSearch: false,
  createPrefill: { relationValues: { refWork: [{ key: "work-1" }] } },
  pickerParentUuid: "work-1",
});

const getWrapper = (props = getDefaultProps()) =>
  shallowMount(RepetitiveStepField, {
    props,
    global: { mocks: { $t: (k: string) => k }, renderStubDefaultSlot: true },
  });

const pickerView = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.find("[data-testid='repetitive-step-picker']");
const createView = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.find("[data-testid='repetitive-step-create']");

// the create-new button now lives in RepetitiveCreateButton; choosing a type
// (emit "select") switches the field into the create view
const chooseCreateType = async (
  wrapper: ReturnType<typeof getWrapper>,
  type: any = {
    label: "x",
    entityType: Entitytyping.Expression,
    createForm: "GetExpressionCreationForm",
  },
) => {
  wrapper.findComponent(RepetitiveCreateButton).vm.$emit("select", type);
  await wrapper.vm.$nextTick();
};

describe("RepetitiveStepField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetForm.mockReturnValue(undefined as any);
  });

  it("shows the picker view immediately when search is not skipped", () => {
    const wrapper = getWrapper();
    expect(pickerView(wrapper).exists()).toBe(true);
    expect(createView(wrapper).exists()).toBe(false);
  });

  it("shows the create view immediately when skipSearch is true", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    expect(createView(wrapper).exists()).toBe(true);
    expect(pickerView(wrapper).exists()).toBe(false);
  });

  it("passes derived picker props to EntityPickerComponent", () => {
    const wrapper = getWrapper();
    const picker = wrapper.findComponent(EntityPickerComponent);
    expect(picker.props("acceptedTypes")).toEqual([Entitytyping.Expression]);
    expect(picker.props("customQuery")).toBe("GetExpressionsForPicker");
    expect(picker.props("computedFilters")).toEqual([scopeFilter]);
    expect(picker.props("entityPickerMode")).toBe(EntityPickerMode.Emit);
    // a picker in a modal must not inherit the route's saved filter state
    expect(picker.props("shouldUseStateForRoute")).toBe(false);
  });

  it("passes the step's entityPickerSearchConfig to the picker's search props", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      step: {
        ...expressionStep(),
        entityPickerSearchConfig: {
          mode: EntityPickerSearchMode.Search,
          metadataKeys: ["podiumnet:1|properties.email.value"],
          acceptedTypes: ["user"],
          staticFilters: [],
        },
      },
    });
    const picker = wrapper.findComponent(EntityPickerComponent);
    expect(picker.props("searchMode")).toBe(EntityPickerSearchMode.Search);
    expect(picker.props("searchMetadataKeys")).toEqual([
      "podiumnet:1|properties.email.value",
    ]);
    expect(picker.props("searchAcceptedTypes")).toEqual(["user"]);
  });

  it("falls back to the picker's default (Filters) search mode when the step has no entityPickerSearchConfig", () => {
    const wrapper = getWrapper();
    const picker = wrapper.findComponent(EntityPickerComponent);
    expect(picker.props("searchMode")).toBe(EntityPickerSearchMode.Filters);
  });

  it("passes the step's maxSelection to the picker as its selection limit", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      step: { ...expressionStep(), maxSelection: 1 },
    });
    expect(
      wrapper.findComponent(EntityPickerComponent).props("selectionLimit"),
    ).toBe(1);
  });

  it("emits selected when the picker emits entitiesSelected", async () => {
    const wrapper = getWrapper();
    wrapper
      .findComponent(EntityPickerComponent)
      .vm.$emit("entitiesSelected", [
        { id: "expr-1", value: "Chamber of Secrets" },
      ]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("selected")?.[0]).toEqual([
      { id: "expr-1", label: "Chamber of Secrets", details: [] },
    ]);
  });

  it("derives a label and details from the picked item's teaser metadata", async () => {
    const wrapper = getWrapper();
    wrapper.findComponent(EntityPickerComponent).vm.$emit("entitiesSelected", [
      {
        id: "expr-1",
        teaserMetadata: [
          { label: "metadata.labels.title", key: "computed_title" },
          { label: "metadata.labels.record-type", key: "record_type" },
        ],
        intialValues: { computed_title: "Kamer", record_type: "tekst" },
      },
    ]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("selected")?.[0]).toEqual([
      {
        id: "expr-1",
        label: "Kamer",
        details: [{ label: "metadata.labels.record-type", value: "tekst" }],
        values: { computed_title: "Kamer", record_type: "tekst" },
      },
    ]);
  });

  it("renders the create-new button above the picker, mirroring back-to-search", () => {
    const wrapper = getWrapper();
    const row = wrapper.find("[data-testid='repetitive-step-actions']");
    // the create button lives in the actions row, before the picker
    expect(row.findComponent(RepetitiveCreateButton).exists()).toBe(true);
    expect(pickerView(wrapper).findComponent(EntityPickerComponent).exists()).toBe(true);
  });

  it("renders the actions slot on the same row as its own buttons in both views", async () => {
    const wrapper = shallowMount(RepetitiveStepField, {
      props: getDefaultProps(),
      slots: { actions: "<button data-testid='external-back' />" },
      global: { mocks: { $t: (k: string) => k }, renderStubDefaultSlot: true },
    });
    const pickRow = wrapper.find("[data-testid='repetitive-step-actions']");
    expect(pickRow.find("[data-testid='external-back']").exists()).toBe(true);
    expect(pickRow.findComponent(RepetitiveCreateButton).exists()).toBe(true);

    await chooseCreateType(wrapper);
    const createRow = wrapper.find("[data-testid='repetitive-step-actions']");
    expect(createRow.find("[data-testid='external-back']").exists()).toBe(true);
    expect(createRow.find("[data-testid='repetitive-step-back-to-search']").exists()).toBe(true);
  });

  it("includes the picked item's intialValues in the selected payload", async () => {
    const wrapper = getWrapper();
    wrapper.findComponent(EntityPickerComponent).vm.$emit("entitiesSelected", [
      { id: "expr-1", intialValues: { record_type: "tekst" } },
    ]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("selected")?.[0]?.[0]).toMatchObject({
      id: "expr-1",
      values: { record_type: "tekst" },
    });
  });

  it("switches from picker to create when a type is chosen", async () => {
    const wrapper = getWrapper();
    await chooseCreateType(wrapper);
    expect(pickerView(wrapper).exists()).toBe(false);
    expect(createView(wrapper).exists()).toBe(true);
  });

  it("returns from create to the picker via the back-to-search button", async () => {
    const wrapper = getWrapper();
    await chooseCreateType(wrapper);
    await wrapper
      .find("[data-testid='repetitive-step-back-to-search']")
      .trigger("click");
    expect(pickerView(wrapper).exists()).toBe(true);
  });

  it("passes the step's creatableTypes to the create button", () => {
    const creatableTypes = [
      { label: "a", entityType: Entitytyping.Reading, createForm: "GetReadingForm" },
      { label: "b", entityType: Entitytyping.Watching, createForm: "GetWatchingForm" },
    ];
    const wrapper = getWrapper({
      ...getDefaultProps(),
      step: { ...expressionStep(), creatableTypes },
    });
    expect(
      wrapper.findComponent(RepetitiveCreateButton).props("types"),
    ).toEqual(creatableTypes);
  });

  it("auto-picks the creatable type from the parent value (no chooser)", () => {
    // the parent (e.g. boekenbank) decides the subtype via expression_type
    mockGetForm.mockReturnValue({
      values: { intialValues: { expression_type: "listening" } },
    } as any);
    const listening = {
      label: "b",
      entityType: "listening",
      createForm: "GetListeningForm",
    };
    const wrapper = getWrapper({
      ...getDefaultProps(),
      step: {
        ...expressionStep(),
        creatableTypeFromParentKey: "expression_type",
        creatableTypes: [
          { label: "a", entityType: "reading", createForm: "GetReadingForm" },
          listening,
          { label: "c", entityType: "easy_reading", createForm: "GetEasyReadingForm" },
        ],
      } as any,
    });
    // only the parent-decided type is offered → the button shows no dropdown
    expect(
      wrapper.findComponent(RepetitiveCreateButton).props("types"),
    ).toEqual([listening]);
  });

  it("keeps all creatable types when the parent value matches none", () => {
    mockGetForm.mockReturnValue({
      values: { intialValues: { expression_type: "nope" } },
    } as any);
    const creatableTypes = [
      { label: "a", entityType: "reading", createForm: "GetReadingForm" },
      { label: "b", entityType: "listening", createForm: "GetListeningForm" },
    ];
    const wrapper = getWrapper({
      ...getDefaultProps(),
      step: {
        ...expressionStep(),
        creatableTypeFromParentKey: "expression_type",
        creatableTypes,
      } as any,
    });
    expect(
      wrapper.findComponent(RepetitiveCreateButton).props("types"),
    ).toEqual(creatableTypes);
  });

  it("renders the chosen type's create form", async () => {
    const wrapper = getWrapper();
    await chooseCreateType(wrapper, {
      label: "Watching",
      entityType: Entitytyping.Watching,
      createForm: "GetWatchingCreationForm",
    });
    expect(wrapper.findComponent(DynamicForm).props("dynamicFormQuery")).toBe(
      "GetWatchingCreationForm",
    );
  });

  it("shows the type chooser in the create view when search is skipped and there are multiple types", () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      skipSearch: true,
      step: {
        ...expressionStep(),
        creatableTypes: [
          { label: "a", entityType: Entitytyping.Reading, createForm: "GetReadingForm" },
          { label: "b", entityType: Entitytyping.Watching, createForm: "GetWatchingForm" },
        ],
      },
    });
    // no type chosen yet → the chooser is shown instead of a form
    expect(createView(wrapper).exists()).toBe(true);
    expect(wrapper.findComponent(DynamicForm).exists()).toBe(false);
    expect(wrapper.findComponent(RepetitiveCreateButton).exists()).toBe(true);
  });

  it("hides the back-to-search button when search is skipped", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    expect(
      wrapper.find("[data-testid='repetitive-step-back-to-search']").exists(),
    ).toBe(false);
  });

  it("passes the create form query, prefill and emit flag to DynamicForm", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    const form = wrapper.findComponent(DynamicForm);
    expect(form.props("dynamicFormQuery")).toBe("GetExpressionCreationForm");
    expect(form.props("prefilledFormValues")).toEqual({
      relationValues: { refWork: [{ key: "work-1" }] },
    });
    // the flow must receive the created entity instead of navigating away
    expect(form.props("emitEntityCreated")).toBe(true);
  });

  it("remounts DynamicForm per chosen type so a reused create view gets fresh form state", () => {
    // string literal entity type: the test env's mocked Entitytyping enum
    // omits these members, so a literal keeps the key assertion meaningful
    const wrapper = getWrapper({
      ...getDefaultProps(),
      skipSearch: true,
      step: { ...expressionStep(), entityType: "reading" },
    });
    // single fallback type → keyed by step key and the entity type
    expect(wrapper.findComponent(DynamicForm).vm.$.vnode.key).toBe(
      "expression:reading",
    );
  });

  it("emits created with the chosen entity type when DynamicForm emits entityCreated", async () => {
    const wrapper = getWrapper({
      ...getDefaultProps(),
      skipSearch: true,
      step: {
        ...expressionStep(),
        creatableTypes: [
          { label: "Watching", entityType: "watching", createForm: "GetWatchingForm" },
          { label: "Reading", entityType: "reading", createForm: "GetReadingForm" },
        ],
      },
    });
    await chooseCreateType(wrapper, {
      label: "Watching",
      entityType: "watching",
      createForm: "GetWatchingForm",
    });
    wrapper.findComponent(DynamicForm).vm.$emit("entityCreated", { id: "expr-9" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("created")?.[0]).toEqual([
      { id: "expr-9" },
      "watching",
    ]);
  });

  const metadataOnlyStep = () => ({
    key: "role",
    entityType: Entitytyping.User,
    createForm: "GetContactPersonRoleFieldsForm",
    metadataOnly: true,
  });

  it("renders only the fields form for a metadataOnly step, skipping the picker/create views", () => {
    const wrapper = getWrapper({ ...getDefaultProps(), step: metadataOnlyStep() });
    expect(wrapper.find("[data-testid='repetitive-step-metadata']").exists()).toBe(true);
    expect(pickerView(wrapper).exists()).toBe(false);
    expect(createView(wrapper).exists()).toBe(false);
    const form = wrapper.findComponent(DynamicForm);
    expect(form.props("dynamicFormQuery")).toBe("GetContactPersonRoleFieldsForm");
    expect(form.props("skipEntityMutation")).toBe(true);
  });

  it("emits metadataSubmitted with the values when the metadataOnly form submits", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), step: metadataOnlyStep() });
    wrapper
      .findComponent(DynamicForm)
      .vm.$emit("valuesSubmitted", { role: "booker_admin", function: "Coordinator" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("metadataSubmitted")?.[0]).toEqual([
      { role: "booker_admin", function: "Coordinator" },
    ]);
  });

  it("renders the actions slot for a metadataOnly step", () => {
    const wrapper = shallowMount(RepetitiveStepField, {
      props: { ...getDefaultProps(), step: metadataOnlyStep() },
      slots: { actions: "<button data-testid='external-back' />" },
      global: { mocks: { $t: (k: string) => k }, renderStubDefaultSlot: true },
    });
    expect(wrapper.find("[data-testid='external-back']").exists()).toBe(true);
  });

  it("resets the view to the picker when the step changes", async () => {
    const wrapper = getWrapper();
    await chooseCreateType(wrapper);
    expect(createView(wrapper).exists()).toBe(true);
    await wrapper.setProps({
      step: { ...expressionStep(), key: "another-step" },
    });
    await wrapper.vm.$nextTick();
    expect(pickerView(wrapper).exists()).toBe(true);
  });
});
