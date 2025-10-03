import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  usePermissions,
  setIgnorePermissions,
  ignorePermissions,
  resetAdvancedPermissions,
  advancedPermissions,
  permittedEntitiesToCreate,
} from "../usePermissions";
import { Permission, Entitytyping } from "@/generated-types/queries";
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
    setIgnorePermissions(false);
    permittedEntitiesToCreate.value = [];
  });

  describe("Permission Ignoring", () => {
    it("should set and get ignorePermissions value", () => {
      expect(ignorePermissions.value).toBe(false);

      setIgnorePermissions(true);
      expect(ignorePermissions.value).toBe(true);

      setIgnorePermissions(false);
      expect(ignorePermissions.value).toBe(false);
    });
  });

  describe("resetAdvancedPermissions", () => {
    it("should clear advanced permissions cache only", () => {
      advancedPermissions["test-permission"] = true;
      permittedEntitiesToCreate.value = [Entitytyping.Asset];

      expect(Object.keys(advancedPermissions)).toHaveLength(1);

      resetAdvancedPermissions();

      expect(Object.keys(advancedPermissions)).toHaveLength(0);
    });
  });

  describe("usePermissions composable", () => {
    let permissions: ReturnType<typeof usePermissions>;

    beforeEach(() => {
      permissions = usePermissions();
    });

    describe("can function", () => {
      it("should return true when ignorePermissions is enabled", () => {
        setIgnorePermissions(true);

        const result = permissions.can(Permission.Canread, Entitytyping.Asset);
        expect(result).toBe(true);
      });

      it("should log error when permissions are not loaded", () => {
        setIgnorePermissions(false);
        const consoleSpy = vi
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const result = permissions.can(Permission.Canread, Entitytyping.Asset);

        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "The mappings are not fetched yet. Wait a bit.",
          }),
        );

        consoleSpy.mockRestore();
      });

      it("should log error when entity is undefined", () => {
        setIgnorePermissions(false);
        const consoleSpy = vi
          .spyOn(console, "log")
          .mockImplementation(() => {});

        const result = permissions.can(Permission.Canread, undefined);

        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "The mappings are not fetched yet. Wait a bit.",
          }),
        );

        consoleSpy.mockRestore();
      });
    });

    describe("fetchAdvancedPermission", () => {
      it("should return cached permission when available", () => {
        const cacheKey = "test-permission|parent:parent1|child:child1";
        advancedPermissions[cacheKey] = true;

        permissions.setExtraVariables({
          parentEntityId: "parent1",
          childEntityId: "child1",
        });
        const result = permissions.fetchAdvancedPermission(["test-permission"]);

        expect(result).toBe(true);
        expect(mockApolloQuery).not.toHaveBeenCalled();
      });

      it("should fetch permission from API when not cached", async () => {
        const mockPermissionResponse = {
          AdvancedPermission: true,
        };

        mockApolloQuery.mockResolvedValueOnce(
          createMockQueryResult(mockPermissionResponse),
        );
        permissions.setExtraVariables({
          parentEntityId: "parent1",
          childEntityId: "child1",
        });

        const resultPromise = permissions.fetchAdvancedPermission([
          "test-permission",
        ]);
        const result = await resultPromise;

        expect(result).toBe(true);
        expect(mockApolloQuery).toHaveBeenCalledWith({
          query: expect.any(Object),
          variables: {
            permission: "test-permission",
            parentEntityId: "parent1",
            childEntityId: "child1",
          },
          fetchPolicy: "no-cache",
          notifyOnNetworkStatusChange: true,
        });
      });

      it("should handle API errors gracefully", async () => {
        const consoleSpy = vi
          .spyOn(console, "log")
          .mockImplementation(() => {});
        mockApolloQuery.mockRejectedValueOnce(new Error("API Error"));

        const result = permissions.fetchAdvancedPermission(["test-permission"]);

        expect(result).toBeInstanceOf(Promise);

        await expect(result).rejects.toThrow("API Error");

        consoleSpy.mockRestore();
      });
    });

    describe("fetchAdvancedPermissions (batch)", () => {
      it("should fetch multiple permissions and cache them", async () => {
        const mockPermissionsResponse = {
          AdvancedPermissions: [
            { permission: "permission1", hasPermission: true },
            { permission: "permission2", hasPermission: false },
          ],
        };

        mockApolloQuery.mockResolvedValueOnce(
          createMockQueryResult(mockPermissionsResponse),
        );
        permissions.setExtraVariables({
          parentEntityId: "parent1",
          childEntityId: "child1",
        });

        const result = await permissions.fetchAdvancedPermissions([
          "permission1",
          "permission2",
        ]);

        expect(result).toEqual({
          permission1: true,
          permission2: false,
        });

        expect(
          advancedPermissions["permission1|parent:parent1|child:child1"],
        ).toBe(true);
        expect(
          advancedPermissions["permission2|parent:parent1|child:child1"],
        ).toBe(false);
      });

      it("should handle API errors and return false for all permissions", async () => {
        const consoleErrorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        mockApolloQuery.mockRejectedValueOnce(new Error("API Error"));

        const result = await permissions.fetchAdvancedPermissions([
          "permission1",
          "permission2",
        ]);

        expect(result).toEqual({
          permission1: false,
          permission2: false,
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to fetch advanced permissions:",
          expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
      });
    });

    describe("extractMenuPermissions", () => {
      it("should extract permissions from nested menu structure", () => {
        const menu = {
          item1: {
            can: ["permission1"],
            subMenu: {
              subItem1: {
                can: ["permission2"],
              },
              subItem2: {
                can: ["permission3"],
                subMenu: {
                  deepItem: {
                    can: ["permission4"],
                  },
                },
              },
            },
          },
          item2: {
            can: ["permission5"],
          },
        };

        const result = permissions.extractMenuPermissions(menu);

        expect(result).toEqual([
          "permission1",
          "permission2",
          "permission3",
          "permission4",
          "permission5",
        ]);
      });

      it("should handle menu items without permissions", () => {
        const menu = {
          item1: {
            can: ["permission1"],
          },
          item2: {},
          item3: {
            can: [],
          },
        };

        const result = permissions.extractMenuPermissions(menu);

        expect(result).toEqual(["permission1"]);
      });
    });

    describe("Cache key generation", () => {
      it("should generate consistent cache keys with context variables", async () => {
        permissions.setExtraVariables({
          parentEntityId: "parent1",
          childEntityId: "child1",
        });

        const mockResponse = { AdvancedPermission: true };
        mockApolloQuery.mockResolvedValue(createMockQueryResult(mockResponse));

        await permissions.fetchAdvancedPermission(["test-permission"]);

        const expectedKey = "test-permission|parent:parent1|child:child1";
        expect(advancedPermissions[expectedKey]).toBe(true);
      });

      it("should generate cache keys with only parent ID", async () => {
        permissions.setExtraVariables({
          parentEntityId: "parent1",
          childEntityId: undefined as any,
        });

        const mockResponse = { AdvancedPermission: true };
        mockApolloQuery.mockResolvedValue(createMockQueryResult(mockResponse));

        await permissions.fetchAdvancedPermission(["test-permission"]);

        const expectedKey = "test-permission|parent:parent1";
        expect(advancedPermissions[expectedKey]).toBe(true);
      });

      it("should generate cache keys with no context variables", async () => {
        permissions.setExtraVariables();

        const mockResponse = { AdvancedPermission: true };
        mockApolloQuery.mockResolvedValue(createMockQueryResult(mockResponse));

        await permissions.fetchAdvancedPermission(["test-permission"]);

        const expectedKey = "test-permission";
        expect(advancedPermissions[expectedKey]).toBe(true);
      });
    });
  });

  describe("Integration tests", () => {
    it("should handle cached permissions correctly", () => {
      setIgnorePermissions(false);

      advancedPermissions["cached-permission"] = false;

      const permissions = usePermissions();
      const result = permissions.fetchAdvancedPermission(["cached-permission"]);

      expect(result).toBe(false);
      expect(mockApolloQuery).not.toHaveBeenCalled();
    });
  });
});
