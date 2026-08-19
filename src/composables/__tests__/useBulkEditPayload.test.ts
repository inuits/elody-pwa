import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";
import { BulkEditModes, EditStatus } from "@/generated-types/queries";

vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn() },
}));

const { buildBulkEditPayload, editableFields } = useFormHelper();

const formId = "bulk-edit";

const relation = (type: string, key: string, editStatus = EditStatus.New) => ({
  type,
  key,
  editStatus,
});

// Every rendered field key exists in intialValues from setup, so "the user
// touched it" is the only signal that separates a real edit from a blank write.
const allDirty = () => true;
const noneDirty = () => false;

describe("buildBulkEditPayload", () => {
  beforeEach(() => {
    editableFields.value[formId] = ["quality_marks", "record_format"];
  });

  it("emits no metadata for untouched fields", () => {
    const payload = buildBulkEditPayload(
      { intialValues: { quality_marks: undefined, record_format: "" } as any },
      { formId, isFieldDirty: noneDirty },
    );

    expect(payload.metadata).toEqual([]);
  });

  it("emits only the touched metadata fields", () => {
    const payload = buildBulkEditPayload(
      {
        intialValues: {
          quality_marks: ["awarded"],
          record_format: undefined,
        } as any,
      },
      {
        formId,
        isFieldDirty: (path: string) => path === "intialValues.quality_marks",
      },
    );

    expect(payload.metadata).toEqual([
      { key: "quality_marks", value: ["awarded"] },
    ]);
  });

  it("emits an emptied field so a bulk clear is possible", () => {
    const payload = buildBulkEditPayload(
      { intialValues: { record_format: "" } as any },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.metadata).toEqual([{ key: "record_format", value: "" }]);
  });

  it("keeps a key stripped by canEdit permissions out of the payload", () => {
    editableFields.value[formId] = ["quality_marks"];

    const payload = buildBulkEditPayload(
      {
        intialValues: {
          quality_marks: ["awarded"],
          record_format: "book",
        } as any,
      },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.metadata).toEqual([
      { key: "quality_marks", value: ["awarded"] },
    ]);
  });

  it("extracts the label from a formatter value", () => {
    const payload = buildBulkEditPayload(
      {
        intialValues: {
          record_format: { label: "book", formatter: "pill|auto" },
        } as any,
      },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.metadata).toEqual([{ key: "record_format", value: "book" }]);
  });

  it("applies the form-level mode to every relation value", () => {
    const values = {
      intialValues: {} as any,
      relationValues: {
        refAuthors: [relation("refAuthors", "person-1")],
        refOtherGenres: [relation("refOtherGenres", "genre-1")],
      },
    };

    const added = buildBulkEditPayload(values, {
      formId,
      isFieldDirty: allDirty,
      relationMode: BulkEditModes.Add,
    });
    expect(added.relationsToAdd).toEqual([
      { type: "refAuthors", key: "person-1", editStatus: EditStatus.New },
      { type: "refOtherGenres", key: "genre-1", editStatus: EditStatus.New },
    ]);
    expect(added.relationsToRemove).toEqual([]);
    expect(added.relationsToReplace).toEqual([]);

    const removed = buildBulkEditPayload(values, {
      formId,
      isFieldDirty: allDirty,
      relationMode: BulkEditModes.Remove,
    });
    expect(removed.relationsToRemove).toEqual([
      { type: "refAuthors", key: "person-1", editStatus: EditStatus.Deleted },
      {
        type: "refOtherGenres",
        key: "genre-1",
        editStatus: EditStatus.Deleted,
      },
    ]);
    expect(removed.relationsToAdd).toEqual([]);

    const replaced = buildBulkEditPayload(values, {
      formId,
      isFieldDirty: allDirty,
      relationMode: BulkEditModes.Replace,
    });
    expect(replaced.relationsToReplace).toHaveLength(2);
    expect(replaced.relationsToAdd).toEqual([]);
  });

  it("defaults to add when no mode was chosen", () => {
    const payload = buildBulkEditPayload(
      {
        intialValues: {} as any,
        relationValues: { refAuthors: [relation("refAuthors", "person-1")] },
      },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.relationsToAdd).toHaveLength(1);
    expect(payload.relationsToRemove).toEqual([]);
    expect(payload.relationsToReplace).toEqual([]);
  });

  it("never lets a deleted relation reach the add or replace bucket", () => {
    const values = {
      intialValues: {} as any,
      relationValues: {
        refAuthors: [
          relation("refAuthors", "person-1", EditStatus.Deleted),
          relation("refAuthors", "person-2"),
        ],
        refLanguages: [relation("refLanguages", "lang-nl", EditStatus.Deleted)],
      },
    };

    expect(
      buildBulkEditPayload(values, {
        formId,
        isFieldDirty: allDirty,
        relationMode: BulkEditModes.Add,
      }).relationsToAdd,
    ).toEqual([
      { type: "refAuthors", key: "person-2", editStatus: EditStatus.New },
    ]);

    expect(
      buildBulkEditPayload(values, {
        formId,
        isFieldDirty: allDirty,
        relationMode: BulkEditModes.Replace,
      }).relationsToReplace,
    ).toEqual([
      { type: "refAuthors", key: "person-2", editStatus: EditStatus.New },
    ]);
  });

  it("ignores empty relation pickers", () => {
    const payload = buildBulkEditPayload(
      { intialValues: {} as any, relationValues: { refAuthors: [] } },
      { formId, isFieldDirty: allDirty, relationMode: BulkEditModes.Replace },
    );

    expect(payload.relationsToReplace).toEqual([]);
    expect(payload.hasChanges).toBe(false);
  });

  it("strips the repeatable-panels bookkeeping key", () => {
    editableFields.value[formId] = ["quality_marks", "repeatable-panels"];

    const payload = buildBulkEditPayload(
      {
        intialValues: {
          quality_marks: ["awarded"],
          "repeatable-panels": { anything: {} },
        } as any,
      },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.metadata).toEqual([
      { key: "quality_marks", value: ["awarded"] },
    ]);
  });

  it("clears a metadata field the user marked for clearing, without touching it", () => {
    const payload = buildBulkEditPayload(
      { intialValues: { quality_marks: undefined, record_format: undefined } as any },
      {
        formId,
        isFieldDirty: noneDirty,
        fields: [
          {
            key: "quality_marks",
            inputField: { type: "dropdownMultiselectMetadata" },
          },
          { key: "record_format", inputField: { type: "text" } },
        ] as any,
        clearedKeys: ["quality_marks", "record_format"],
      },
    );

    // An array-valued property refuses "" and a string property refuses [], so the
    // empty value has to match the field.
    expect(payload.metadata).toEqual([
      { key: "quality_marks", value: [] },
      { key: "record_format", value: "" },
    ]);
    expect(payload.hasChanges).toBe(true);
  });

  it("uses the touched value's own shape when clearing", () => {
    editableFields.value[formId] = ["summary"];

    const payload = buildBulkEditPayload(
      { intialValues: { summary: ["something"] } as any },
      {
        formId,
        isFieldDirty: allDirty,
        fields: [{ key: "summary", inputField: { type: "text" } }] as any,
        clearedKeys: ["summary"],
      },
    );

    expect(payload.metadata).toEqual([{ key: "summary", value: [] }]);
  });

  it("collects the relation types to clear and ignores their picked values", () => {
    editableFields.value[formId] = ["refAuthors"];

    const payload = buildBulkEditPayload(
      {
        intialValues: {} as any,
        relationValues: { refAuthors: [relation("refAuthors", "person-1")] },
      },
      {
        formId,
        isFieldDirty: allDirty,
        relationMode: BulkEditModes.Add,
        fields: [
          {
            key: "refAuthors",
            inputField: { type: "dropdownMultiselectRelations", relationType: "refAuthors" },
          },
        ] as any,
        clearedKeys: ["refAuthors"],
      },
    );

    expect(payload.relationTypesToClear).toEqual(["refAuthors"]);
    expect(payload.relationsToAdd).toEqual([]);
    expect(payload.hasChanges).toBe(true);
  });

  it("has no relation types to clear when nothing was marked", () => {
    const payload = buildBulkEditPayload(
      { intialValues: { quality_marks: ["awarded"] } as any },
      { formId, isFieldDirty: allDirty },
    );

    expect(payload.relationTypesToClear).toEqual([]);
  });

  it("reports whether anything is going to be written", () => {
    expect(
      buildBulkEditPayload(
        { intialValues: {} as any },
        { formId, isFieldDirty: allDirty },
      ).hasChanges,
    ).toBe(false);

    expect(
      buildBulkEditPayload(
        { intialValues: { quality_marks: ["awarded"] } as any },
        { formId, isFieldDirty: allDirty },
      ).hasChanges,
    ).toBe(true);
  });
});
