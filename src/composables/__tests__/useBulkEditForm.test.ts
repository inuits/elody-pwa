import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMock = vi.fn();
vi.mock("@/main", () => ({
  apolloClient: { query: (...args: any[]) => queryMock(...args) },
}));

const loadDocumentMock = vi.fn();
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: loadDocumentMock }),
}));

import {
  useBulkEditForm,
  type ExtractedForm,
} from "@/composables/useBulkEditForm";
import { BulkEditModes } from "@/generated-types/queries";

const {
  buildMergedBulkEditForm,
  mergeFormFields,
  metadataKeysForType,
  buildJsonDocuments,
  groupIdsByType,
  relationsForType,
  relationTypesForType,
  resolveSucceededIds,
  clearBulkEditFormCache,
} = useBulkEditForm();

const metaField = (
  key: string,
  inputFieldType: string,
  extra: object = {},
) => ({
  __typename: "PanelMetaData",
  key,
  label: `metadata.labels.${key}`,
  inputField: { type: inputFieldType, validation: { value: ["required"] } },
  ...extra,
});

const form = (
  creationType: string,
  fields: Record<string, any>,
): ExtractedForm => ({
  queryName: `Get${creationType}Form`,
  creationType,
  fields,
});

// Mirrors the real vlacc shape: one FormTab keyed by an alias, a create FormAction
// carrying creationType, and the fields alongside it.
const formDocumentResult = (
  creationType: string,
  fields: Record<string, any>,
) => ({
  data: {
    GetDynamicForm: {
      label: "navigation.create-something",
      SomeTab: {
        __typename: "FormTab",
        formFields: {
          __typename: "FormFields",
          ...fields,
          createAction: {
            __typename: "FormAction",
            actionType: "submit",
            creationType,
          },
        },
      },
    },
  },
});

describe("mergeFormFields", () => {
  it("merges a field defined identically on every type into one universal field", () => {
    const merged = mergeFormFields(
      [
        form("work_map", {
          quality_marks: metaField("quality_marks", "dropdown"),
        }),
        form("work_word", {
          quality_marks: metaField("quality_marks", "dropdown"),
        }),
      ],
      ["work_map", "work_word"],
    );

    expect(Object.keys(merged.formFields)).toContain("quality_marks");
    expect(merged.formFields.quality_marks.onlyForEntityTypes).toBeUndefined();
    expect(merged.fieldTypeMap).toEqual({});
    expect(merged.conflicts).toEqual([]);
  });

  it("annotates a field that only some selected types have", () => {
    const merged = mergeFormFields(
      [
        form("work_map", { scale: metaField("scale", "text") }),
        form("work_word", {
          quality_marks: metaField("quality_marks", "dropdown"),
        }),
      ],
      ["work_map", "work_word"],
    );

    expect(merged.formFields.scale.onlyForEntityTypes).toEqual(["work_map"]);
    expect(merged.fieldTypeMap).toEqual({
      scale: ["work_map"],
      quality_marks: ["work_word"],
    });
  });

  it("keeps the majority input field when one key has two different input fields", () => {
    // The real case: literary_type is literaryTypeForWorkMapTypeField on work_map
    // and literaryTypeTypeField on word/serial.
    const merged = mergeFormFields(
      [
        form("work_map", {
          literary_type: metaField(
            "literary_type",
            "literaryTypeForWorkMapTypeField",
          ),
        }),
        form("work_word", {
          literary_type: metaField("literary_type", "literaryTypeTypeField"),
        }),
        form("work_serial", {
          literary_type: metaField("literary_type", "literaryTypeTypeField"),
        }),
      ],
      ["work_map", "work_word", "work_serial"],
    );

    expect(merged.formFields.literary_type.inputField.type).toBe(
      "literaryTypeTypeField",
    );
    expect(merged.formFields.literary_type.onlyForEntityTypes).toEqual([
      "work_word",
      "work_serial",
    ]);
    expect(merged.conflicts).toEqual([
      {
        key: "literary_type",
        keptInputField: "literaryTypeTypeField",
        droppedTypes: ["work_map"],
      },
    ]);
  });

  it("ignores forms for types that are not in the selection", () => {
    const merged = mergeFormFields(
      [
        form("work_map", { scale: metaField("scale", "text") }),
        form("work_word", {
          quality_marks: metaField("quality_marks", "dropdown"),
        }),
      ],
      ["work_word"],
    );

    expect(Object.keys(merged.formFields)).not.toContain("scale");
    expect(merged.formFields.quality_marks.onlyForEntityTypes).toBeUndefined();
  });

  it("strips validation and defaults but keeps the input field itself", () => {
    const merged = mergeFormFields(
      [
        form("work_word", {
          original_headtitle: metaField("original_headtitle", "text", {
            defaultValue: { value: "x" },
          }),
        }),
      ],
      ["work_word"],
    );

    const field = merged.formFields.original_headtitle;
    expect(field.inputField.type).toBe("text");
    expect(field.inputField.validation).toBeUndefined();
    expect(field.defaultValue).toBeUndefined();
  });

  it("marks a field required on every type that carries it", () => {
    const merged = mergeFormFields(
      [
        form("work_map", { title: metaField("title", "text") }),
        form("work_word", { title: metaField("title", "text") }),
      ],
      ["work_map", "work_word"],
    );

    expect(merged.formFields.title.requiredForAllTypes).toBe(true);
  });

  it("does not mark a field that is optional on one of its types", () => {
    const merged = mergeFormFields(
      [
        form("work_map", { title: metaField("title", "text") }),
        form("work_word", {
          title: metaField("title", "text", {
            inputField: { type: "text", validation: { value: ["numeric"] } },
          }),
        }),
      ],
      ["work_map", "work_word"],
    );

    expect(merged.formFields.title.requiredForAllTypes).toBe(false);
  });

  it("ignores the required rule of a type excluded by an input field conflict", () => {
    const merged = mergeFormFields(
      [
        form("work_map", {
          literary_type: metaField(
            "literary_type",
            "literaryTypeForWorkMapTypeField",
          ),
        }),
        form("work_word", {
          literary_type: metaField("literary_type", "literaryTypeTypeField", {
            inputField: {
              type: "literaryTypeTypeField",
              validation: { value: [] },
            },
          }),
        }),
        form("work_serial", {
          literary_type: metaField("literary_type", "literaryTypeTypeField", {
            inputField: {
              type: "literaryTypeTypeField",
              validation: { value: [] },
            },
          }),
        }),
      ],
      ["work_map", "work_word", "work_serial"],
    );

    expect(merged.formFields.literary_type.requiredForAllTypes).toBe(false);
  });

  it("does not mutate the source field objects", () => {
    const source = metaField("quality_marks", "dropdown");
    mergeFormFields(
      [form("work_word", { quality_marks: source })],
      ["work_word"],
    );
    expect(source.inputField.validation).toBeDefined();
  });

  it("appends a bulk submit action", () => {
    const merged = mergeFormFields(
      [
        form("work_word", {
          quality_marks: metaField("quality_marks", "dropdown"),
        }),
      ],
      ["work_word"],
    );

    expect(merged.formFields.bulkEditAction).toMatchObject({
      __typename: "FormAction",
      actionType: "bulkUpdateMetadata",
    });
  });

  it("skips fields without an input field, which DynamicForm cannot render", () => {
    const merged = mergeFormFields(
      [
        form("work_word", {
          readonly_thing: {
            __typename: "PanelMetaData",
            key: "readonly_thing",
          },
        }),
      ],
      ["work_word"],
    );

    expect(Object.keys(merged.formFields)).not.toContain("readonly_thing");
  });
});

describe("metadataKeysForType", () => {
  const fieldTypeMap = { scale: ["work_map"], literary_type: ["work_word"] };

  it("always includes keys that are not type-scoped", () => {
    expect(
      metadataKeysForType(["quality_marks", "scale"], fieldTypeMap, "work_map"),
    ).toEqual(["quality_marks", "scale"]);
  });

  it("drops type-scoped keys for other types", () => {
    expect(
      metadataKeysForType(
        ["quality_marks", "scale"],
        fieldTypeMap,
        "work_word",
      ),
    ).toEqual(["quality_marks"]);
  });

  it("compares types case-insensitively", () => {
    expect(metadataKeysForType(["scale"], fieldTypeMap, "WORK_MAP")).toEqual([
      "scale",
    ]);
  });
});

describe("buildJsonDocuments", () => {
  const byType = { work_map: ["a", "b"], work_word: ["c"] };
  const payload = {
    metadata: [
      { key: "quality_marks", value: ["awarded"] },
      { key: "scale", value: "1:5000" },
    ],
    relationsToReplace: [{ type: "refLanguages", key: "lang-nl" }],
  };
  const fieldTypeMap = { scale: ["work_map"] };

  it("gives each entity only the metadata keys its type has", () => {
    const documents = buildJsonDocuments(
      byType,
      payload,
      fieldTypeMap,
      BulkEditModes.Add,
    );

    expect(documents).toHaveLength(3);
    expect(documents[0]).toMatchObject({
      id: "a",
      identifiers: ["a"],
      type: "work_map",
      metadata: payload.metadata,
    });
    expect(documents[2]).toMatchObject({
      id: "c",
      type: "work_word",
      metadata: [{ key: "quality_marks", value: ["awarded"] }],
    });
  });

  it("omits relations entirely unless they are being replaced", () => {
    // The batch endpoint overwrites every relation of a type it sees, so an add or
    // remove must never travel this way: an absent key is what keeps them safe.
    for (const mode of [BulkEditModes.Add, BulkEditModes.Remove]) {
      const documents = buildJsonDocuments(byType, payload, fieldTypeMap, mode);
      documents.forEach((document: any) =>
        expect(document).not.toHaveProperty("relations"),
      );
    }
  });

  it("sends relations when replacing them", () => {
    const documents = buildJsonDocuments(
      byType,
      payload,
      fieldTypeMap,
      BulkEditModes.Replace,
    );

    documents.forEach((document: any) =>
      expect(document.relations).toEqual(payload.relationsToReplace),
    );
  });

  it("skips a type that would carry no change at all", () => {
    const documents = buildJsonDocuments(
      byType,
      { metadata: [{ key: "scale", value: "1:5000" }], relationsToReplace: [] },
      fieldTypeMap,
      BulkEditModes.Add,
    );

    expect(documents.map((document: any) => document.id)).toEqual(["a", "b"]);
  });

  it("still writes a type-scoped relation replacement when no metadata changed", () => {
    const documents = buildJsonDocuments(
      byType,
      { metadata: [], relationsToReplace: payload.relationsToReplace },
      fieldTypeMap,
      BulkEditModes.Replace,
    );

    expect(documents).toHaveLength(3);
    expect(documents[0]).toMatchObject({ metadata: [] });
  });

  it("keeps a scoped relation replacement off the types it does not apply to", () => {
    const documents = buildJsonDocuments(
      byType,
      { metadata: [], relationsToReplace: payload.relationsToReplace },
      fieldTypeMap,
      BulkEditModes.Replace,
      { refLanguages: ["work_map"] },
    );

    // work_word never saw the field, so replacing its languages would wipe them.
    expect(documents.map((document: any) => document.id)).toEqual(["a", "b"]);
    expect(documents[0].relations).toEqual(payload.relationsToReplace);
  });
});

describe("resolveSucceededIds", () => {
  const ids = ["a", "b", "c"];

  it("needs only the transports that carried an id to report it", () => {
    const transports = [
      { carriedIds: ["a"], succeededIds: ["a"] },
      { carriedIds: ["b"], succeededIds: ["b"] },
    ];

    expect(resolveSucceededIds(ids, transports, new Set())).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("fails an id a transport that carried it did not report", () => {
    const transports = [
      { carriedIds: ["a", "b"], succeededIds: ["a", "b"] },
      { carriedIds: ["a"], succeededIds: [] },
    ];

    expect(resolveSucceededIds(ids, transports, new Set())).toEqual(["b", "c"]);
  });

  it("fails an explicitly failed id even when another transport reported it", () => {
    const transports = [{ carriedIds: ids, succeededIds: ids }];

    expect(resolveSucceededIds(ids, transports, new Set(["c"]))).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("relation scoping", () => {
  const scope = { refLanguages: ["work_map"] };

  it("passes an unscoped relation type to every entity type", () => {
    const relations = [{ type: "refAuthors", key: "person-1" }];

    expect(relationsForType(relations, scope, "work_word")).toEqual(relations);
    expect(relationTypesForType(["refAuthors"], scope, "work_word")).toEqual([
      "refAuthors",
    ]);
  });

  it("drops a scoped relation type for a type outside the scope", () => {
    const relations = [{ type: "refLanguages", key: "lang-nl" }];

    expect(relationsForType(relations, scope, "work_word")).toEqual([]);
    expect(relationsForType(relations, scope, "work_map")).toEqual(relations);
    expect(relationTypesForType(["refLanguages"], scope, "work_word")).toEqual(
      [],
    );
  });
});

describe("groupIdsByType", () => {
  it("groups ids per type and reports items without a type", () => {
    const { byType, missingType } = groupIdsByType([
      { id: "a", type: "work_map" },
      { id: "b", type: "work_word" },
      { id: "c", type: "work_map" },
      { id: "d" },
    ] as any);

    expect(byType).toEqual({ work_map: ["a", "c"], work_word: ["b"] });
    expect(missingType).toEqual(["d"]);
  });
});

describe("buildMergedBulkEditForm", () => {
  beforeEach(() => {
    clearBulkEditFormCache();
    queryMock.mockReset();
    loadDocumentMock.mockReset();
    loadDocumentMock.mockImplementation(async (name: string) =>
      name === "MissingForm" ? undefined : { name },
    );
  });

  it("fetches each form, derives its type from creationType, and merges", async () => {
    queryMock.mockImplementation(async ({ query }: any) =>
      query.name === "MapForm"
        ? formDocumentResult("work_map", { scale: metaField("scale", "text") })
        : formDocumentResult("work_word", {
            quality_marks: metaField("quality_marks", "dropdown"),
          }),
    );

    const merged = await buildMergedBulkEditForm(
      ["MapForm", "WordForm"],
      ["work_map", "work_word"],
    );

    expect(Object.keys(merged.formFields).sort()).toEqual([
      "bulkEditAction",
      "quality_marks",
      "scale",
    ]);
    expect(merged.unmatchedTypes).toEqual([]);
  });

  it("skips an unresolvable query name instead of failing the whole form", async () => {
    queryMock.mockResolvedValue(
      formDocumentResult("work_word", {
        quality_marks: metaField("quality_marks", "dropdown"),
      }),
    );

    const merged = await buildMergedBulkEditForm(
      ["MissingForm", "WordForm"],
      ["work_word"],
    );

    expect(Object.keys(merged.formFields)).toContain("quality_marks");
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("reports selected types that no form claimed", async () => {
    queryMock.mockResolvedValue(
      formDocumentResult("work_word", {
        quality_marks: metaField("quality_marks", "dropdown"),
      }),
    );

    const merged = await buildMergedBulkEditForm(
      ["WordForm"],
      ["work_word", "work_music"],
    );

    expect(merged.unmatchedTypes).toEqual(["work_music"]);
  });

  it("fetches each form once and reuses it on the next open", async () => {
    queryMock.mockResolvedValue(
      formDocumentResult("work_word", {
        quality_marks: metaField("quality_marks", "dropdown"),
      }),
    );

    await buildMergedBulkEditForm(["WordForm"], ["work_word"]);
    await buildMergedBulkEditForm(["WordForm"], ["work_word"]);

    expect(queryMock).toHaveBeenCalledTimes(1);
  });
});
