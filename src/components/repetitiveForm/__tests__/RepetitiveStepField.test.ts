import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { Entitytyping, EntityPickerMode } from "@/generated-types/queries";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
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

const modals = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.findAllComponents(RepetitiveStepModal);

describe("RepetitiveStepField", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens the picker modal on trigger click when search is not skipped", async () => {
    const wrapper = getWrapper();
    await wrapper.find("[data-testid='repetitive-step-trigger']").trigger("click");
    expect(modals(wrapper)[0].props("open")).toBe(true);
    expect(modals(wrapper)[1].props("open")).toBe(false);
  });

  it("opens the create modal directly when skipSearch is true", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    await wrapper.find("[data-testid='repetitive-step-trigger']").trigger("click");
    expect(modals(wrapper)[1].props("open")).toBe(true);
  });

  it("passes derived picker props to EntityPickerComponent", () => {
    const wrapper = getWrapper();
    const picker = wrapper.findComponent(EntityPickerComponent);
    expect(picker.props("acceptedTypes")).toEqual([Entitytyping.Expression]);
    expect(picker.props("customQuery")).toBe("GetExpressionsForPicker");
    expect(picker.props("computedFilters")).toEqual([scopeFilter]);
    expect(picker.props("entityPickerMode")).toBe(EntityPickerMode.Emit);
  });

  it("emits selected and closes the picker when the picker emits entitiesSelected", async () => {
    const wrapper = getWrapper();
    await wrapper.find("[data-testid='repetitive-step-trigger']").trigger("click");
    wrapper
      .findComponent(EntityPickerComponent)
      .vm.$emit("entitiesSelected", [{ id: "expr-1", value: "Chamber of Secrets" }]);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("selected")?.[0]).toEqual([
      { id: "expr-1", label: "Chamber of Secrets" },
    ]);
    expect(modals(wrapper)[0].props("open")).toBe(false);
  });

  it("switches from picker to create when the create-new button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper.find("[data-testid='repetitive-step-trigger']").trigger("click");
    await wrapper.find("[data-testid='repetitive-step-create-new']").trigger("click");
    expect(modals(wrapper)[0].props("open")).toBe(false);
    expect(modals(wrapper)[1].props("open")).toBe(true);
  });

  it("passes the create form query and prefill to DynamicForm", () => {
    const wrapper = getWrapper();
    const form = wrapper.findComponent(DynamicForm);
    expect(form.props("dynamicFormQuery")).toBe("GetExpressionCreationForm");
    expect(form.props("prefilledFormValues")).toEqual({
      relationValues: { refWork: [{ key: "work-1" }] },
    });
  });

  it("emits created and closes the create modal when DynamicForm emits entityCreated", async () => {
    const wrapper = getWrapper({ ...getDefaultProps(), skipSearch: true });
    await wrapper.find("[data-testid='repetitive-step-trigger']").trigger("click");
    wrapper.findComponent(DynamicForm).vm.$emit("entityCreated", { id: "expr-9" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("created")?.[0]).toEqual([{ id: "expr-9" }]);
    expect(modals(wrapper)[1].props("open")).toBe(false);
  });
});
