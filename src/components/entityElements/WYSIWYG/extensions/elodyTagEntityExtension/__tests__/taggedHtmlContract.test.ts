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

// Short-circuit the app-wide import chain (main.ts -> App.vue -> ...) that the
// extension pulls in via useBaseModal / useBulkOperations. CI tears the env down
// before async imports resolve, causing false failures.
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

const { createTipTapNodeExtension } = await import("../ElodyTaggingExtension");

/**
 * AICAP's live shape, as produced by createConfigurationItemsFromMapping from an
 * `epi_doc_tag` configuration entity. Mirrors clients/ugent-aicap/.../queries/
 * entities/inscription.queries.ts:224-259.
 */
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
    const { default: HardBreak } = await import(
      "@tiptap/extension-hard-break"
    );
    extensions.push(HardBreak);
  }

  return new Editor({ extensions, content });
};

/** The JS mirror of descriptive_markup_parser.py:29's well-formedness gate. */
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

    // The element name derives from config.tag, NOT from the node type name.
    // A `-EDT-1` suffix leaking in here would make descriptive_markup_parser.py
    // fail to match, so the tag would never be renamed and the word never linked.
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
    // reading_parser.py:27 matches on a BARE `type` attribute and :40 reads a BARE
    // `lemma`. Not data-type / data-lemma. Rendering these as data-* would silently
    // detach every word from its tag.
    expect(html).toContain('type="person"');
    expect(html).toContain('lemma="ktb"');
    expect(html).not.toContain("data-type=");
    expect(html).not.toContain("data-lemma=");
    expect(html).toContain(">maktub<");

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
    // This is the direction AICAP actually hits first on every page load: the
    // editor is constructed with `content: <stored value>`, which runs parseHTML,
    // and any subsequent edit re-serializes the whole document. If an attribute is
    // lost or mangled in that round trip, the next save writes HTML that
    // reading_parser.py:27 no longer matches -> the word detaches -> the
    // delete_dangling_words cron removes the word entity.
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
    // descriptive_markup_parser.py:20 matches "<br>" literally and :21-24 splits the
    // value into lines on it. "<br/>" or "<br >" would not match, so the whole
    // line-numbering and line-splitting behaviour silently changes. This pins the
    // serialization across any @tiptap/extension-hard-break version bump.
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
    // AICAP researchers tag sub-strings of a single word, so the element sits
    // inside a word with no adjacent whitespace. Any injected space here would be
    // baked in by descriptive_markup_parser.py:15-19 and corrupt the word boundary.
    const configuration = aicapConfiguration();
    const editor = await buildEditor("<p>maktub</p>", configuration);

    // "maktub" occupies doc positions 1..7; select "ktb" -> [4, 7) is "tub", so
    // target the inner "ktu" span [3, 6] to sit strictly inside the word.
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

    // Flanking characters survive, and no space is introduced on either side.
    expect(html).toContain("ma<elody-w");
    expect(html).toMatch(/<\/elody-w>b/);
    expect(html).not.toMatch(/\s<elody-w/);
    expect(html).not.toMatch(/<\/elody-w>\s/);
    expect(parsesAsXml(html)).toBe(true);

    editor.destroy();
  });
});
