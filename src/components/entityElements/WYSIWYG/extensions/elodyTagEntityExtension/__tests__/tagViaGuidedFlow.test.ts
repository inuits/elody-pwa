/**
 * The third way into tagging, next to the toolbar modal and the inline trigger:
 * a configuration that names a guided flow gets a toolbar button which opens
 * that flow, and the entity the flow returns is inserted as a tag node.
 *
 * It exists because a one-line dropdown is not enough to tell near-identical
 * records apart — the flow shows the full picker at every step of a hierarchy.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

const modalMocks = vi.hoisted(() => ({
  openModal: vi.fn(),
  closeModal: vi.fn(),
}));

vi.mock("@/main", () => ({ apolloClient: {} }));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: modalMocks.openModal,
    closeModal: modalMocks.closeModal,
  }),
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

const { createTipTapNodeExtension, createTaggingCommandsExtension } =
  await import("../ElodyTaggingExtension");
const { isTaggedByTriggerOnly } = await import("../inlineTagSuggestion");
const { ref } = await import("vue");

const wemConfiguration = () => ({
  tag: "entity",
  taggableEntityType: "BaseEntity",
  relationType: "refTaggedEntities",
  guidedFlowQuery: "GetTagWemFlow",
  guidedFlowButtonLabel: "tagging.tag-wem",
});

const buildEditor = async (content: string, configuration: any) => {
  const { Editor } = await import("@tiptap/core");
  const { default: Document } = await import("@tiptap/extension-document");
  const { default: Paragraph } = await import("@tiptap/extension-paragraph");
  const { default: Text } = await import("@tiptap/extension-text");

  const tagNode = createTipTapNodeExtension(configuration);
  const configurations = ref([configuration]);
  const editor = new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      tagNode,
      createTaggingCommandsExtension({
        instanceId: "comment-new-1-body",
        configuration: configurations,
      }),
    ],
    content,
  });
  return editor;
};

const work = () => ({
  id: "work-1",
  type: "work",
  intialValues: { title: "Het verdriet van België" },
});

describe("openTagFlow", () => {
  beforeEach(() => {
    modalMocks.openModal.mockReset();
  });

  it("opens the guided flow named by the configuration", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    editor.commands.openTagFlow(configuration);

    const call = modalMocks.openModal.mock.calls[0];
    expect(call[0]).toBe("GuidedFlow");
    expect(call[2]).toBe("GetTagWemFlow");
    editor.destroy();
  });

  it("passes the editor instance id along, so the right editor is tagged", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    editor.commands.openTagFlow(configuration);

    expect(modalMocks.openModal.mock.calls[0][6]).toEqual(
      expect.objectContaining({ editorId: "comment-new-1-body" }),
    );
    editor.destroy();
  });

  it("hands the flow a callback that tags the returned entity", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p></p>", configuration);

    editor.commands.openTagFlow(configuration);
    modalMocks.openModal.mock.calls[0][6].onEntitySelected(work());

    expect(editor.getHTML()).toContain('data-entity-id="work-1"');
    editor.destroy();
  });

  it("does nothing for a configuration without a guided flow", async () => {
    const configuration = { ...wemConfiguration(), guidedFlowQuery: undefined };
    const editor = await buildEditor("<p>hello</p>", configuration);

    expect(editor.commands.openTagFlow(configuration)).toBe(false);
    expect(modalMocks.openModal).not.toHaveBeenCalled();
    editor.destroy();
  });
});

describe("tagEntityFromFlow", () => {
  it("inserts the entity's title as the tagged text when nothing is selected", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p></p>", configuration);

    editor.commands.tagEntityFromFlow(work(), configuration);

    const html = editor.getHTML();
    expect(html).toContain("<elody-entity");
    expect(html).toContain('data-entity-id="work-1"');
    expect(html).toContain(">Het verdriet van België<");
    editor.destroy();
  });

  it("carries the entity type, since one configuration can tag any type", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p></p>", configuration);

    editor.commands.tagEntityFromFlow(work(), configuration);

    expect(editor.getHTML()).toContain('data-entity-type="work"');
    editor.destroy();
  });

  it("tags the selected text instead of the title when there is a selection", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p>zie dit boek</p>", configuration);

    editor.commands.setTextSelection({ from: 5, to: 13 });
    editor.commands.tagEntityFromFlow(work(), configuration);

    const html = editor.getHTML();
    expect(html).toContain(">dit boek<");
    expect(html).toContain("zie <elody-entity");
    expect(html).toContain('data-entity-id="work-1"');
    editor.destroy();
  });

  it("strips search highlighting out of the label", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p></p>", configuration);

    editor.commands.tagEntityFromFlow(
      {
        id: "work-2",
        type: "work",
        intialValues: { title: "Het <mark>verdriet</mark>" },
      },
      configuration,
    );

    const html = editor.getHTML();
    expect(html).toContain("Het verdriet");
    expect(html).not.toContain("mark>");
    editor.destroy();
  });

  it("falls back to the entity id when it has no titleish value", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p></p>", configuration);

    editor.commands.tagEntityFromFlow(
      { id: "work-3", type: "work", intialValues: {} },
      configuration,
    );

    expect(editor.getHTML()).toContain(">work-3<");
    editor.destroy();
  });

  it("does nothing without an entity", async () => {
    const configuration = wemConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    expect(
      editor.commands.tagEntityFromFlow(undefined as any, configuration),
    ).toBe(false);
    expect(editor.getHTML()).not.toContain("elody-entity");
    editor.destroy();
  });
});

describe("isTaggedByTriggerOnly", () => {
  it("counts a guided-flow configuration as having its own entry point", () => {
    // otherwise adding the flow button brings the legacy toolbar Tag modal back
    expect(
      isTaggedByTriggerOnly([
        { tag: "user", inlineTrigger: { character: "@" } } as any,
        wemConfiguration() as any,
      ]),
    ).toBe(true);
  });

  it("is still false for a configuration reachable only through the toolbar", () => {
    expect(
      isTaggedByTriggerOnly([
        { tag: "user", inlineTrigger: { character: "@" } } as any,
        { tag: "word", createNewEntityFormQuery: "GetWordCreateForm" } as any,
      ]),
    ).toBe(false);
  });
});
