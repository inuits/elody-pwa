import { describe, it, expect, vi, afterEach } from "vitest";
import { useEditMode } from "@/composables/useEdit";

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

/**
 * `useEditMode` keeps its states in module-level state, so isolation used to be done
 * with `vi.resetModules()` plus a dynamic re-import in `beforeEach`. That re-imported
 * the whole module graph once per test, which scales with however much of the app is
 * already warm in the worker and pushed these tests past the 5s timeout non
 * deterministically. Deleting the states this file creates gives the same isolation for
 * the cost of a Map delete.
 */
const STATE_NAMES = [
  "TestState",
  "StateA",
  "StateB",
  "ToDelete",
  "NonExistent",
  "GlobalEditState",
];

afterEach(() => {
  vi.clearAllMocks();
  STATE_NAMES.forEach((name) => useEditMode(name, "delete"));
});

describe("useEditMode", () => {
  describe("get mode", () => {
    it("creates a new edit state when none exists for the given name", () => {
      const state = useEditMode("TestState");

      expect(state).toBeDefined();
      expect(state.editStateName).toBe("TestState");
    });

    it("returns the existing edit state when called twice with the same name", () => {
      const first = useEditMode("TestState");
      const second = useEditMode("TestState");

      expect(second.editStateName).toBe(first.editStateName);
    });

    it("returns different edit states for different names", () => {
      const stateA = useEditMode("StateA");
      const stateB = useEditMode("StateB");

      expect(stateA.editStateName).toBe("StateA");
      expect(stateB.editStateName).toBe("StateB");

      stateA.setEditMode("edit");
      expect(stateB.editMode.value).not.toBe("edit");
    });

    it("uses 'GlobalEditState' as the default name", () => {
      const state = useEditMode();

      expect(state.editStateName).toBe("GlobalEditState");
    });
  });

  describe("delete mode", () => {
    it("removes the edit state so a fresh one is created on next get", () => {
      const original = useEditMode("ToDelete", "get");
      original.setEditMode("edit");

      useEditMode("ToDelete", "delete");

      const recreated = useEditMode("ToDelete", "get");
      expect(recreated.editMode.value).toBe("no-edit");
    });

    it("returns the deleted edit state", () => {
      useEditMode("ToDelete", "get");
      const deleted = useEditMode("ToDelete", "delete");

      expect(deleted).toBeDefined();
      expect(deleted.editStateName).toBe("ToDelete");
    });

    it("returns undefined when deleting a non-existent state", () => {
      const result = useEditMode("NonExistent", "delete");

      expect(result).toBeUndefined();
    });

    it("does not affect other edit states when deleting one", () => {
      useEditMode("StateA", "get");
      useEditMode("StateB", "get");

      useEditMode("StateA", "delete");

      const stateB = useEditMode("StateB", "get");
      expect(stateB).toBeDefined();
      expect(stateB.editStateName).toBe("StateB");
    });
  });
});
