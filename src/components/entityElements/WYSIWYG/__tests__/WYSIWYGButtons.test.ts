import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import { WysiwygExtensions } from "@/generated-types/queries";
import WYSIWYGButtons from "@/components/entityElements/WYSIWYG/WYSIWYGButtons.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: true }),
}));
vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: {
    name: "BaseTooltip",
    template: "<div><slot name='activator' :on='{}' /><slot /></div>",
  },
}));

const editorStub = () => ({
  isActive: () => false,
  state: { selection: { from: 0, to: 0 } },
  commands: { openTagModal: vi.fn(), openTagFlow: vi.fn() },
  chain: () => ({ focus: () => ({ setParagraph: () => ({ run: vi.fn() }) }) }),
});

const taggingInstance = (configurations: any[]) => ({
  configuration: ref(configurations),
  configurationsByEntity: ref([]),
  isInNeedOfConfigurationEntities: ref(false),
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

const getWrapper = (configurations: any[]) =>
  shallowMount(WYSIWYGButtons, {
    props: {
      formId: "comment-new-1",
      editor: editorStub() as any,
      extensions: [WysiwygExtensions.ElodyTaggingExtension],
      displayInline: true,
      tagging: taggingInstance(configurations) as any,
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

  it("hides the legacy Tag button when every configuration has its own entry point", () => {
    const wrapper = getWrapper([triggerConfiguration(), flowConfiguration()]);
    expect(wrapper.text()).not.toContain("Tag");
  });
});
