import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { reactive, ref } from "vue";

const mocks = vi.hoisted(() => ({
  saveScope: vi.fn(),
  editors: [] as any[],
  form: undefined as any,
  editState: undefined as any,
  locked: undefined as any,
}));

vi.mock("@tiptap/vue-3", () => {
  class Editor {
    options: any;
    html: string;
    editable: boolean;
    commands: any;
    constructor(options: any) {
      this.options = options;
      this.html = options.content ?? "";
      this.editable = options.editable;
      this.commands = {
        setContent: vi.fn((content: string) => {
          this.html = content;
          this.options.onUpdate?.({ editor: this });
        }),
        focus: vi.fn(),
      };
      mocks.editors.push(this);
    }
    getHTML() {
      return this.html;
    }
    setEditable(value: boolean) {
      this.editable = value;
    }
    destroy() {}
    type(html: string) {
      this.html = html;
      this.options.onUpdate({ editor: this });
    }
  }
  return {
    Editor,
    EditorContent: { name: "EditorContent", template: "<div data-cy='editor-content'><p>Tekst</p><span data-entity-id='work-1'>Werk</span></div>" },
  };
});

vi.mock("@/composables/useWYSIWYGEditor", () => ({
  useWYSIWYGEditor: () => ({
    importEditorExtensions: async () => [],
    getExtensionConfiguration: () => [],
    countLinesOfContent: () => 1,
  }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: () => mocks.form,
    addEditableMetadataKeys: vi.fn(),
  }),
}));

vi.mock("@/composables/useFieldLock", () => ({
  useFieldLock: () => ({ isLocked: mocks.locked }),
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => mocks.editState,
}));

vi.mock("@/composables/useScopedSave", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/composables/useScopedSave")>()),
  saveScope: mocks.saveScope,
}));

vi.mock("@/main", () => ({ apolloClient: {} }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

vi.mock("@/composables/useTransliteration", () => ({
  isTransliterationEnabledValue: () => true,
}));

vi.mock(
  "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension",
  () => ({ openDetailModal: vi.fn() }),
);
vi.mock(
  "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/useElodyTagging",
  () => ({ useElodyTagging: vi.fn() }),
);

import EntityElementWYSIWYG from "@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue";
import { useEditScope } from "@/composables/useEditScope";

const element = (overrides: Record<string, unknown> = {}) => ({
  __typename: "WysiwygElement",
  label: "Beschrijving",
  metadataKey: "description",
  extensions: [],
  wysiwygElementConfiguration: {
    transliterationConfig: { latin: { label: "Latijn", mapping: {} } },
  },
  ...overrides,
});

const stubs = {
  MetadataTitle: { template: "<p data-cy='metadata-label'>Beschrijving</p>" },
  WYSIGYGVirtualKeyboard: { name: "WYSIGYGVirtualKeyboard", template: "<div data-cy='virtual-keyboard' />" },
  WYSIWYGTransliterationToggle: { name: "WYSIWYGTransliterationToggle", template: "<div data-cy='transliteration-toggle' />" },
  MultilingualLocaleSelector: { name: "MultilingualLocaleSelector", template: "<div data-cy='locale-selector' />" },
  LockedFieldIndicator: true,
  TagEntityModal: true,
  InlineTagSuggestionDropdown: true,
  WYSIWYGButtons: {
    name: "WYSIWYGButtons",
    props: ["editing"],
    template: "<div data-cy='wysiwyg-toolbar' />",
  },
  unicon: true,
  SpinnerLoader: true,
  BaseTooltip: true,
  Transition: false,
};

const mountElement = async (
  overrides: Record<string, unknown> = {},
  provide: Record<string, unknown> = {},
) => {
  const wrapper = mount(EntityElementWYSIWYG, {
    props: { formId: "entity-1", element: element(overrides) as any, displayInline: true },
    global: {
      stubs,
      provide: {
        entityFormData: { id: "entity-1", collection: "entities" },
        ...provide,
      },
    },
    attachTo: document.body,
  });
  await flushPromises();
  return wrapper;
};

const editor = () => mocks.editors[mocks.editors.length - 1];
const editButton = (wrapper: any) => wrapper.find('[data-cy="wysiwyg-edit-button"]');
const button = (wrapper: any, label: string) =>
  wrapper.findAll("button").find((candidate: any) => candidate.text() === label);

describe("EntityElementWYSIWYG — in-place editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editors = [];
    mocks.form = {
      values: { intialValues: { description: "<p>Oud</p>" } },
      setFieldValue: vi.fn((path: string, value: string) => {
        mocks.form.values.intialValues[path.split(".")[1]] = value;
      }),
      resetField: vi.fn(),
    };
    mocks.editState = reactive({ isEdit: false, permittedEditMode: "edit" });
    mocks.locked = ref(false);
    const scope = useEditScope();
    if (scope.activeScope.value) scope.release(scope.activeScope.value.id);
    document.body.innerHTML = "";
  });

  describe("at rest", () => {
    it("shows the content read-only with an edit button on the label line", async () => {
      const wrapper = await mountElement();
      expect(editor().editable).toBe(false);
      expect(editButton(wrapper).exists()).toBe(true);
    });

    it("shows no toolbar and no virtual keyboard", async () => {
      const wrapper = await mountElement({
        wysiwygElementConfiguration: { virtualKeyboardLayouts: ["arabic"] },
      });
      expect(wrapper.find('[data-cy="wysiwyg-toolbar"]').exists()).toBe(false);
      expect(wrapper.find('[data-cy="virtual-keyboard"]').exists()).toBe(false);
    });

    it("keeps the transliteration toggle", async () => {
      const wrapper = await mountElement();
      expect(wrapper.find('[data-cy="transliteration-toggle"]').exists()).toBe(true);
    });

    it.each([
      ["the user may not update the entity", () => (mocks.editState.permittedEditMode = "read")],
      ["the field is locked", () => (mocks.locked.value = true)],
    ])("offers no edit button when %s", async (_reason, arrange) => {
      arrange();
      const wrapper = await mountElement();
      expect(editButton(wrapper).exists()).toBe(false);
    });

    it("leaves the page-wide edit mode as it was", async () => {
      mocks.editState.isEdit = true;
      const wrapper = await mountElement();
      expect(editButton(wrapper).exists()).toBe(false);
      expect(editor().editable).toBe(true);
      expect(wrapper.find('[data-cy="wysiwyg-toolbar"]').exists()).toBe(true);
    });

    it("opens editing when the content is clicked", async () => {
      const wrapper = await mountElement();
      await wrapper.find('[data-cy="editor-content"] p').trigger("click");
      expect(editor().editable).toBe(true);
    });

    it("does not open editing when a tagged entity is clicked", async () => {
      const wrapper = await mountElement();
      await wrapper.find("[data-entity-id]").trigger("click");
      expect(editor().editable).toBe(false);
    });
  });

  describe("editing", () => {
    const startEditing = async (overrides = {}, provide = {}) => {
      const wrapper = await mountElement(overrides, provide);
      await editButton(wrapper).trigger("click");
      await flushPromises();
      return wrapper;
    };

    it("makes the editor editable and shows the toolbar in editing mode", async () => {
      const wrapper = await startEditing();
      expect(editor().editable).toBe(true);
      const toolbar = wrapper.findComponent({ name: "WYSIWYGButtons" });
      expect(toolbar.exists()).toBe(true);
      expect(toolbar.props("editing")).toBe(true);
    });

    it("shows the virtual keyboard when the field has one", async () => {
      const wrapper = await startEditing({
        wysiwygElementConfiguration: { virtualKeyboardLayouts: ["arabic"] },
      });
      expect(wrapper.find('[data-cy="virtual-keyboard"]').exists()).toBe(true);
    });

    it("hides the transliteration toggle, which only transforms the view", async () => {
      const wrapper = await startEditing();
      expect(wrapper.find('[data-cy="transliteration-toggle"]').exists()).toBe(false);
    });

    it("puts Bewaar and Annuleer on the label line, with the keyboard hint below", async () => {
      const wrapper = await startEditing();
      expect(editButton(wrapper).exists()).toBe(false);
      expect(button(wrapper, "Save")).toBeDefined();
      expect(button(wrapper, "Cancel")).toBeDefined();
      expect(wrapper.find('[data-cy="wysiwyg-hint"]').text()).toBe(
        "Ctrl+Enter saves · Esc cancels",
      );
    });

    it("saves only this field's key and keeps the saved value", async () => {
      mocks.saveScope.mockResolvedValue({});
      const wrapper = await startEditing();
      editor().type("<p>Nieuw</p>");
      await wrapper.vm.$nextTick();
      await button(wrapper, "Save").trigger("click");
      await flushPromises();
      expect(mocks.saveScope).toHaveBeenCalledWith({
        entityId: "entity-1",
        collection: "entities",
        formInput: {
          metadata: [{ key: "description", value: "<p>Nieuw</p>" }],
          relations: [],
          updateOnlyRelations: false,
        },
      });
      expect(mocks.form.resetField).toHaveBeenCalledWith(
        "intialValues.description",
        { value: "<p>Nieuw</p>" },
      );
      expect(editor().editable).toBe(false);
      expect(wrapper.find('[role="status"]').text()).toBe("Saved");
    });

    it("does not reset the editor while typing", async () => {
      const wrapper = await startEditing();
      editor().commands.setContent.mockClear();
      editor().type("<p>Nieuw</p>");
      await wrapper.vm.$nextTick();
      expect(editor().commands.setContent).not.toHaveBeenCalled();
    });

    it("shows the error below the editor and stays open when saving fails", async () => {
      mocks.saveScope.mockRejectedValue(new Error("boom"));
      const wrapper = await startEditing();
      editor().type("<p>Nieuw</p>");
      await wrapper.vm.$nextTick();
      await button(wrapper, "Save").trigger("click");
      await flushPromises();
      expect(wrapper.find('[role="alert"]').text()).toBe("Saving failed, try again");
      expect(editor().editable).toBe(true);
    });

    it("restores the previous content on Escape", async () => {
      const wrapper = await startEditing();
      editor().type("<p>Nieuw</p>");
      await wrapper.vm.$nextTick();
      await wrapper.find('[data-cy="wysiwyg-field"]').trigger("keydown", { key: "Escape" });
      expect(editor().getHTML()).toBe("<p>Oud</p>");
      expect(mocks.form.values.intialValues.description).toBe("<p>Oud</p>");
      expect(editor().editable).toBe(false);
    });

    describe("a multilingual field", () => {
      const multilingual = () => ({
        "multilingual:description": {
          isEnabled: ref(true),
          showSelector: true,
          currentValue: ref("<p>Old</p>"),
          selectedLocale: ref("en"),
          localeOptions: ref([{ label: "English", value: "en" }]),
          updateValue: vi.fn(),
        },
      });

      it("shows the language being edited instead of the language picker", async () => {
        const wrapper = await startEditing({}, multilingual());
        expect(wrapper.find('[data-cy="locale-selector"]').exists()).toBe(false);
        expect(wrapper.find('[data-cy="wysiwyg-editing-locale"]').text()).toBe("English");
      });

      it("saves the selected language", async () => {
        mocks.saveScope.mockResolvedValue({});
        const wrapper = await startEditing({}, multilingual());
        editor().type("<p>New</p>");
        await wrapper.vm.$nextTick();
        await button(wrapper, "Save").trigger("click");
        await flushPromises();
        expect(mocks.saveScope.mock.calls[0][0].formInput.metadata).toEqual([
          { key: "description", value: "<p>New</p>", lang: "en" },
        ]);
      });
    });
  });
});
