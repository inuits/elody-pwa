import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDeleteEntities } from "@/composables/useDeleteEntities";
import { apolloClient } from "@/main";
import { Collection, Entitytyping } from "@/generated-types/queries";

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
    { id: "item1", type: Entitytyping.BaseEntity },
    { id: "item2", type: Entitytyping.BaseEntity },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    deleteEntitiesComposable = useDeleteEntities();
  });

  it("should call mutate with normalized data", async () => {
    const linkedEntitiesToRemove = { customFlag: true };

    await deleteEntitiesComposable.deleteEntities(
      mockedItems,
      linkedEntitiesToRemove,
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      ids: ["item1", "item2"],
      path: Collection.Entities,
      customFlag: true,
    });
  });

  it("should handle items of type Mediafile correctly", async () => {
    const mediaItems = [
      { id: "media1", type: Entitytyping.Mediafile },
      { id: "media2", type: Entitytyping.Mediafile },
    ];

    await deleteEntitiesComposable.deleteEntities(mediaItems, {});

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      ids: ["media1", "media2"],
      path: Collection.Mediafiles,
    });
  });

  it("should log an error if items have multiple types", async () => {
    const mixedItems = [
      { id: "item1", type: "typeA" },
      { id: "item2", type: "typeB" },
    ];

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await deleteEntitiesComposable.deleteEntities(mixedItems, {});

    expect(mockMutate).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Items should have the same type",
    );

    consoleErrorSpy.mockRestore();
  });

  it("should not call mutate if items array is empty", async () => {
    await deleteEntitiesComposable.deleteEntities([], {});

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
