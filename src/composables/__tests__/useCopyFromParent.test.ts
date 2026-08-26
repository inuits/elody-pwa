import { describe, expect, it } from "vitest";
import {
  buildCopyPlan,
  plansToNestedValues,
  readParentValue,
  resolveFieldCopyConfig,
  shouldShowCopyButton,
  type CopyFromParentConfig,
} from "@/composables/useCopyFromParent";
import { InputFieldTypes, type PanelMetaData } from "@/generated-types/queries";

// A dynamic-form field as it arrives from the GraphQL form definition.
const field = (
  key: string,
  overrides: Partial<PanelMetaData> = {},
): PanelMetaData =>
  ({
    __typename: "PanelMetaData",
    key,
    label: `metadata.labels.${key}`,
    inputField: { type: InputFieldTypes.Text, isMetadataField: true },
    ...overrides,
  }) as unknown as PanelMetaData;

const relationField = (key: string, relationType: string): PanelMetaData =>
  ({
    __typename: "PanelMetaData",
    key,
    inputField: {
      type: InputFieldTypes.DropdownMultiselectRelations,
      relationType,
      isMetadataField: false,
    },
  }) as unknown as PanelMetaData;

const tableField = (key: string, relationType: string): PanelMetaData =>
  ({
    __typename: "PanelMetaData",
    key,
    inputField: {
      type: InputFieldTypes.InputFieldWithSubFields,
      relationType,
      isMetadataField: false,
      subFields: [{ key: "name" }],
    },
  }) as unknown as PanelMetaData;

const parent = (intialValues: Record<string, any>, relationValues = {}) => ({
  intialValues,
  relationValues,
});

describe("readParentValue", () => {
  it("reads a plain metadata value", () => {
    expect(readParentValue(parent({ title: "Dune" }), "title")).toBe("Dune");
  });

  it("falls back to relationValues when the key is not metadata", () => {
    const buckets = parent({}, { ref_languages: ["nl"] });
    expect(readParentValue(buckets, "ref_languages")).toEqual(["nl"]);
  });

  it("falls back to relationMetadata last", () => {
    const buckets = { intialValues: {}, relationMetadata: { role: "aut" } };
    expect(readParentValue(buckets, "role")).toBe("aut");
  });

  it("treats empty string, empty array and null as absent", () => {
    const buckets = parent({ a: "", b: [], c: null });
    expect(readParentValue(buckets, "a")).toBeUndefined();
    expect(readParentValue(buckets, "b")).toBeUndefined();
    expect(readParentValue(buckets, "c")).toBeUndefined();
  });

  it("keeps false and 0 — they are real values", () => {
    const buckets = parent({ flag: false, count: 0 });
    expect(readParentValue(buckets, "flag")).toBe(false);
    expect(readParentValue(buckets, "count")).toBe(0);
  });
});

describe("resolveFieldCopyConfig", () => {
  const config: CopyFromParentConfig = {
    autoCopy: true,
    labelPrefix: "bulk-operations.copy",
    fromRelationType: "refWork",
  };

  it("maps a field to the parent key of the same name by default", () => {
    expect(resolveFieldCopyConfig(field("title"), config)).toMatchObject({
      key: "title",
      fromKey: "title",
      fromRelationType: "refWork",
      autoCopy: true,
    });
  });

  it("honours keyMap for a differently named parent key", () => {
    const withMap: CopyFromParentConfig = {
      ...config,
      keyMap: [{ key: "title", fromKey: "original_headtitle" }],
    };
    expect(resolveFieldCopyConfig(field("title"), withMap)).toMatchObject({
      fromKey: "original_headtitle",
      fromRelationType: "refWork",
    });
  });

  it("lets a keyMap entry override the relation hop", () => {
    const withMap: CopyFromParentConfig = {
      ...config,
      keyMap: [
        { key: "title", fromKey: "t", fromRelationType: "refExpression" },
      ],
    };
    expect(
      resolveFieldCopyConfig(field("title"), withMap)?.fromRelationType,
    ).toBe("refExpression");
  });

  it("restricts to the keys allowlist when one is configured", () => {
    const withKeys: CopyFromParentConfig = { ...config, keys: ["title"] };
    expect(resolveFieldCopyConfig(field("title"), withKeys)).toBeDefined();
    expect(resolveFieldCopyConfig(field("subtitle"), withKeys)).toBeUndefined();
  });

  it("drops excluded keys", () => {
    const withExclude: CopyFromParentConfig = {
      ...config,
      excludeKeys: ["status_field"],
    };
    expect(
      resolveFieldCopyConfig(field("status_field"), withExclude),
    ).toBeUndefined();
  });

  it("builds the button label from labelPrefix and the field key", () => {
    expect(resolveFieldCopyConfig(field("title"), config)?.label).toBe(
      "bulk-operations.copy.title",
    );
  });

  it("returns undefined when there is no config at all", () => {
    expect(resolveFieldCopyConfig(field("title"), undefined)).toBeUndefined();
  });

  it("uses the per-field override for source key, relation and label", () => {
    const overridden = field("title", {
      copyValueFromParent: {
        key: "original_headtitle",
        label: "bulk-operations.copy-title-from-work",
        fromRelationType: "refWork",
      },
    } as Partial<PanelMetaData>);

    expect(resolveFieldCopyConfig(overridden, undefined)).toMatchObject({
      key: "title",
      fromKey: "original_headtitle",
      fromRelationType: "refWork",
      label: "bulk-operations.copy-title-from-work",
    });
  });

  it("keeps a per-field override even when the form config excludes the key", () => {
    const overridden = field("title", {
      copyValueFromParent: { key: "original_headtitle", autoCopy: true },
    } as Partial<PanelMetaData>);
    const withExclude: CopyFromParentConfig = {
      ...config,
      excludeKeys: ["title"],
    };

    expect(resolveFieldCopyConfig(overridden, withExclude)).toMatchObject({
      fromKey: "original_headtitle",
      autoCopy: true,
    });
  });

  it("lets an explicit per-field autoCopy:false win over the form config", () => {
    const overridden = field("title", {
      copyValueFromParent: { key: "title", autoCopy: false },
    } as Partial<PanelMetaData>);

    expect(resolveFieldCopyConfig(overridden, config)?.autoCopy).toBe(false);
  });

  it("inherits autoCopy from the form config when the field does not set it", () => {
    const overridden = field("title", {
      copyValueFromParent: {
        key: "original_headtitle",
        label: "bulk-operations.copy-title-from-work",
      },
    } as Partial<PanelMetaData>);

    expect(resolveFieldCopyConfig(overridden, config)?.autoCopy).toBe(true);
    expect(
      resolveFieldCopyConfig(overridden, { ...config, autoCopy: false })
        ?.autoCopy,
    ).toBe(false);
  });
});

describe("buildCopyPlan", () => {
  const config: CopyFromParentConfig = { autoCopy: true };

  it("only plans fields for which the parent actually has a value", () => {
    const plan = buildCopyPlan(
      [field("title"), field("subtitle"), field("format")],
      config,
      () => parent({ title: "Dune", subtitle: "" }),
    );

    expect(plan.map((entry) => entry.key)).toEqual(["title"]);
    expect(plan[0].value).toBe("Dune");
  });

  it("reads through fromRelationType to the related entity's form", () => {
    const plan = buildCopyPlan(
      [field("title")],
      { autoCopy: true, fromRelationType: "refWork" },
      (relationType) =>
        relationType === "refWork"
          ? parent({ title: "Work Head Title" })
          : parent({}),
    );

    expect(plan[0].value).toBe("Work Head Title");
  });

  it("falls back to the host parent when the related form has no value", () => {
    // Preserves the guided-flow behaviour: a manifestation step reads from the
    // picked work, but the muziekweb host still supplies keys the work lacks.
    const plan = buildCopyPlan(
      [field("ean_group")],
      { autoCopy: true, fromRelationType: "refWork" },
      (relationType) =>
        relationType ? parent({}) : parent({ ean_group: "123" }),
    );

    expect(plan[0].value).toBe("123");
  });

  it("returns an empty plan when nothing is configured", () => {
    expect(
      buildCopyPlan([field("title")], undefined, () =>
        parent({ title: "Dune" }),
      ),
    ).toEqual([]);
  });
});

describe("plansToNestedValues", () => {
  const readAll = () =>
    parent(
      { title: "Dune", ref_languages: ["nl"] },
      { refAuthors: [{ key: "P-1", type: "refAuthors" }] },
    );

  it("puts a metadata field under intialValues", () => {
    const plan = buildCopyPlan([field("title")], { autoCopy: true }, readAll);
    expect(plansToNestedValues(plan)).toEqual({
      intialValues: { title: "Dune" },
    });
  });

  it("puts a relation dropdown under relationValues, keyed by relation type", () => {
    const plan = buildCopyPlan(
      [relationField("ref_languages", "ref_languages")],
      { autoCopy: true },
      readAll,
    );

    expect(plansToNestedValues(plan)).toEqual({
      relationValues: { ref_languages: ["nl"] },
    });
  });

  it("keeps relation values raw so the autocomplete can resolve the entity ids", () => {
    // buildPrefill must not try to resolve names to ids itself:
    // ViewModesAutocompleteRelations.preSelectRelations does that, by id when the
    // value looks like an entity id and by text search otherwise.
    const plan = buildCopyPlan(
      [relationField("refPlaces", "refPlaces")],
      { autoCopy: true },
      () => parent({ refPlaces: ["Antwerpen", "PL-42"] }),
    );

    expect(plansToNestedValues(plan)).toEqual({
      relationValues: { refPlaces: ["Antwerpen", "PL-42"] },
    });
  });

  it("puts a sub-field table under relationValues, keyed by the field key", () => {
    const plan = buildCopyPlan(
      [tableField("refAuthors", "refAuthors")],
      { autoCopy: true },
      readAll,
    );

    expect(plansToNestedValues(plan)).toEqual({
      relationValues: { refAuthors: [{ key: "P-1", type: "refAuthors" }] },
    });
  });

  it("merges every bucket into one nested object", () => {
    const plan = buildCopyPlan(
      [field("title"), relationField("ref_languages", "ref_languages")],
      { autoCopy: true },
      readAll,
    );

    expect(plansToNestedValues(plan)).toEqual({
      intialValues: { title: "Dune" },
      relationValues: { ref_languages: ["nl"] },
    });
  });

  it("skips entries whose autoCopy resolved to false", () => {
    const plan = buildCopyPlan(
      [
        field("title"),
        field("subtitle", {
          copyValueFromParent: { key: "subtitle", autoCopy: false },
        } as Partial<PanelMetaData>),
      ],
      { autoCopy: true },
      () => parent({ title: "Dune", subtitle: "Book two" }),
    );

    expect(plansToNestedValues(plan, { autoCopyOnly: true })).toEqual({
      intialValues: { title: "Dune" },
    });
  });
});

describe("shouldShowCopyButton", () => {
  const buttonField = field("title", {
    copyValueFromParent: {
      key: "original_headtitle",
      label: "bulk-operations.copy-title-from-work",
      fromRelationType: "refWork",
    },
  } as Partial<PanelMetaData>);

  const entryFor = (
    target: PanelMetaData,
    config: CopyFromParentConfig | undefined,
  ) =>
    buildCopyPlan([target], config, () =>
      parent({ original_headtitle: "Dune", title: "Dune" }),
    )[0];

  it("shows a button for a field that configures its own label, with no form config", () => {
    // manifestation.queries.ts configures button-only copies per field; those must
    // keep working for forms that declare no form-level copyFromParent at all.
    const entry = entryFor(buttonField, undefined);
    expect(shouldShowCopyButton(entry, undefined)).toBe(true);
  });

  it("shows a button for every field once the form asks for buttons", () => {
    const config: CopyFromParentConfig = {
      showCopyButtons: true,
      labelPrefix: "bulk-operations.copy",
    };
    const entry = entryFor(field("title"), config);
    expect(shouldShowCopyButton(entry, config)).toBe(true);
  });

  it("hides the button when the form does not ask for buttons", () => {
    const config: CopyFromParentConfig = {
      autoCopy: true,
      labelPrefix: "bulk-operations.copy",
    };
    const entry = entryFor(field("title"), config);
    expect(shouldShowCopyButton(entry, config)).toBe(false);
  });

  it("hides the button when there is no label to put on it", () => {
    const config: CopyFromParentConfig = { showCopyButtons: true };
    const entry = entryFor(field("title"), config);
    expect(shouldShowCopyButton(entry, config)).toBe(false);
  });

  it("hides the button when the parent has no value for the field", () => {
    const config: CopyFromParentConfig = {
      showCopyButtons: true,
      labelPrefix: "bulk-operations.copy",
    };
    const plan = buildCopyPlan([field("format")], config, () => parent({}));
    expect(plan).toEqual([]);
    expect(shouldShowCopyButton(undefined, config)).toBe(false);
  });
});
