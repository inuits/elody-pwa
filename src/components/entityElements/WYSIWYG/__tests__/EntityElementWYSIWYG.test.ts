import { describe, it, expect, vi } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import {
  WysiwygExtensions,
  type WysiwygElement,
} from "@/generated-types/queries";
import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";

vi.mock("@tiptap/vue-3", () => ({
  Editor: class {
    options: Record<string, unknown>;
    constructor(options: Record<string, unknown>) {
      this.options = options;
    }
    setEditable() {}
    destroy() {}
    getHTML() {
      return "";
    }
  },
  EditorContent: { name: "EditorContent", template: "<div />" },
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/composables/useWYSIWYGEditor", () => ({
  useWYSIWYGEditor: () => ({
    importEditorExtensions: async () => [],
    getExtensionConfiguration: () => [],
    countLinesOfContent: () => 2,
  }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: () => ({
      values: { intialValues: { description: "<p>a</p><p>b</p>" } },
    }),
    addEditableMetadataKeys: vi.fn(),
  }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: true }),
}));
vi.mock("@/composables/useFieldLock", () => ({
  useFieldLock: () => ({ isLocked: ref(false) }),
}));
vi.mock(
  "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension",
  () => ({ openDetailModal: vi.fn() }),
);
vi.mock(
  "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/useElodyTagging",
  () => ({ useElodyTagging: vi.fn() }),
);

const element = (
  wysiwygElementConfiguration?: WysiwygElement["wysiwygElementConfiguration"],
): WysiwygElement =>
  ({
    __typename: "WysiwygElement",
    label: "metadata.labels.description",
    metadataKey: "description",
    extensions: [WysiwygExtensions.Bold, WysiwygExtensions.Italic],
    wysiwygElementConfiguration,
  }) as WysiwygElement;

const mountEditor = async (config: WysiwygElement) => {
  const errors: unknown[] = [];
  const wrapper = shallowMount(EntityElementWYSIWYG, {
    props: { formId: "entity-1", element: config, displayInline: true },
    global: {
      config: { errorHandler: (error) => errors.push(error) },
      mocks: { $t: (key: string) => key },
    },
  });
  await flushPromises();
  return { wrapper, errors };
};

describe("EntityElementWYSIWYG", () => {
  it("renders without a wysiwygElementConfiguration", async () => {
    const { wrapper, errors } = await mountEditor(element(undefined));

    expect(errors).toEqual([]);
    expect(
      wrapper.find('[data-testid="locked-field-view-container"]').exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "WYSIGYGVirtualKeyboard" }).exists(),
    ).toBe(false);
    expect(wrapper.text()).not.toContain("1.");
  });

  it("shows line numbers when the configuration asks for them", async () => {
    const { wrapper, errors } = await mountEditor(
      element({ showLineNumbers: true } as any),
    );

    expect(errors).toEqual([]);
    expect(wrapper.text()).toContain("1.");
    expect(wrapper.text()).toContain("2.");
  });
});
