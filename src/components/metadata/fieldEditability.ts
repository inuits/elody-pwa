import { InputFieldTypes } from "@/generated-types/queries";

// Field types that edit in place on a detail page. Other types keep their
// read-only rendering until they get an inline editor
// (docs/design-system/patterns/per-field-editing.md).
const IN_PLACE_FIELD_TYPES = new Set<string>([
  InputFieldTypes.Text,
  InputFieldTypes.Number,
  InputFieldTypes.Date,
  InputFieldTypes.Textarea,
  InputFieldTypes.ResizableTextarea,
  InputFieldTypes.Checkbox,
  InputFieldTypes.Dropdown,
  InputFieldTypes.DropdownSingleselectMetadata,
  InputFieldTypes.DropdownMultiselectMetadata,
]);

export type FieldEditabilityContext = {
  inputFieldType?: string;
  nonEditableField?: boolean;
  editableByUser: boolean;
  locked: boolean;
  masked: boolean;
  entityCanUpdate: boolean;
  // The legacy page-wide edit mode still renders its own inputs.
  pageInEditMode: boolean;
  // Not yet edited in place: they get their own editors later.
  multilingual?: boolean;
  onRelation?: boolean;
  repeatable?: boolean;
};

export const canEditFieldInPlace = (field: FieldEditabilityContext): boolean =>
  !!field.inputFieldType &&
  IN_PLACE_FIELD_TYPES.has(field.inputFieldType) &&
  !field.nonEditableField &&
  field.editableByUser &&
  !field.locked &&
  !field.masked &&
  field.entityCanUpdate &&
  !field.pageInEditMode &&
  !field.multilingual &&
  !field.onRelation &&
  !field.repeatable;
