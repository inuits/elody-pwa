import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useRepeatableFields } from "@/composables/useRepeatableFields"; // Adjust path
import { useFieldArray, useForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";

vi.mock("vee-validate", () => ({
  useFieldArray: vi.fn(),
  useForm: vi.fn(),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: vi.fn(),
}));

describe("useRepeatableFields", () => {
  const fieldKey = "testField";
  const formId = "test-form-id";

  const mockPush = vi.fn();
  const mockRemove = vi.fn();
  const mockFields = ref([{ id: 1, value: undefined }]);

  const mockAddEditableMetadataKeys = vi.fn();
  const mockGetForm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useFieldArray as any).mockReturnValue({
      fields: mockFields,
      push: mockPush,
      remove: mockRemove,
    });

    (useFormHelper as any).mockReturnValue({
      getForm: mockGetForm,
      addEditableMetadataKeys: mockAddEditableMetadataKeys,
    });

    (useForm as any).mockReturnValue({
      values: {},
    });
  });

  it("should initialize with default repeat amount of 1", () => {
    mockGetForm.mockReturnValue({ values: {} });

    const composable = useRepeatableFields(fieldKey, formId);
    composable.init();

    expect(mockAddEditableMetadataKeys).toHaveBeenCalledWith(
      [fieldKey],
      formId,
    );
    expect(useFieldArray).toHaveBeenCalledWith(
      `intialValues.repeatable-panels.${fieldKey}`,
    );
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("should increase repeat amount when increaseFieldRepeatAmount is called", () => {
    const composable = useRepeatableFields(fieldKey, formId);
    composable.init();

    composable.increaseFieldRepeatAmount({ name: "new item" });
    expect(mockPush).toHaveBeenCalledWith({ name: "new item" });
  });

  it("should decrease repeat amount only if more than one item exists", () => {
    mockFields.value = [{ id: 1 }, { id: 2 }];

    const composable = useRepeatableFields(fieldKey, formId);
    composable.init();

    expect(composable.repetitionDeleteIsAvailable.value).toBe(true);

    composable.decreaseFieldRepeatAmount(1);
    expect(mockRemove).toHaveBeenCalledWith(1);
  });

  it("should NOT decrease repeat amount if only one item remains", () => {
    mockFields.value = [{ id: 1 }];

    const composable = useRepeatableFields(fieldKey, formId);
    composable.init();

    expect(composable.repetitionDeleteIsAvailable.value).toBe(false);

    composable.decreaseFieldRepeatAmount(0);
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("should throw an error if the form is not found during init", () => {
    mockGetForm.mockReturnValue(null);

    const composable = useRepeatableFields(fieldKey, formId);

    expect(() => composable.init()).toThrow(`Form with id ${formId} not found`);
  });
});
