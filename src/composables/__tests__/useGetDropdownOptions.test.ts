import { describe, it, expect, vi } from "vitest";
import { useGetDropdownOptionsState } from "../useGetDropdownOptionsState";
import { EditStatus, type Entitytyping } from "@/generated-types/queries";
import { type FormContext } from "vee-validate";

const mocks = vi.hoisted(() => {
  return {
    getForm: vi.fn(),
  };
});

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: mocks.getForm,
  }),
}));

describe("GetVariableValueForFilter", () => {
  const { getVariableValueForFilter } = useGetDropdownOptionsState(
    "entityTypeMock" as Entitytyping,
    "parentMock",
  );

  it("returns the variable if the form is not found", () => {
    const formId = "nonexistentFormId";
    const variable = "$variableKey";

    mocks.getForm.mockReturnValue(undefined);

    const result = getVariableValueForFilter(formId, variable);
    expect(result).toBe(variable);
  });

  it("returns the variable if relation values are not found", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";

    mocks.getForm.mockReturnValue({
      values: { relationValues: {}, intialValues: {} },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable);
    expect(result).toBe(variable);
  });

  it("returns the key of the first relation if no new relations are found", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";
    const mockRelationKey = "relationKey1";

    mocks.getForm.mockReturnValue({
      values: {
        relationValues: {
          randomRelation: [{ key: "randomRelation" }],
          [variable.replace("$", "")]: [{ key: mockRelationKey }],
        },
      },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable);
    expect(result).toBe(mockRelationKey);
  });

  it("returns the key of a new relation if a new relation exists", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";
    const mockNewRelationKey = "newRelationKey";

    mocks.getForm.mockReturnValue({
      values: {
        relationValues: {
          [variable.replace("$", "")]: [
            { editStatus: EditStatus.Deleted, key: "deletedKey" },
            { editStatus: EditStatus.New, key: mockNewRelationKey },
          ],
        },
      },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable);
    expect(result).toBe(mockNewRelationKey);
  });

  it("returns the variable if only deleted relations are present", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";

    mocks.getForm.mockReturnValue({
      values: {
        relationValues: {
          [variable.replace("$", "")]: [
            { editStatus: EditStatus.Deleted, key: "deletedKey" },
          ],
        },
      },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable);
    expect(result).toBe(variable);
  });

  it("returns the second one if you give 1 as returnIdAtIndex and all are unchanged", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";

    mocks.getForm.mockReturnValue({
      values: {
        relationValues: {
          [variable.replace("$", "")]: [
            { editStatus: EditStatus.Unchanged, key: "Unchanged1" },
            { editStatus: EditStatus.Unchanged, key: "Unchanged2" },
            { editStatus: EditStatus.Unchanged, key: "Unchanged3" },
          ],
        },
      },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable, 1);
    expect(result).toBe("Unchanged2");
  });

  it("returns the new one if you give 1 as returnIdAtIndex there is a new one", () => {
    const formId = "existingFormId";
    const variable = "$variableKey";

    mocks.getForm.mockReturnValue({
      values: {
        relationValues: {
          [variable.replace("$", "")]: [
            { editStatus: EditStatus.Unchanged, key: "Unchanged1" },
            { editStatus: EditStatus.Unchanged, key: "Unchanged2" },
            { editStatus: EditStatus.New, key: "newKey1" },
          ],
        },
      },
    } as FormContext<any>);

    const result = getVariableValueForFilter(formId, variable, 1);
    expect(result).toBe("newKey1");
  });
});

describe("hasNewRelations", () => {
  const { hasNewRelations } = useGetDropdownOptionsState(
    "entityType" as Entitytyping,
    "parent",
  );

  it("returns true if a relation with editStatus New is present", () => {
    const relations = [
      { status: "fake_status" },
      { editStatus: EditStatus.New },
    ];

    const result = hasNewRelations(relations);
    expect(result).toBe(true);
  });

  it("returns false if no relation has editStatus New", () => {
    const relations = [
      { status: "fake_status" },
      { editStatus: EditStatus.Deleted },
    ];

    const result = hasNewRelations(relations);
    expect(result).toBe(false);
  });

  it("returns false for an empty relations array", () => {
    const relations: { editStatus?: string }[] = [];

    const result = hasNewRelations(relations);
    expect(result).toBe(false);
  });
});

describe("findNewRelationValue", () => {
  const { findNewRelationValue } = useGetDropdownOptionsState(
    "entityType" as Entitytyping,
    "parent",
  );

  it("returns the key of the first relation with editStatus New", () => {
    const newKey = "newKey1";
    const relations = [
      { key: "oldKey" },
      { editStatus: EditStatus.New, key: newKey },
      { editStatus: EditStatus.New, key: "newKey2" },
    ];

    const result = findNewRelationValue(relations);
    expect(result).toBe(newKey);
  });

  it("returns null if no relation has editStatus New", () => {
    const relations = [
      { key: "key1" },
      { editStatus: EditStatus.Deleted, key: "key2" },
    ];

    const result = findNewRelationValue(relations);
    expect(result).toBeNull();
  });

  it("returns null for an empty relations array", () => {
    const relations: { editStatus: string; key: string }[] = [];

    const result = findNewRelationValue(relations);
    expect(result).toBeNull();
  });
});
