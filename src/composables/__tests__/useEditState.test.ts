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

  describe("permitted edit mode", () => {
    // The first call hands back the raw state, later ones the reactive proxy
    // whose refs are unwrapped — the tests read it the way components do.
    const permittedState = (name: string) => {
      useEditMode(name, "delete");
      useEditMode(name);
      return useEditMode(name);
    };

    it.each([
      [{ canUpdate: true, canDelete: true }, "edit-delete"],
      [{ canUpdate: true, canDelete: false }, "edit"],
      [{ canUpdate: false, canDelete: true }, "delete"],
      [{ canUpdate: false, canDelete: false }, "view"],
    ])("maps %o onto edit mode %s", (permissions, expected) => {
      const state = permittedState(`permitted-${expected}`);

      state.setPermittedEditMode(permissions);

      expect(state.editMode).toBe(expected);
    });

    it("restores the permitted mode after the button was hidden", () => {
      const state = permittedState("permitted-restore");
      state.setPermittedEditMode({ canUpdate: true, canDelete: false });

      state.hideEditButton();
      expect(state.editMode).toBe("no-edit");

      state.disableEdit();
      expect(state.editMode).toBe("edit");
    });

    it("leaves an entity nobody reported permissions for viewable", () => {
      const state = permittedState("permitted-unknown");

      state.disableEdit();

      expect(state.editMode).toBe("view");
    });
  });
});
