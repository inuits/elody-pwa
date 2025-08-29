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
});
