import { describe, it, expect, vi, beforeEach } from "vitest";
import { useInheritedRelations } from "@/composables/useInheritedRelations";
import { apolloClient } from "@/main";
import type {
  Entitytyping,
  BaseRelationValuesInput,
} from "@/generated-types/queries";

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

describe("useInheritedRelations", () => {
  let composable: ReturnType<typeof useInheritedRelations>;
  const mockEntity = {
    id: "123",
    name: "Test Entity",
    properties: {
      testKey: ["testValue"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (apolloClient.query as vi.Mock).mockResolvedValue({
      data: { Entity: mockEntity },
    });

    composable = useInheritedRelations();
  });

  describe("extractInheritedValue", () => {
    it("should return null when relation is not found", async () => {
      const relations: BaseRelationValuesInput[] = [
        { type: "otherRelation", key: "456" } as BaseRelationValuesInput,
      ];

      const result = await composable.extractInheritedValue({
        entityType: "SOME_TYPE" as Entitytyping,
        relationKey: "nonExistingRelation",
        valueKey: "testKey",
        relations,
      });

      expect(result).toBeNull();
      expect(apolloClient.query).not.toHaveBeenCalled();
    });

    it("should call getEntityById with correct parameters when relation exists", async () => {
      const relations: BaseRelationValuesInput[] = [
        { type: "testRelation", key: "123" } as BaseRelationValuesInput,
      ];

      await composable.extractInheritedValue({
        entityType: "SOME_TYPE" as Entitytyping,
        relationKey: "testRelation",
        valueKey: "testKey",
        relations,
      });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: expect.anything(),
        variables: {
          id: "123",
          type: "SOME_TYPE",
        },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      });
    });

    it("should extract value correctly when relation and value exist", async () => {
      const relations: BaseRelationValuesInput[] = [
        { type: "testRelation", key: "123" } as BaseRelationValuesInput,
      ];

      const result = await composable.extractInheritedValue({
        entityType: "SOME_TYPE" as Entitytyping,
        relationKey: "testRelation",
        valueKey: "properties.testKey",
        relations,
      });

      expect(result).toBe("testValue");
    });

    it("should return null when extracted value is not found", async () => {
      const relations: BaseRelationValuesInput[] = [
        { type: "testRelation", key: "123" } as BaseRelationValuesInput,
      ];

      const result = await composable.extractInheritedValue({
        entityType: "SOME_TYPE" as Entitytyping,
        relationKey: "testRelation",
        valueKey: "nonExistingKey",
        relations,
      });

      expect(result).toBeNull();
    });

    it("should handle errors from getEntityById gracefully", async () => {
      (apolloClient.query as vi.Mock).mockRejectedValue(new Error("API Error"));
      const relations: BaseRelationValuesInput[] = [
        { type: "testRelation", key: "123" } as BaseRelationValuesInput,
      ];

      const result = await composable.extractInheritedValue({
        entityType: "SOME_TYPE" as Entitytyping,
        relationKey: "testRelation",
        valueKey: "testKey",
        relations,
      });

      expect(result).toBeNull();
    });
  });
});
