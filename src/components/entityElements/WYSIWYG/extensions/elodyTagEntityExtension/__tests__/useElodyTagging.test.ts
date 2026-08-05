/**
 * Guards the reason useElodyTagging exists: two editors on one page must not share
 * tagging state, and node type names must not drift across remounts.
 *
 * Both assertions below fail against the pre-refactor module-level implementation —
 * the first because `customExtensionNames` was push-only and never cleared, the
 * second because `setExtensionConfiguration` overwrote a single shared array so the
 * last editor to initialise won.
 */
import { describe, expect, it, vi } from "vitest";

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

/**
 * A configuration carrying a top-level `tag` and no `tagConfigurationByEntity`, so
 * no configuration entities are fetched and the test needs no Apollo mock.
 */
const configurationFor = (tag: string, entityType: string) =>
  [
    {
      tag,
      taggableEntityType: entityType,
      relationType: `ref_${tag}`,
      createNewEntityFormQuery: "q",
      metadataFilterForTagContent: "title",
      metadataKeysToSetAsAttribute: [],
      tagConfigurationByEntity: null,
    },
  ] as any;

describe("useElodyTagging", () => {
  it("keeps two concurrent instances independent", async () => {
    const wordTagging = await useElodyTagging(
      "instance-a",
      configurationFor("word", "word"),
    );
    const personTagging = await useElodyTagging(
      "instance-b",
      configurationFor("person", "person"),
    );

    // Instance A still resolves A's configuration, and B cannot see it.
    expect(
      wordTagging.getConfigurationForEntity({ type: "word" })?.relationType,
    ).toBe("ref_word");
    expect(
      personTagging.getConfigurationForEntity({ type: "word" }),
    ).toBeUndefined();
    expect(
      personTagging.getConfigurationForEntity({ type: "person" })
        ?.relationType,
    ).toBe("ref_person");

    wordTagging.destroy();
    personTagging.destroy();
  });

  it("generates the same node type name when the same editor remounts", async () => {
    const firstMount = await useElodyTagging(
      "instance-a",
      configurationFor("word", "word"),
    );
    const remount = await useElodyTagging(
      "instance-a",
      configurationFor("word", "word"),
    );

    expect(remount.configuration.value[0].extensionName).toBe(
      firstMount.configuration.value[0].extensionName,
    );
    expect(remount.configuration.value[0].extensionName).toBe("word");

    firstMount.destroy();
    remount.destroy();
  });

  it("builds one node extension per configuration, plus the commands extension", async () => {
    const tagging = await useElodyTagging(
      "instance-a",
      configurationFor("word", "word"),
    );

    // One node + one commands extension. Entity-derived configurations used to be
    // built twice, registering two node types that both parsed `elody-<tag>`.
    expect(tagging.extensions).toHaveLength(2);
    expect(tagging.extensions.filter((e: any) => e.name === "word")).toHaveLength(
      1,
    );

    tagging.destroy();
  });

  it("removes its injected style element on destroy", async () => {
    const configuration = configurationFor("word", "word");
    configuration[0].tagColor = "#ff0000";

    const tagging = await useElodyTagging("instance-css", configuration);
    expect(document.getElementById("elody-tagging-instance-css")).not.toBeNull();

    tagging.destroy();
    expect(document.getElementById("elody-tagging-instance-css")).toBeNull();
  });
});
