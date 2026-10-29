import { describe, it, expect, vi, beforeEach } from "vitest";
import { Collection, EditStatus } from "@/generated-types/queries";

const { mockMutate, mockLoadDocument } = vi.hoisted(() => ({
  mockMutate: vi.fn().mockResolvedValue({ data: { addEntityRelations: "" } }),
  mockLoadDocument: vi.fn().mockResolvedValue("ADD_ENTITY_RELATIONS_DOC"),
}));

vi.mock("@/main", () => ({ apolloClient: { mutate: mockMutate } }));
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: mockLoadDocument }),
}));
vi.mock("@/composables/useTenant", () => ({
  default: () => ({ selectedTenant: { value: "tenant-1" } }),
}));

import { useManageEntities } from "@/composables/useManageEntities";

describe("useManageEntities.addRelations", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockLoadDocument.mockClear();
  });

  it("adds relations via AddEntityRelations (merge) on the entity", async () => {
    const { addRelations } = useManageEntities();
    await addRelations({
      entityId: "expr-1",
      relations: [{ key: "work-1", type: "refWork", editStatus: EditStatus.New }],
    });
    expect(mockLoadDocument).toHaveBeenCalledWith("AddEntityRelations");
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: "ADD_ENTITY_RELATIONS_DOC",
      variables: {
        id: "expr-1",
        relations: [{ key: "work-1", type: "refWork", editStatus: EditStatus.New }],
        collection: Collection.Entities,
      },
    });
  });

  it("is a no-op when there are no relations", async () => {
    const { addRelations } = useManageEntities();
    await addRelations({ entityId: "expr-1", relations: [] });
    expect(mockLoadDocument).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});

describe("useManageEntities.deleteEntity", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockLoadDocument.mockClear();
  });

  it("deletes an entity from the entities collection, leaving its mediafiles", async () => {
    mockLoadDocument.mockResolvedValueOnce("DELETE_DATA_DOC");
    await useManageEntities().deleteEntity({ id: "frame-1", type: "web_story_frame" });
    expect(mockLoadDocument).toHaveBeenCalledWith("DeleteData");
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: "DELETE_DATA_DOC",
      variables: { id: "frame-1", path: Collection.Entities, deleteMediafiles: false },
    });
  });

  it("deletes a mediafile from the mediafiles collection", async () => {
    mockLoadDocument.mockResolvedValueOnce("DELETE_DATA_DOC");
    await useManageEntities().deleteEntity({ id: "mf-1", type: "mediafile" });
    expect(mockMutate.mock.calls[0][0].variables.path).toBe(Collection.Mediafiles);
  });
});
