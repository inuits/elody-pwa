// Adding the same entity twice.
//
// Relations are patched by key: `PATCH /entities/<id>/relations` replaces every
// existing relation whose key appears in the payload
// (collection-api `storage/sparqlstore.py`, and the database engine does the
// same). And the resolver sends only the New and Changed ones. So adding a
// second relation with a key that is already there does not add a second
// relation -- it *replaces* the first, configuration and all.
//
// Where duplicates are meaningful, the second one therefore has to arrive with
// a key of its own. A pipeline step is `component~step`, which the collection
// side resolves back to the component (see
// client-collection-module/tests/test_step_keys.py).

import { describe, it, expect, beforeEach, vi } from "vitest";

const mockForm = {
  values: { relationValues: {} as Record<string, any[]> },
  setFieldValue: vi.fn((path: string, value: any) => {
    mockForm.values.relationValues[path.split(".").pop() as string] = value;
  }),
};

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityId: () => "pipeline-1" }),
}));

import { useFormHelper } from "../useFormHelper";
import useEntityPickerModal from "../useEntityPickerModal";

const { addRelations, addForm, deleteForm } = useFormHelper();
const { setAllowDuplicateRelations } = useEntityPickerModal();

const LOGGER = "rdf-connect--log-processor-ts--LogProcessorJs";
const FORM = "pipeline-1";

const relationsOf = () =>
  mockForm.values.relationValues["hasProcessor"] ?? [];

describe("addRelations with duplicates allowed", () => {
  // A saved relation, as the form holds it after the entity is loaded: no
  // editStatus, which is what distinguishes it from one added in this session.
  const saved = (key: string) => ({ key, type: "hasProcessor" });

  beforeEach(() => {
    mockForm.values.relationValues = {};
    mockForm.setFieldValue.mockClear();
    setAllowDuplicateRelations(false);
    deleteForm(FORM);
    addForm(FORM, mockForm as any);
  });

  it("keys the first one by the entity, as it always did", () => {
    setAllowDuplicateRelations(true);
    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);
    expect(relationsOf().map((r: any) => r.key)).toEqual([LOGGER]);
  });

  it("gives a second one a key of its own", () => {
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [saved(LOGGER)];

    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);

    const keys = relationsOf().map((r: any) => r.key);
    expect(keys).toEqual([LOGGER, `${LOGGER}~logprocessorjs-2`]);
  });

  it("keeps counting for a third", () => {
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [
      saved(LOGGER),
      saved(`${LOGGER}~logprocessorjs-2`),
    ];

    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);

    expect(relationsOf().map((r: any) => r.key)).toEqual([
      LOGGER,
      `${LOGGER}~logprocessorjs-2`,
      `${LOGGER}~logprocessorjs-3`,
    ]);
  });

  it("uses the entity's name when it has one", () => {
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [saved("acme--thing")];

    addRelations(
      [{ id: "acme--thing", intialValues: { name: "Log Processor" } } as any],
      "hasProcessor",
      FORM,
      true,
    );

    expect(relationsOf()[1].key).toBe("acme--thing~log-processor-2");
  });

  it("numbers past a step the pipeline already keyed", () => {
    // the second step exists but the first is still bare: the next one is 3,
    // not a second 2
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [
      saved(LOGGER),
      saved(`${LOGGER}~logprocessorjs-2`),
    ];

    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);

    expect(relationsOf()[2].key).toBe(`${LOGGER}~logprocessorjs-3`);
  });

  it("does nothing of the sort when duplicates are not allowed", () => {
    // every other relation type: the same entity twice is a slip, and the
    // picker greys it out in the first place
    setAllowDuplicateRelations(false);
    mockForm.values.relationValues["hasProcessor"] = [saved(LOGGER)];

    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);

    expect(relationsOf().map((r: any) => r.key)).toEqual([LOGGER, LOGGER]);
  });

  it("leaves a different entity alone", () => {
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [saved(LOGGER)];

    addRelations([{ id: "acme--other" }], "hasProcessor", FORM, true);

    expect(relationsOf().map((r: any) => r.key)).toEqual([
      LOGGER,
      "acme--other",
    ]);
  });

  it("keeps one added in this session, so a second add is a third step", () => {
    // The picker saves as soon as it closes, but the form still marks what it
    // added as New. Dropping those would both lose the step and make the next
    // key reuse `-2`, which the patch would then treat as a rewire of it.
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [saved(LOGGER)];

    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);
    addRelations([{ id: LOGGER }], "hasProcessor", FORM, true);

    expect(relationsOf().map((r: any) => r.key)).toEqual([
      LOGGER,
      `${LOGGER}~logprocessorjs-2`,
      `${LOGGER}~logprocessorjs-3`,
    ]);
  });

  it("adds several different processors in one go", () => {
    setAllowDuplicateRelations(true);

    addRelations(
      [{ id: "acme--a" }, { id: "acme--b" }, { id: "acme--c" }],
      "hasProcessor",
      FORM,
      true,
    );

    expect(relationsOf().map((r: any) => r.key)).toEqual([
      "acme--a",
      "acme--b",
      "acme--c",
    ]);
  });

  it("numbers repeats within one selection too", () => {
    setAllowDuplicateRelations(true);
    mockForm.values.relationValues["hasProcessor"] = [saved(LOGGER)];

    addRelations(
      [{ id: LOGGER }, { id: LOGGER }],
      "hasProcessor",
      FORM,
      true,
    );

    expect(relationsOf().map((r: any) => r.key)).toEqual([
      LOGGER,
      `${LOGGER}~logprocessorjs-2`,
      `${LOGGER}~logprocessorjs-3`,
    ]);
  });

  it("still replaces this session's picks when duplicates are not allowed", () => {
    // unchanged for every other relation type: a session's selection is the
    // authority on what it added
    setAllowDuplicateRelations(false);
    addRelations([{ id: "acme--a" }], "hasProcessor", FORM, true);
    addRelations([{ id: "acme--b" }], "hasProcessor", FORM, true);

    expect(relationsOf().map((r: any) => r.key)).toEqual(["acme--b"]);
  });
});
