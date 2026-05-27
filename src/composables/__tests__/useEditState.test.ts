import { describe, it, expect, vi } from "vitest";
import { useEditMode } from "@/composables/useEdit";

describe("useEditState", () => {
  const editState = useEditMode();

  const testRefetchFn = vi.fn();

  it("Should add a refetch function for base libraries with custom queries", async () => {
    editState.addRefetchFunction("test-refetch", testRefetchFn);

    expect(editState.refetchFns.value).toHaveProperty(
      "test-refetch",
      testRefetchFn,
    );
  });

  it("Should call the refetch functions and remove all functions when done", async () => {
    await editState.performRefetchFunctions();

    expect(testRefetchFn).toHaveBeenCalledOnce();
    expect(editState.refetchFns.value).toEqual({});
  });

  describe("mutationCallbacks", () => {
    it("stores a mutation callback by name", () => {
      const cb = vi.fn().mockResolvedValue(undefined);
      editState.addMutationCallback("test-cb", cb);
      expect(editState.mutationCallbackFns.value).toHaveProperty("test-cb", cb);
    });

    it("calls all mutation callbacks and clears them", async () => {
      const cb1 = vi.fn().mockResolvedValue(undefined);
      const cb2 = vi.fn().mockResolvedValue(undefined);
      editState.addMutationCallback("cb1", cb1);
      editState.addMutationCallback("cb2", cb2);

      await editState.performMutationCallbacks();

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();
      expect(editState.mutationCallbackFns.value).toEqual({});
    });

    it("clears mutation callbacks without calling them", () => {
      const cb = vi.fn().mockResolvedValue(undefined);
      editState.addMutationCallback("cb", cb);
      editState.clearMutationCallbacks();

      expect(editState.mutationCallbackFns.value).toEqual({});
      expect(cb).not.toHaveBeenCalled();
    });
  });
});
