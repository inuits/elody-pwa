import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("@/main", () => ({
  apolloClient: { mutate: mocks.mutate },
}));

vi.mock("@/generated-types/queries", () => ({
  MutateEntityValuesDocument: "MutateEntityValuesDocument",
  Collection: { Entities: "entities" },
  EditStatus: {
    New: "new",
    Changed: "changed",
    Deleted: "deleted",
    Unchanged: "unchanged",
  },
}));

import {
  buildMetadataInput,
  buildRelationsInput,
  buildRelationMetadataInput,
  saveScope,
  validateScope,
} from "@/composables/useScopedSave";

const rel = (key: string, type = "hasCreator", metadata: any[] = []) => ({
  key,
  type,
  metadata,
});

describe("buildMetadataInput", () => {
  it("sends exactly one metadata key and no relations", () => {
    expect(buildMetadataInput("title", "De helaasheid")).toEqual({
      metadata: [{ key: "title", value: "De helaasheid" }],
      relations: [],
      updateOnlyRelations: false,
    });
  });

  it("carries the language of a multilingual value", () => {
    expect(buildMetadataInput("title", "Titel", "nl").metadata).toEqual([
      { key: "title", value: "Titel", lang: "nl" },
    ]);
  });
});

describe("buildRelationsInput", () => {
  it("sends only the added relation", () => {
    const input = buildRelationsInput([rel("p-1")], [rel("p-1"), rel("p-2")]);
    expect(input.metadata).toEqual([]);
    expect(input.updateOnlyRelations).toBe(true);
    expect(input.relations).toEqual([
      expect.objectContaining({ key: "p-2", type: "hasCreator", editStatus: "new" }),
    ]);
  });

  it("sends only the removed relation", () => {
    const input = buildRelationsInput([rel("p-1"), rel("p-2")], [rel("p-1")]);
    expect(input.relations).toEqual([
      expect.objectContaining({ key: "p-2", type: "hasCreator", editStatus: "deleted" }),
    ]);
  });

  it("sends nothing for relations that did not change", () => {
    const before = [rel("p-1", "hasCreator", [{ key: "role", value: "author" }])];
    const after = [rel("p-1", "hasCreator", [{ key: "role", value: "author" }])];
    expect(buildRelationsInput(before, after).relations).toEqual([]);
  });

  it("treats the same key under another relation type as a different relation", () => {
    const input = buildRelationsInput([rel("p-1", "hasCreator")], [rel("p-1", "hasEditor")]);
    expect(input.relations.map((r) => `${r.type}:${r.editStatus}`).sort()).toEqual([
      "hasCreator:deleted",
      "hasEditor:new",
    ]);
  });

  it("sends a relation whose metadata changed with only the changed keys", () => {
    const before = [
      rel("p-1", "hasCreator", [
        { key: "role", value: "author" },
        { key: "order", value: 1 },
      ]),
    ];
    const after = [
      rel("p-1", "hasCreator", [
        { key: "role", value: "editor" },
        { key: "order", value: 1 },
      ]),
    ];
    expect(buildRelationsInput(before, after).relations).toEqual([
      {
        key: "p-1",
        type: "hasCreator",
        editStatus: "changed",
        metadata: [{ key: "role", value: "editor" }],
      },
    ]);
  });
});

describe("buildRelationMetadataInput", () => {
  it("sends one relation with only the one changed metadata key", () => {
    expect(
      buildRelationMetadataInput({ key: "p-1", type: "hasCreator" }, "role", "editor"),
    ).toEqual({
      metadata: [],
      relations: [
        {
          key: "p-1",
          type: "hasCreator",
          editStatus: "changed",
          metadata: [{ key: "role", value: "editor" }],
        },
      ],
      updateOnlyRelations: true,
    });
  });
});

describe("saveScope", () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
  });

  it("sends the scope's payload alone through mutateEntityValues", async () => {
    mocks.mutate.mockResolvedValue({ data: { mutateEntityValues: { id: "e-1" } } });
    const formInput = buildMetadataInput("title", "x");
    await saveScope({ entityId: "e-1", formInput });
    expect(mocks.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: "MutateEntityValuesDocument",
        variables: { id: "e-1", formInput, collection: "entities" },
        errorPolicy: "all",
        context: { skipGlobalErrorHandling: true },
      }),
    );
  });

  it("returns the saved entity", async () => {
    mocks.mutate.mockResolvedValue({ data: { mutateEntityValues: { id: "e-1" } } });
    expect(
      await saveScope({ entityId: "e-1", formInput: buildMetadataInput("t", "x") }),
    ).toEqual({ id: "e-1" });
  });

  it("throws when the server reports errors, so the editor can stay open", async () => {
    mocks.mutate.mockResolvedValue({ errors: [{ message: "boom" }] });
    await expect(
      saveScope({ entityId: "e-1", formInput: buildMetadataInput("t", "x") }),
    ).rejects.toThrow("boom");
  });

  it("does not call the server when there is nothing to send", async () => {
    const result = await saveScope({
      entityId: "e-1",
      formInput: { metadata: [], relations: [], updateOnlyRelations: true },
    });
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});

describe("validateScope", () => {
  it("validates only the scope's own field paths", async () => {
    const validateField = vi.fn().mockResolvedValue({ valid: true, errors: [] });
    await validateScope(validateField, ["intialValues.title"]);
    expect(validateField).toHaveBeenCalledTimes(1);
    expect(validateField).toHaveBeenCalledWith("intialValues.title");
  });

  it("collects the errors per path and reports the scope invalid", async () => {
    const validateField = vi.fn(async (path: string) =>
      path === "intialValues.year"
        ? { valid: false, errors: ["Jaar is verplicht"] }
        : { valid: true, errors: [] },
    );
    expect(
      await validateScope(validateField, ["intialValues.title", "intialValues.year"]),
    ).toEqual({
      valid: false,
      errors: { "intialValues.year": ["Jaar is verplicht"] },
    });
  });
});
