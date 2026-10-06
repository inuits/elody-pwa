/**
 * Golden-output test for the tagged-HTML contract.
 *
 * AICAP's backend PARSES this HTML — it is not an internal editor detail:
 *   - clients/ugent-aicap/.../parsers/descriptive_markup_parser.py:37-53 renames
 *     `elody-<tag>` <-> bare `<tag>`, matching on the exact lowercased element name.
 *   - :29 runs the whole string through ElementTree.fromstring — malformed output
 *     means a 400 on save.
 *   - parsers/reading_parser.py:27-49 finds elements by tag name AND the bare
 *     `type` attribute, reads `data-entity-id` and the bare `lemma` attribute, and
 *     fully overwrites properties.ref_words from what it finds. An unrecognised
 *     element is silently ignored, its word loses its last referrer, and
 *     cron_jobs/delete_dangling_words.py then deletes the word entity.
 *
 * So these assertions are a data-integrity guard, not a style check. Capture them
 * before refactoring the extension and re-run after every stage.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("@/main", () => ({ apolloClient: {} }));
const { openModal } = vi.hoisted(() => ({ openModal: vi.fn() }));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal, closeModal: vi.fn() }),
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
const { ref } = await import("vue");

const aicapConfiguration = () => ({
  tag: "w",
  configurationEntityId: "EDT-1",
  taggableEntityType: "word",
  relationType: "refWords",
  createNewEntityFormQuery: "GetWordCreateForm",
  metadataFilterForTagContent: "aicap:1|properties.original_word.value",
  metadataKeysToSetAsAttribute: ["lemma"],
  tagColor: "#123456",
  attributes: { type: "person" },
  tagConfigurationByEntity: {
    configurationEntityType: "epi_doc_tag",
    configurationEntityRelationType: "refEpiDocTag",
    tagMetadataKey: "tag",
    colorMetadataKey: "color",
    metadataKeysToSetAsAttribute: ["type"],
    secondaryAttributeToDetermineTagConfig: "type",
  },
});

const buildEditor = async (
  content: string,
  configuration: any,
  { withHardBreak = false }: { withHardBreak?: boolean } = {},
) => {
  const { Editor } = await import("@tiptap/core");
  const { default: Document } = await import("@tiptap/extension-document");
  const { default: Paragraph } = await import("@tiptap/extension-paragraph");
  const { default: Text } = await import("@tiptap/extension-text");

  const tagNode = createTipTapNodeExtension(configuration);
  const extensions: any[] = [Document, Paragraph, Text, tagNode];

  if (withHardBreak) {
    const { default: HardBreak } = await import("@tiptap/extension-hard-break");
    extensions.push(HardBreak);
  }

  return new Editor({ extensions, content });
};

const parsesAsXml = (html: string): boolean => {
  const parsed = new DOMParser().parseFromString(
    `<root>${html}</root>`,
    "application/xml",
  );
  return parsed.getElementsByTagName("parsererror").length === 0;
};

describe("tagged HTML contract (AICAP backend depends on this)", () => {
  it("serializes the element as elody-<tag>, never with the configurationEntityId suffix", async () => {
    const configuration = aicapConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    editor.commands.insertContentAt(1, {
      type: configuration.extensionName,
      attrs: {
        entityId: "W-42",
        taggedText: "maktub",
        lemma: "ktb",
        type: "person",
      },
    });

    const html = editor.getHTML();

    expect(html).toContain("<elody-w");
    expect(html).not.toContain("elody-w-EDT-1");
    expect(configuration.extensionName).toBe("w-EDT-1");

    editor.destroy();
  });

  it("renders data-entity-id plus BARE lemma and type attributes", async () => {
    const configuration = aicapConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    editor.commands.insertContentAt(1, {
      type: configuration.extensionName,
      attrs: {
        entityId: "W-42",
        taggedText: "maktub",
        lemma: "ktb",
        type: "person",
      },
    });

    const html = editor.getHTML();

    expect(html).toContain('data-entity-id="W-42"');
    expect(html).toContain('type="person"');
    expect(html).toContain('lemma="ktb"');
    expect(html).not.toContain("data-type=");
    expect(html).not.toContain("data-lemma=");
    expect(html).toContain(">maktub<");
    expect(html).not.toContain("data-entity-type");

    editor.destroy();
  });

  it("produces well-formed XML (descriptive_markup_parser.py:29 gate)", async () => {
    const configuration = aicapConfiguration();
    const editor = await buildEditor("<p>hello</p>", configuration);

    editor.commands.insertContentAt(1, {
      type: configuration.extensionName,
      attrs: {
        entityId: "W-42",
        taggedText: "maktub",
        lemma: "ktb",
        type: "person",
      },
    });

    expect(parsesAsXml(editor.getHTML())).toBe(true);

    editor.destroy();
  });

  it("survives a parse -> re-render round trip of stored HTML", async () => {
    const stored =
      '<p>ma<elody-w type="person" data-entity-id="W-42" lemma="ktb" contenteditable="false">ktu</elody-w>b</p>';

    const editor = await buildEditor(stored, aicapConfiguration());
    const html = editor.getHTML();

    expect(html).toContain('data-entity-id="W-42"');
    expect(html).toContain('type="person"');
    expect(html).toContain('lemma="ktb"');
    expect(html).toContain(">ktu<");
    expect(html).toContain("ma<elody-w");
    expect(parsesAsXml(html)).toBe(true);

    editor.destroy();
  });

  it("emits hard breaks as bare <br>, the backend's line separator", async () => {
    const editor = await buildEditor(
      "<p>first<br>second</p>",
      aicapConfiguration(),
      { withHardBreak: true },
    );

    const html = editor.getHTML();

    expect(html).toContain("<br>");
    expect(html).not.toContain("<br/>");
    expect(html).not.toContain("<br />");

    editor.destroy();
  });

  it("keeps flanking characters attached when only part of a word is tagged", async () => {
    const configuration = aicapConfiguration();
    const editor = await buildEditor("<p>maktub</p>", configuration);

    editor.commands.setTextSelection({ from: 3, to: 6 });
    editor.commands.insertContentAt(
      { from: 3, to: 6 },
      {
        type: configuration.extensionName,
        attrs: {
          entityId: "W-42",
          taggedText: "ktu",
          lemma: "ktb",
          type: "person",
        },
      },
    );

    const html = editor.getHTML();

    expect(html).toContain("ma<elody-w");
    expect(html).toMatch(/<\/elody-w>b/);
    expect(html).not.toMatch(/\s<elody-w/);
    expect(html).not.toMatch(/<\/elody-w>\s/);
    expect(parsesAsXml(html)).toBe(true);

    editor.destroy();
  });

  describe("a tag spanning a line break keeps the <br> inside it", () => {
    const buildTaggingEditor = async (content: string) => {
      const { Editor } = await import("@tiptap/core");
      const { default: Document } = await import("@tiptap/extension-document");
      const { default: Paragraph } =
        await import("@tiptap/extension-paragraph");
      const { default: Text } = await import("@tiptap/extension-text");
      const { default: HardBreak } =
        await import("@tiptap/extension-hard-break");
      const configuration = aicapConfiguration();
      const tagNode = createTipTapNodeExtension(configuration as any);
      return new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          HardBreak,
          tagNode,
          createTaggingCommandsExtension({
            instanceId: "test",
            configuration: ref([configuration] as any),
          }),
        ],
        content,
      });
    };

    it("tagging a selection across a hard break keeps the break", async () => {
      const editor = await buildTaggingEditor("<p>ab=<br>cd</p>");

      editor.commands.setTextSelection({ from: 2, to: 6 });
      await editor.commands.linkEntityToTaggedText({
        id: "W-42",
        type: "word",
      } as any);

      const html = editor.getHTML();
      expect(html).toMatch(/a<elody-w[^>]*>b=<br>c<\/elody-w>d/);

      editor.destroy();
    });

    it("tagging a selection across two paragraphs joins them with a break", async () => {
      const editor = await buildTaggingEditor("<p>ab=</p><p>cd</p>");

      editor.commands.setTextSelection({ from: 2, to: 7 });
      await editor.commands.linkEntityToTaggedText({
        id: "W-42",
        type: "word",
      } as any);

      expect(editor.getHTML()).toMatch(
        /^<p>a<elody-w[^>]*>b=<br>c<\/elody-w>d<\/p>$/,
      );

      editor.destroy();
    });

    it("survives a parse -> re-render round trip of stored HTML", async () => {
      const editor = await buildTaggingEditor(
        '<p>a<elody-w type="person" data-entity-id="W-42" lemma="ktb">b=<br>c</elody-w>d</p>',
      );

      expect(editor.getHTML()).toMatch(/a<elody-w[^>]*>b=<br>c<\/elody-w>d/);

      editor.destroy();
    });

    it("draws each line as its own tag piece so Firefox aligns RTL lines correctly", async () => {
      const editor = await buildTaggingEditor(
        '<p>a<elody-w type="person" data-entity-id="W-42" lemma="ktb">b=<br>c</elody-w>d</p>',
      );

      expect(editor.view.dom.innerHTML).toMatch(
        /a<span[^>]*style="display: contents;"[^>]*><elody-w[^>]*>b=<\/elody-w><br><elody-w[^>]*>c<\/elody-w><\/span>d/,
      );
      expect(editor.getHTML()).toMatch(/a<elody-w[^>]*>b=<br>c<\/elody-w>d/);

      editor.destroy();
    });

    it("draws a single-line tag as one plain element", async () => {
      const editor = await buildTaggingEditor(
        '<p>a<elody-w type="person" data-entity-id="W-42" lemma="ktb">bc</elody-w>d</p>',
      );

      expect(editor.view.dom.innerHTML).toMatch(
        /a<elody-w[^>]*>bc<\/elody-w>d/,
      );

      editor.destroy();
    });

    it.each([
      ["a hard break", "<p>عبد<br>الله</p>", 9],
      ["two paragraphs", "<p>عبد</p><p>الله</p>", 10],
    ])(
      "hands the tag modal a <br> for a selection across %s",
      async (_, content, to) => {
        const editor = await buildTaggingEditor(content);
        openModal.mockClear();

        editor.commands.setTextSelection({ from: 1, to });
        editor.commands.openTagModal();

        expect(openModal.mock.calls[0][6].selectedText).toBe("عبد<br>الله");

        editor.destroy();
      },
    );

    it("untagging restores the hard break", async () => {
      const editor = await buildTaggingEditor(
        '<p>a<elody-w type="person" data-entity-id="W-42" lemma="ktb">b=<br>c</elody-w>d</p>',
      );

      editor.commands.setTextSelection({ from: 2, to: 3 });
      await editor.commands.untagSelectedText();

      expect(editor.getHTML()).toBe("<p>ab=<br>cd</p>");

      editor.destroy();
    });
  });
});
