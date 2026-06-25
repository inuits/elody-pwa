import { describe, it, expect, vi, beforeEach } from "vitest";
import { Collection, EditStatus } from "@/generated-types/queries";

const { mockMutate, mockLoadDocument } = vi.hoisted(() => ({
  mockMutate: vi.fn().mockResolvedValue({ data: { mutateEntityValues: {} } }),
  mockLoadDocument: vi.fn().mockResolvedValue("MUTATE_ENTITY_VALUES_DOC"),
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

  it("adds relations via MutateEntityValues with updateOnlyRelations on the entity", async () => {
    const { addRelations } = useManageEntities();
    await addRelations({
      entityId: "expr-1",
      relations: [{ key: "work-1", type: "refWork", editStatus: EditStatus.New }],
    });
    expect(mockLoadDocument).toHaveBeenCalledWith("MutateEntityValues");
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: "MUTATE_ENTITY_VALUES_DOC",
      variables: {
        id: "expr-1",
        formInput: {
          metadata: [],
          relations: [{ key: "work-1", type: "refWork", editStatus: EditStatus.New }],
          updateOnlyRelations: true,
        },
        collection: Collection.Entities,
      },
    });
  });
});
