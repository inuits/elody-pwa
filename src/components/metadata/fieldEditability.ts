import { InputFieldTypes } from "@/generated-types/queries";

// Per-field editing replaces the page-wide edit mode ("Bewerk metadata"): its
// button is hidden. The legacy code path stays until it is removed.
export const PAGE_EDIT_MODE_AVAILABLE = false;

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

// Relation dropdowns edit in place only when they save as the entity's own
// relations (relationValues), not as metadata, on a linked entity or inherited.
const RELATION_FIELD_TYPES = new Set<string>([
  InputFieldTypes.DropdownSingleselectRelations,
  InputFieldTypes.DropdownMultiselectRelations,
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
  relationEditable?: boolean;
  // Not yet edited in place: they get their own editors later.
  multilingual?: boolean;
  onRelation?: boolean;
  repeatable?: boolean;
};

export const canEditFieldInPlace = (field: FieldEditabilityContext): boolean =>
  !!field.inputFieldType &&
  (IN_PLACE_FIELD_TYPES.has(field.inputFieldType) ||
    (RELATION_FIELD_TYPES.has(field.inputFieldType) &&
      !!field.relationEditable)) &&
  !field.nonEditableField &&
  field.editableByUser &&
  !field.locked &&
  !field.masked &&
  field.entityCanUpdate &&
  !field.pageInEditMode &&
  !field.multilingual &&
  !field.onRelation &&
  !field.repeatable;

// A WYSIWYG field (WysiwygElement) edits in place as a whole, in the selected
// language when it is multilingual.
export type WysiwygEditabilityContext = {
  locked: boolean;
  entityCanUpdate: boolean;
  pageInEditMode: boolean;
};

export const canEditWysiwygInPlace = (
  field: WysiwygEditabilityContext,
): boolean => !field.locked && field.entityCanUpdate && !field.pageInEditMode;
