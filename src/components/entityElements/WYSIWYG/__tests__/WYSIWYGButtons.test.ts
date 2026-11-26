import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import { WysiwygExtensions } from "@/generated-types/queries";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
const editState = vi.hoisted(() => ({ isEdit: true }));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => editState,
}));
vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: {
    name: "BaseTooltip",
    template: "<div><slot name='activator' :on='{}' /><slot /></div>",
  },
}));

const editorStub = (selection = { from: 0, to: 0 }) => ({
  isActive: () => false,
  state: {
    selection,
    doc: { nodesBetween: () => undefined },
  },
  commands: { openTagFlow: vi.fn() },
  chain: () => ({ focus: () => ({ setParagraph: () => ({ run: vi.fn() }) }) }),
});

const taggingInstance = (
  configurations: any[],
  isInNeedOfConfigurationEntities = false,
) => ({
  configuration: ref(configurations),
  flowConfigurations: ref(
    configurations.filter((configuration) => configuration.guidedFlowQuery),
  ),
  configurationsByEntity: ref([]),
  isInNeedOfConfigurationEntities: ref(isInNeedOfConfigurationEntities),
});

const triggerConfiguration = () => ({
  tag: "user",
  taggableEntityType: "user",
  relationType: "refTaggedUsers",
  inlineTrigger: { character: "@", minCharacters: 1 },
});

const flowConfiguration = () => ({
  tag: "entity",
  taggableEntityType: "BaseEntity",
  relationType: "refTaggedEntities",
  guidedFlowQuery: "GetTagWemFlow",
  guidedFlowButtonLabel: "tagging.tag-wem",
});

const getWrapper = (
  configurations: any[],
  extraProps = {},
  { selection = { from: 0, to: 0 }, isInNeedOfConfigurationEntities = false } = {},
) =>
  shallowMount(WYSIWYGButtons, {
    props: {
      formId: "comment-new-1",
      editor: editorStub(selection) as any,
      extensions: [WysiwygExtensions.ElodyTaggingExtension],
      displayInline: true,
      tagging: taggingInstance(
        configurations,
        isInNeedOfConfigurationEntities,
      ) as any,
      ...extraProps,
    },
    global: { mocks: { $t: (k: string) => k }, renderStubDefaultSlot: true },
  });

const flowButtons = (wrapper: ReturnType<typeof getWrapper>) =>
  wrapper.findAll("[data-testid='wysiwyg-tag-flow-button']");

describe("WYSIWYGButtons — guided-flow tagging", () => {
  it("renders a button for every configuration that names a guided flow", () => {
    const wrapper = getWrapper([triggerConfiguration(), flowConfiguration()]);
    expect(flowButtons(wrapper)).toHaveLength(1);
  });

  it("labels the button from the configuration", () => {
    const wrapper = getWrapper([flowConfiguration()]);
    expect(flowButtons(wrapper)[0].text()).toContain("tagging.tag-wem");
  });

  it("falls back to a generic label when the configuration names none", () => {
    const wrapper = getWrapper([
      { ...flowConfiguration(), guidedFlowButtonLabel: undefined },
    ]);
    expect(flowButtons(wrapper)[0].text()).toContain("tagging.tag-via-flow");
  });

  it("renders no flow button when no configuration names a flow", () => {
    const wrapper = getWrapper([triggerConfiguration()]);
    expect(flowButtons(wrapper)).toHaveLength(0);
  });

  it("opens the flow for its own configuration on click", async () => {
    const configuration = flowConfiguration();
    const wrapper = getWrapper([triggerConfiguration(), configuration]);
    await flowButtons(wrapper)[0].trigger("click");
    expect(wrapper.props("editor").commands.openTagFlow).toHaveBeenCalledWith(
      configuration,
    );
  });

  it("renders no separate Tag button next to the flow buttons", () => {
    const wrapper = getWrapper([triggerConfiguration(), flowConfiguration()]);
    expect(wrapper.text()).not.toContain("Tag");
  });
});

// AICAP: the flow searches on the selected word, so it needs one
const wordFlowConfiguration = () => ({
  taggableEntityType: "word",
  relationType: "ref_words",
  metadataFilterForTagContent: "aicap:1|properties.original_word.value",
  guidedFlowQuery: "GetTagWordFlow",
  guidedFlowButtonLabel: "tagging.tag-word",
});

describe("WYSIWYGButtons — a flow that searches on the selection", () => {
  it("is disabled while nothing is selected", () => {
    const wrapper = getWrapper([wordFlowConfiguration()]);
    expect(flowButtons(wrapper)[0].attributes("disabled")).toBeDefined();
  });

  it("is enabled once text is selected", () => {
    const wrapper = getWrapper([wordFlowConfiguration()], {}, {
      selection: { from: 1, to: 4 },
    });
    expect(flowButtons(wrapper)[0].attributes("disabled")).toBeUndefined();
  });

  it("is disabled while the configuration entities it tags with are missing", () => {
    const wrapper = getWrapper([wordFlowConfiguration()], {}, {
      selection: { from: 1, to: 4 },
      isInNeedOfConfigurationEntities: true,
    });
    expect(flowButtons(wrapper)[0].attributes("disabled")).toBeDefined();
  });

  it("leaves a flow that does not search on the selection enabled without one", () => {
    const wrapper = getWrapper([flowConfiguration()]);
    expect(flowButtons(wrapper)[0].attributes("disabled")).toBeUndefined();
  });
});

describe("WYSIWYGButtons — in-place editing", () => {
  const starterKitWrapper = (extraProps = {}) =>
    shallowMount(WYSIWYGButtons, {
      props: {
        formId: "entity-1",
        editor: editorStub() as any,
        extensions: [WysiwygExtensions.StarterKit],
        displayInline: true,
        ...extraProps,
      },
      global: { mocks: { $t: (k: string) => k } },
    });

  it("disables the toolbar outside the page-wide edit mode", () => {
    editState.isEdit = false;
    const wrapper = starterKitWrapper();
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    editState.isEdit = true;
  });

  it("enables the toolbar while the field is edited in place", () => {
    editState.isEdit = false;
    const wrapper = starterKitWrapper({ editing: true });
    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    editState.isEdit = true;
  });
});
