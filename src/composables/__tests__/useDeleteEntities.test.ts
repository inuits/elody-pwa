import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeleteEntities } from "@/composables/useDeleteEntities";
import { apolloClient } from "@/main";
import { Collection } from "@/generated-types/queries";

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn().mockResolvedValue({
      data: {
        GetDynamicForm: {
          formTab: {
            formFields: {
              field: [{ id: "field1" }, { id: "field2" }],
            },
          },
        },
      },
    }),
  },
}));

const mockMutate = vi.fn();

vi.mock("@vue/apollo-composable", () => ({
  useMutation: vi.fn(() => ({
    mutate: mockMutate,
  })),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn().mockResolvedValue("mockedQueryDocument"),
  }),
}));

describe("useDeleteEntities", () => {
  let deleteEntitiesComposable: any;
  const mockedItems = [
    { id: "item1", type: "typeA" },
    { id: "item2", type: "typeB" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    deleteEntitiesComposable = useDeleteEntities();
  });

  it("should call mutate with normalized data", async () => {
    const linkedEntitiesToRemove = { customFlag: true };

    await deleteEntitiesComposable.deleteEntities(
      mockedItems,
      true,
      linkedEntitiesToRemove,
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      ids: ["item1", "item2"],
      path: Collection.Entities,
      deleteEntities: {
        customFlag: true,
        deleteMediafiles: true,
      },
    });
  });

  it("should call mutate with default deleteMediafiles as false when not provided", async () => {
    await deleteEntitiesComposable.deleteEntities(mockedItems);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      ids: ["item1", "item2"],
      path: Collection.Entities,
      deleteEntities: {
        deleteMediafiles: false,
      },
    });
  });

  it("should return true after successful mutation", async () => {
    const result = await deleteEntitiesComposable.deleteEntities(mockedItems);

    expect(result).toBe(true);
  });

  it("should not call mutate if items array is empty", async () => {
    await deleteEntitiesComposable.deleteEntities([]);

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("getDeletionForm should load and set form data", async () => {
    const queryDocument = { query: "testQuery" };
    await deleteEntitiesComposable.getDeletionForm(queryDocument);

    expect(apolloClient.query).toHaveBeenCalledWith({
      query: "mockedQueryDocument",
    });

    expect(deleteEntitiesComposable.form.value).toEqual([
      { id: "field1" },
      { id: "field2" },
    ]);
  });
});
