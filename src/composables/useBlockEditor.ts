import { computed, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import {
  Collection,
  MutateEntityValuesDocument,
  type MetadataValuesInput,
  type PanelMetaData,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { deepToRaw } from "@/utils/deepToRaw";

// Per-block editing: edit scope = save scope = validation scope for a
// window panel. The block opens as a small form, saves as ONE mutation
// carrying only the keys that actually changed (so per-property audit
// stays truthful), and only this block locks while saving.
export function useBlockEditor(formId: string) {
  const route = useRoute();
  const { getForm, parseRelationValuesForFormSubmit } = useFormHelper();
  const { mutate } = useMutation(MutateEntityValuesDocument);

  const isEditingBlock = ref<boolean>(false);
  const isSaving = ref<boolean>(false);
  const blockError = ref<string>("");
  const savedFlash = ref<boolean>(false);
  let snapshot: Record<string, any> | null = null;
  let relationSnapshot: Record<string, any> | null = null;
  let flashTimer: ReturnType<typeof setTimeout> | undefined;

  const collection = computed<Collection>(
    () => (route.meta?.type as Collection) ?? Collection.Entities,
  );

  const start = () => {
    const form = getForm(formId);
    if (!form) return;
    snapshot = structuredClone(deepToRaw(form.values.intialValues ?? {}));
    relationSnapshot = structuredClone(
      deepToRaw(form.values.relationValues ?? {}),
    );
    blockError.value = "";
    isEditingBlock.value = true;
  };

  const cancel = () => {
    const form = getForm(formId);
    if (form && snapshot) {
      form.setFieldValue("intialValues", structuredClone(snapshot));
      form.setFieldValue("relationValues", structuredClone(relationSnapshot));
    }
    blockError.value = "";
    isEditingBlock.value = false;
  };

  const valuesDiffer = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);

  const collectChangedMetadata = (
    fields: PanelMetaData[],
    repetitionKey?: string,
  ): MetadataValuesInput[] => {
    const form = getForm(formId);
    if (!form) return [];
    const current = form.values.intialValues as Record<string, any>;

    if (repetitionKey) {
      const rows = current?.["repeatable-panels"]?.[repetitionKey] ?? {};
      const rowArray = Object.values(rows);
      if (!valuesDiffer(rowArray, snapshot?.[repetitionKey])) return [];
      return [{ key: repetitionKey, value: rowArray }];
    }

    const entries: MetadataValuesInput[] = [];
    for (const field of fields) {
      if (!field.inputField) continue;
      // relation-backed fields are handled via relationValues below
      if (field.inputField.relationType && !field.inputField.isMetadataField)
        continue;
      const key = field.key;
      if (!valuesDiffer(current?.[key], snapshot?.[key])) continue;
      entries.push({
        key: (field.inputField as any).fieldKeyToSave || key,
        value: current?.[key] ?? "",
      });
    }
    return entries;
  };

  const validateBlock = async (
    fieldPaths: string[],
  ): Promise<string | undefined> => {
    const form = getForm(formId);
    if (!form) return undefined;
    for (const path of fieldPaths) {
      const result = await form.validateField(path as never);
      if (result && result.valid === false)
        return result.errors?.[0] ?? "invalid";
    }
    return undefined;
  };

  const save = async (
    fields: PanelMetaData[],
    fieldPaths: string[],
    repetitionKey?: string,
  ): Promise<boolean> => {
    const form = getForm(formId);
    if (!form) return false;

    const validationError = await validateBlock(fieldPaths);
    if (validationError) {
      blockError.value = validationError;
      return false;
    }

    const metadata = collectChangedMetadata(fields, repetitionKey);
    const relations = parseRelationValuesForFormSubmit(
      form.values.relationValues ?? {},
    );

    if (metadata.length === 0 && relations.length === 0) {
      isEditingBlock.value = false;
      return true;
    }

    isSaving.value = true;
    blockError.value = "";
    try {
      await mutate(
        {
          id: formId,
          collection: collection.value,
          formInput: { metadata, relations },
        },
        { context: { skipGlobalErrorHandling: true } } as any,
      );
      if (repetitionKey && metadata.length > 0)
        form.setFieldValue(
          `intialValues.${repetitionKey}` as never,
          metadata[0].value as never,
        );
      isEditingBlock.value = false;
      savedFlash.value = true;
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => (savedFlash.value = false), 2500);
      return true;
    } catch (exception: unknown) {
      blockError.value = (exception as Error)?.message || "save failed";
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return {
    isEditingBlock,
    isSaving,
    blockError,
    savedFlash,
    start,
    cancel,
    save,
  };
}
