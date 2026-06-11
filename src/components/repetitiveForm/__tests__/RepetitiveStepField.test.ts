import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Entitytyping, EntityPickerMode } from "@/generated-types/queries";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

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

describe("RepetitiveStepField", () => {
  beforeEach(() => vi.clearAllMocks());

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

  it("emits selected when the picker emits entitiesSelected", async () => {
    const wrapper = getWrapper();
    wrapper
      .findComponent(EntityPickerComponent)
      .vm.$emit("entitiesSelected", [
        { id: "expr-1", value: "Chamber of Secrets" },
      ]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("selected")?.[0]).toEqual([
      { id: "expr-1", label: "Chamber of Secrets" },
    ]);
  });

  it("switches from picker to create when the create-new button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper
      .find("[data-testid='repetitive-step-create-new']")
      .trigger("click");
    expect(pickerView(wrapper).exists()).toBe(false);
    expect(createView(wrapper).exists()).toBe(true);
  });

  it("returns from create to the picker via the back-to-search button", async () => {
    const wrapper = getWrapper();
    await wrapper
      .find("[data-testid='repetitive-step-create-new']")
      .trigger("click");
    await wrapper
      .find("[data-testid='repetitive-step-back-to-search']")
      .trigger("click");
    expect(pickerView(wrapper).exists()).toBe(true);
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

  it("emits created when DynamicForm emits entityCreated", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    wrapper.findComponent(DynamicForm).vm.$emit("entityCreated", { id: "expr-9" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("created")?.[0]).toEqual([{ id: "expr-9" }]);
  });

  it("resets the view to the picker when the step changes", async () => {
    const wrapper = getWrapper();
    await wrapper
      .find("[data-testid='repetitive-step-create-new']")
      .trigger("click");
    expect(createView(wrapper).exists()).toBe(true);
    await wrapper.setProps({
      step: { ...expressionStep(), key: "another-step" },
    });
    await wrapper.vm.$nextTick();
    expect(pickerView(wrapper).exists()).toBe(true);
  });
});
