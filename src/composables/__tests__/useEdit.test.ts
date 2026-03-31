import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    fetchUpdateAndDeletePermission: vi.fn(),
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({
    getEntityUuid: () => "mock-uuid",
    getEntityType: () => "mock-type",
  }),
}));

describe("useEditMode", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const importUseEditMode = async () => {
    const { useEditMode } = await import("@/composables/useEdit");
    return useEditMode;
  };

  describe("get mode", () => {
    it("creates a new edit state when none exists for the given name", async () => {
      const useEditMode = await importUseEditMode();
      const state = useEditMode("TestState");

      expect(state).toBeDefined();
      expect(state.editStateName).toBe("TestState");
    });

    it("returns the existing edit state when called twice with the same name", async () => {
      const useEditMode = await importUseEditMode();
      const first = useEditMode("TestState");
      const second = useEditMode("TestState");

      expect(second.editStateName).toBe(first.editStateName);
    });

    it("returns different edit states for different names", async () => {
      const useEditMode = await importUseEditMode();
      const stateA = useEditMode("StateA");
      const stateB = useEditMode("StateB");

      expect(stateA.editStateName).toBe("StateA");
      expect(stateB.editStateName).toBe("StateB");

      stateA.setEditMode("edit");
      expect(stateB.editMode.value).not.toBe("edit");
    });

    it("uses 'GlobalEditState' as the default name", async () => {
      const useEditMode = await importUseEditMode();
      const state = useEditMode();

      expect(state.editStateName).toBe("GlobalEditState");
    });
  });

  describe("delete mode", () => {
    it("removes the edit state so a fresh one is created on next get", async () => {
      const useEditMode = await importUseEditMode();
      const original = useEditMode("ToDelete", "get");
      original.setEditMode("edit");

      useEditMode("ToDelete", "delete");

      const recreated = useEditMode("ToDelete", "get");
      expect(recreated.editMode.value).toBe("no-edit");
    });

    it("returns the deleted edit state", async () => {
      const useEditMode = await importUseEditMode();
      useEditMode("ToDelete", "get");
      const deleted = useEditMode("ToDelete", "delete");

      expect(deleted).toBeDefined();
      expect(deleted.editStateName).toBe("ToDelete");
    });

    it("returns undefined when deleting a non-existent state", async () => {
      const useEditMode = await importUseEditMode();
      const result = useEditMode("NonExistent", "delete");

      expect(result).toBeUndefined();
    });

    it("does not affect other edit states when deleting one", async () => {
      const useEditMode = await importUseEditMode();
      useEditMode("StateA", "get");
      useEditMode("StateB", "get");

      useEditMode("StateA", "delete");

      const stateB = useEditMode("StateB", "get");
      expect(stateB).toBeDefined();
      expect(stateB.editStateName).toBe("StateB");
    });
  });
});
