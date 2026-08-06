/**
 * End-to-end check of the inline trigger inside a real editor: typing `@` must open
 * the dropdown state, and picking an entity must insert a tag node rather than text.
 *
 * The unit test next door only asserts plugin keys are distinct. It cannot catch the
 * thing that actually breaks this feature — the plugin never firing at all.
 */
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@/main", () => ({ apolloClient: {} }));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: vi.fn(), closeModal: vi.fn() }),
}));
vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => ({ dequeueAllItemsForBulkProcessing: vi.fn() }),
  BulkOperationsContextEnum: {},
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ addRelations: vi.fn() }),
}));
vi.mock("@/composables/useDeleteRelations", () => ({
  useDeleteRelations: () => ({ deleteRelations: vi.fn() }),
}));
vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "" }),
}));

const { useElodyTagging } = await import("../useElodyTagging");
const { applyInlineTag } = await import("../inlineTagSuggestion");

const vlaccConfiguration = () =>
  [
    {
      tag: "user",
      taggableEntityType: "user",
      relationType: "refTaggedUsers",
      metadataFilterForTagContent: "vlacc:1|properties.name.value",
      metadataKeysToSetAsAttribute: [],
      tagConfigurationByEntity: null,
      inlineTrigger: { character: "@", minCharacters: 1 },
    },
    {
      tag: "work",
      taggableEntityType: "work",
      relationType: "refTaggedEntities",
      metadataFilterForTagContent: "vlacc:1|properties.title.value",
      metadataKeysToSetAsAttribute: [],
      tagConfigurationByEntity: null,
      inlineTrigger: { character: "#", minCharacters: 2 },
    },
  ] as any;

const buildEditor = async (extensions: any[]) => {
  const { Editor } = await import("@tiptap/core");
  const { default: Document } = await import("@tiptap/extension-document");
  const { default: Paragraph } = await import("@tiptap/extension-paragraph");
  const { default: Text } = await import("@tiptap/extension-text");

  // A real element: the suggestion plugin runs from view lifecycle hooks, which never
  // fire on a headless editor.
  const element = window.document.createElement("div");
  window.document.body.appendChild(element);
  return new Editor({
    element,
    extensions: [Document, Paragraph, Text, ...extensions],
    content: "<p></p>",
  });
};

/**
 * @tiptap/suggestion's view update handler is async: it awaits `items()` before
 * invoking onStart, so the state is never set within the same tick as the keystroke.
 */
const flushSuggestion = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("inline @ trigger inside a real editor", () => {
  it("opens the dropdown state when the trigger character is typed", async () => {
    const tagging = await useElodyTagging("flow", vlaccConfiguration());
    const editor = await buildEditor(tagging.extensions);

    editor.commands.focus();
    editor.commands.insertContent("@in");
    await flushSuggestion();

    expect(tagging.inlineSuggestion.value).not.toBeNull();
    expect(tagging.inlineSuggestion.value?.query).toBe("in");
    expect(tagging.inlineSuggestion.value?.configuration.tag).toBe("user");
    // Without an anchor the dropdown has nothing to position against and renders
    // nothing at all, even though the search request has already gone out.
    expect(tagging.inlineSuggestion.value?.anchor).toBeDefined();

    editor.destroy();
    tagging.destroy();
  });

  it("closes when the editor loses focus", async () => {
    // The dropdown is a top-layer popover, so a state left open outlives the dialog it
    // was opened in: closing the comment modal only flips the dialog's `open` flag and
    // never unmounts the composer.
    const tagging = await useElodyTagging("flow-blur", vlaccConfiguration());
    const editor = await buildEditor(tagging.extensions);

    editor.commands.focus();
    editor.commands.insertContent("@in");
    await flushSuggestion();
    expect(tagging.inlineSuggestion.value).not.toBeNull();

    editor.view.dom.dispatchEvent(new Event("blur"));

    expect(tagging.inlineSuggestion.value).toBeNull();

    editor.destroy();
    tagging.destroy();
  });

  it("replaces the trigger and query with a tag node, leaving no @ in the HTML", async () => {
    const tagging = await useElodyTagging("flow-apply", vlaccConfiguration());
    const editor = await buildEditor(tagging.extensions);

    editor.commands.focus();
    editor.commands.insertContent("@in");
    await flushSuggestion();
    const suggestion = tagging.inlineSuggestion.value;
    expect(suggestion).not.toBeNull();

    applyInlineTag(editor, suggestion, { id: "U-1" }, "Inuits Developers");

    const html = editor.getHTML();
    expect(html).toContain("<elody-user");
    expect(html).toContain('data-entity-id="U-1"');
    expect(html).not.toContain("@");

    editor.destroy();
    tagging.destroy();
  });
});
