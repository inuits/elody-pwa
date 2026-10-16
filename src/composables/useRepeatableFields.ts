import { computed, type ComputedRef, ref, type Ref } from "vue";
import { type FieldEntry, useFieldArray } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";

export type PanelRepetitionProps = {
  isRepeatable: boolean;
  index: number;
  field: FieldEntry<unknown> | undefined;
  repeatableFieldsHelper: UseRepeatableFields;
};

export type UseRepeatableFields = {
  init: () => void;
  fields: Ref<FieldEntry<unknown>[], FieldEntry<unknown>[]>;
  repeatAmount: ComputedRef<number>;
  repetitionDeleteIsAvailable: ComputedRef<boolean>;
  increaseFieldRepeatAmount: (fieldValue?: any) => void;
  decreaseFieldRepeatAmount: (index: number) => void;
  fieldKey: string;
  // Per-field editing: rows are saved as the whole stored list.
  rowsForSave: (
    editedIndex: number,
    key: string,
    value: unknown,
  ) => Record<string, unknown>[];
  rowsWithout: (index: number) => Record<string, unknown>[];
  markSaved: (rows: Record<string, unknown>[], editedIndex?: number) => void;
  isStoredRow: (index: number) => boolean;
  canRemoveRow: (index: number) => boolean;
  addRow: () => number;
  discardUnsavedRow: (index: number) => void;
  removeSavedRow: (index: number, savedRows: Record<string, unknown>[]) => void;
};

type Row = Record<string, unknown>;

export const useRepeatableFields = (
  fieldKey: string,
  formId: string,
): UseRepeatableFields => {
  const initialized = ref<boolean>(false);
  const initRepeatAmount = ref<number>(1);

  const fieldArray = ref<ReturnType<typeof useFieldArray> | undefined>(
    undefined,
  );

  const { getForm, addEditableMetadataKeys } = useFormHelper();

  const setInitRepeatAmount = (): void => {
    const form = getForm(formId);

    if (!form) throw new Error(`Form with id ${formId} not found`);

    const formValues = form.values;
    initRepeatAmount.value = formValues?.intialValues?.[fieldKey]?.length || 1;
  };

  const init = () => {
    if (initialized.value) return;
    initialized.value = true;
    setInitRepeatAmount();
    addEditableMetadataKeys([fieldKey], formId);

    fieldArray.value = useFieldArray(
      `intialValues.repeatable-panels.${fieldKey}`,
    );

    for (let i = 0; i < initRepeatAmount.value; i++) {
      fieldArray.value?.push(undefined);
    }
  };

  const increaseFieldRepeatAmount = (fieldValue: any = {}) => {
    if (!fieldArray.value) return;
    fieldArray.value.push(fieldValue);
  };

  const decreaseFieldRepeatAmount = (index: number) => {
    if (!repetitionDeleteIsAvailable.value || !fieldArray.value) return;
    fieldArray.value.remove(index);
  };

  const fields = computed(() => fieldArray.value?.fields ?? []);

  const storedRows = (): Row[] =>
    getForm(formId)?.values?.intialValues?.[fieldKey] || [];
  // The saved rows as they are on screen, on top of what is stored so keys a
  // row has but no field shows are kept. Unsaved rows stay out, except the
  // one being saved.
  const savedRowsOnScreen = (editedIndex?: number): Row[] => {
    const stored = storedRows();
    const onScreen: (Row | undefined)[] =
      getForm(formId)?.values?.intialValues?.["repeatable-panels"]?.[
        fieldKey
      ] || [];
    return onScreen
      .map((row, index) => ({ ...stored[index], ...(row ?? {}) }))
      .filter((_, index) => index < stored.length || index === editedIndex);
  };
  // Saved rows come first on screen, so an unsaved row saves right after them.
  const rowsForSave = (editedIndex: number, key: string, value: unknown): Row[] => {
    const rows = savedRowsOnScreen(editedIndex);
    const at = Math.min(editedIndex, storedRows().length);
    rows[at] = { ...rows[at], [key]: value };
    return rows;
  };
  const rowsWithout = (index: number): Row[] =>
    savedRowsOnScreen().filter((_, rowIndex) => rowIndex !== index);
  // A newly saved row moves up to right after the stored rows, so a row's
  // place on screen stays its place in the stored list.
  const markSaved = (rows: Row[], editedIndex?: number) => {
    const stored = storedRows().length;
    if (editedIndex !== undefined && editedIndex > stored)
      fieldArray.value?.move(editedIndex, stored);
    getForm(formId)?.setFieldValue(`intialValues.${fieldKey}`, rows);
  };
  const isStoredRow = (index: number) => index < storedRows().length;

  // A saved row is removed by saving; an unsaved one just goes, unless it is
  // the empty row a panel without values shows.
  const canRemoveRow = (index: number) =>
    isStoredRow(index) || fields.value.length > 1;
  // Rows are added after all others; each exists only on screen until one of
  // its fields saves.
  const addRow = (): number => {
    fieldArray.value?.push({});
    return fields.value.length - 1;
  };
  const discardUnsavedRow = (index: number) => {
    if (isStoredRow(index) || !canRemoveRow(index)) return;
    fieldArray.value?.remove(index);
  };
  const removeSavedRow = (index: number, savedRows: Row[]) => {
    if (!fieldArray.value) return;
    fieldArray.value.remove(index);
    // The panel always shows a row, so a value can be added again.
    if (fieldArray.value.fields.length === 0) fieldArray.value.push(undefined);
    markSaved(savedRows);
  };
  const repeatAmount = computed(() => fields.value.length || 1);
  const repetitionDeleteIsAvailable = computed(
    () => repeatAmount.value > 1 || false,
  );

  return {
    init,
    fields,
    repeatAmount,
    repetitionDeleteIsAvailable,
    increaseFieldRepeatAmount,
    decreaseFieldRepeatAmount,
    fieldKey,
    rowsForSave,
    rowsWithout,
    markSaved,
    isStoredRow,
    canRemoveRow,
    addRow,
    discardUnsavedRow,
    removeSavedRow,
  };
};
