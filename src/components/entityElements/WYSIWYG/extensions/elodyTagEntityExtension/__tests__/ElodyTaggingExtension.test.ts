import { describe, expect, it, beforeEach, vi } from "vitest";
import type { EditorState } from "prosemirror-state";

// Short-circuit the app-wide import chain (main.ts → App.vue → …) that the
// extension pulls in via useBaseModal / useBulkOperations. CI tears the env
// down before async imports resolve, causing false failures.
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

const {
  getAdjustedSelectionFrom,
  hasSelectionBeenTagged,
  customExtensionNames,
  createGlobalCommandsExtension,
} = await import("../ElodyTaggingExtension");

const TAG_TYPE = "word-testconfig";
const OTHER_TYPE = "paragraph";

type MockNode = { type: string; pos: number; size: number };

const makeMockState = (
  nodes: MockNode[],
  selection: { from: number; to: number },
): EditorState => {
  return {
    selection: {
      from: selection.from,
      to: selection.to,
      empty: selection.from === selection.to,
    },
    doc: {
      nodesBetween(
        from: number,
        to: number,
        cb: (node: any, pos: number) => boolean | void,
      ) {
        for (const n of nodes) {
          const end = n.pos + n.size;
          if (end > from && n.pos < to) {
            const stop = cb(
              { type: { name: n.type }, nodeSize: n.size },
              n.pos,
            );
            if (stop === false) break;
          }
        }
      },
    },
  } as unknown as EditorState;
};

const makeMockEditor = (state: EditorState) => ({ state }) as any;

describe("getAdjustedSelectionFrom", () => {
  beforeEach(() => {
    customExtensionNames.value = [TAG_TYPE];
  });

  it("returns original from when no tag at the selection start", () => {
    // Selection [10, 15] with no tag anywhere
    const state = makeMockState([], { from: 10, to: 15 });
    expect(getAdjustedSelectionFrom(state)).toBe(10);
  });

  it("advances from past a tag atom that starts exactly at from when selection extends beyond it", () => {
    // Tag at position 5 (size 1, occupies [5, 6])
    // Selection [5, 9] — user tried to select text after the tag but browser
    // landed the cursor at the tag's own start position
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 9,
    });
    expect(getAdjustedSelectionFrom(state)).toBe(6);
  });

  it("does not advance when selection exactly equals the tag (single-tag selection)", () => {
    // Selection [5, 6] — user selected just the tag
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 6,
    });
    expect(getAdjustedSelectionFrom(state)).toBe(5);
  });

  it("does not advance for a tag that is not at the selection's leading edge", () => {
    // Tag at position 7 (fully inside selection [5, 10])
    const state = makeMockState([{ type: TAG_TYPE, pos: 7, size: 1 }], {
      from: 5,
      to: 10,
    });
    expect(getAdjustedSelectionFrom(state)).toBe(5);
  });

  it("does not advance for non-tag nodes at the leading edge", () => {
    // A non-tag node at from — should not trigger adjustment
    const state = makeMockState([{ type: OTHER_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 9,
    });
    expect(getAdjustedSelectionFrom(state)).toBe(5);
  });
});

describe("hasSelectionBeenTagged", () => {
  beforeEach(() => {
    customExtensionNames.value = [TAG_TYPE];
  });

  it("returns false for an empty selection", () => {
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 5,
    });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(false);
  });

  it("returns false when selection contains only untagged text", () => {
    const state = makeMockState([], { from: 5, to: 10 });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(false);
  });

  it("returns true when selection contains a tag", () => {
    // Tag at position 7, selection [5, 10] — tag fully inside
    const state = makeMockState([{ type: TAG_TYPE, pos: 7, size: 1 }], {
      from: 5,
      to: 10,
    });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(true);
  });

  it("returns true when the selection is exactly a single tag", () => {
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 6,
    });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(true);
  });

  it("returns false when the selection only touches a leading-edge tag (adjacent-tag bug)", () => {
    // Regression: browser landed cursor at tag's own start position when user
    // meant to select text after the tag. Without adjustment, tag button was
    // wrongly disabled and further tagging on adjacent text was impossible.
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 5,
      to: 9,
    });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(false);
  });

  it("returns false when the selection ends exactly at a trailing tag boundary", () => {
    // Selection [1, 5] with tag at [5, 6] — nodesBetween excludes the tag
    // (pos < to check fails: 5 < 5 is false)
    const state = makeMockState([{ type: TAG_TYPE, pos: 5, size: 1 }], {
      from: 1,
      to: 5,
    });
    expect(hasSelectionBeenTagged(makeMockEditor(state))).toBe(false);
  });
});

describe("ensureTrailingSpaceAfterTags plugin (via createGlobalCommandsExtension)", () => {
  it("inserts a zero-width space after a tag that ends up as the last node in a paragraph", async () => {
    const { Editor } = await import("@tiptap/core");
    const { default: Document } = await import("@tiptap/extension-document");
    const { default: Paragraph } = await import("@tiptap/extension-paragraph");
    const { default: Text } = await import("@tiptap/extension-text");
    const { Node } = await import("@tiptap/core");

    customExtensionNames.value = [TAG_TYPE];

    const TagNode = Node.create({
      name: TAG_TYPE,
      group: "inline",
      inline: true,
      atom: true,
      selectable: false,
      renderHTML: () => ["span", { "data-tag": "true" }],
    });

    const editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TagNode,
        createGlobalCommandsExtension,
      ],
      content: `<p>hello </p>`,
    });

    editor.commands.insertContentAt(
      editor.state.doc.content.size - 1,
      { type: TAG_TYPE },
    );

    const paragraph = editor.state.doc.firstChild!;
    const lastChild = paragraph.lastChild!;

    expect(lastChild.isText).toBe(true);
    expect(lastChild.text).toBe("​");

    editor.destroy();
  });
});
