import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  usePermissions,
  resetAdvancedPermissions,
  advancedPermissions,
} from "../usePermissions";
import { apolloClient } from "@/main";

const createMockQueryResult = <T>(data: T) => ({
  data,
  loading: false,
  networkStatus: 7,
  error: undefined,
});

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

describe("usePermissions", () => {
  const mockApolloQuery = vi.mocked(apolloClient.query);

  beforeEach(() => {
    vi.clearAllMocks();
    resetAdvancedPermissions();
  });

  describe("resetAdvancedPermissions", () => {
    it("should clear advanced permissions cache only", () => {
      advancedPermissions["test-permission"] = true;

      expect(Object.keys(advancedPermissions)).toHaveLength(1);

      resetAdvancedPermissions();

      expect(Object.keys(advancedPermissions)).toHaveLength(0);
    });
  });

  describe("fetchAdvancedPermission", () => {
    let permissions: ReturnType<typeof usePermissions>;

    beforeEach(() => {
      permissions = usePermissions();
    });

    it("should return cached permission when available", () => {
      advancedPermissions["test-permission"] = true;

      const result = permissions.fetchAdvancedPermission(["test-permission"]);

      expect(result).toBe(true);
      expect(mockApolloQuery).not.toHaveBeenCalled();
    });

    it("should fetch permission from API when not cached", async () => {
      mockApolloQuery.mockResolvedValueOnce(
        createMockQueryResult({ AdvancedPermission: true }) as any,
      );

      const result = await permissions.fetchAdvancedPermission([
        "test-permission",
      ]);

      expect(result).toBe(true);
      expect(mockApolloQuery).toHaveBeenCalledTimes(1);
      expect(mockApolloQuery.mock.calls[0][0].variables).toEqual({
        permission: "test-permission",
      });
    });

    // Route permissions are the only ones the frontend still resolves itself,
    // and a route is guarded before the entity behind it exists, so the request
    // carries no entity id at all.
    it("caches on the permission alone, since no entity id is ever sent", async () => {
      mockApolloQuery.mockResolvedValueOnce(
        createMockQueryResult({ AdvancedPermission: false }) as any,
      );

      await permissions.fetchAdvancedPermission(["test-permission"]);
      const cached = permissions.fetchAdvancedPermission(["test-permission"]);

      expect(cached).toBe(false);
      expect(mockApolloQuery).toHaveBeenCalledTimes(1);
      expect(Object.keys(advancedPermissions)).toEqual(["test-permission"]);
    });

    it("refetches when asked to force", async () => {
      mockApolloQuery
        .mockResolvedValueOnce(
          createMockQueryResult({ AdvancedPermission: false }) as any,
        )
        .mockResolvedValueOnce(
          createMockQueryResult({ AdvancedPermission: true }) as any,
        );

      await permissions.fetchAdvancedPermission(["test-permission"]);
      const refetched = await permissions.fetchAdvancedPermission(
        ["test-permission"],
        true,
      );

      expect(refetched).toBe(true);
      expect(mockApolloQuery).toHaveBeenCalledTimes(2);
    });

    it("should handle API errors gracefully", async () => {
      mockApolloQuery.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        permissions.fetchAdvancedPermission(["test-permission"]),
      ).rejects.toThrow("Network error");
    });
  });
});
