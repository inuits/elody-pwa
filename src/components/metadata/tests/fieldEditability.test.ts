import { describe, it, expect, vi } from "vitest";

vi.mock("@/generated-types/queries", () => ({
  InputFieldTypes: {
    Text: "text",
    Number: "number",
    Date: "date",
    Textarea: "textarea",
    ResizableTextarea: "resizableTextarea",
    Checkbox: "checkbox",
    Dropdown: "dropdown",
    DropdownSingleselectMetadata: "dropdownSingleselectMetadata",
    DropdownMultiselectMetadata: "dropdownMultiselectMetadata",
    DropdownSingleselectRelations: "dropdownSingleselectRelations",
    DropdownMultiselectRelations: "dropdownMultiselectRelations",
    InputFieldWithSubFields: "inputFieldWithSubFields",
    FileUpload: "fileUpload",
  },
}));

import { canEditFieldInPlace } from "@/components/metadata/fieldEditability";

const editable = {
  inputFieldType: "text",
  nonEditableField: false,
  editableByUser: true,
  locked: false,
  masked: false,
  entityCanUpdate: true,
  pageInEditMode: false,
};

describe("canEditFieldInPlace", () => {
  it("allows an editable plain field", () => {
    expect(canEditFieldInPlace(editable)).toBe(true);
  });

  it.each([
    "text",
    "number",
    "date",
    "textarea",
    "resizableTextarea",
    "checkbox",
    "dropdown",
    "dropdownSingleselectMetadata",
    "dropdownMultiselectMetadata",
    "dropdownSingleselectRelations",
    "dropdownMultiselectRelations",
  ])("supports the %s field type", (inputFieldType) => {
    expect(canEditFieldInPlace({ ...editable, inputFieldType })).toBe(true);
  });

  it.each(["inputFieldWithSubFields", "fileUpload", undefined])(
    "does not yet edit %s fields in place",
    (inputFieldType) => {
      expect(canEditFieldInPlace({ ...editable, inputFieldType })).toBe(false);
    },
  );

  it.each([
    ["the field is not editable", { nonEditableField: true }],
    ["the user may not edit it", { editableByUser: false }],
    ["the field is locked", { locked: true }],
    ["the value is masked", { masked: true }],
    ["the user may not update the entity", { entityCanUpdate: false }],
    ["the page-wide edit mode is on", { pageInEditMode: true }],
  ])("refuses when %s", (_reason, override) => {
    expect(canEditFieldInPlace({ ...editable, ...override })).toBe(false);
  });
});
