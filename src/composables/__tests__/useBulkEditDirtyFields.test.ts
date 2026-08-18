import { describe, expect, it, vi } from "vitest";
import { useFormHelper } from "@/composables/useFormHelper";

vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn() },
}));

const { createForm, buildBulkEditPayload, editableFields } = useFormHelper();

// The bulk-edit payload only keeps fields the user actually touched, and it asks
// vee-validate itself. If the path string here ever stops matching what the form
// registers, every metadata bulk edit silently submits nothing.
describe("bulk edit dirty detection against a real form", () => {
  const formId = "GetBulkEditFormDirtyCheck";

  it("reports only the field that changed, and builds a payload from it", () => {
    const form = createForm(formId, {
      intialValues: { quality_marks: undefined, record_format: undefined } as any,
      relationValues: {},
    });
    editableFields.value[formId] = ["quality_marks", "record_format"];

    form.setFieldValue("intialValues.quality_marks", ["awarded"]);

    expect(form.isFieldDirty("intialValues.quality_marks")).toBe(true);
    expect(form.isFieldDirty("intialValues.record_format")).toBe(false);

    const payload = buildBulkEditPayload(form.values, {
      formId,
      isFieldDirty: (path: string) => form.isFieldDirty(path as any),
    });

    expect(payload.metadata).toEqual([
      { key: "quality_marks", value: ["awarded"] },
    ]);
    expect(payload.hasChanges).toBe(true);
  });
});
