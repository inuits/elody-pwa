import {
  ActionType,
  BulkEditModes,
  DamsIcons,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";

export type ExtractedForm = {
  queryName: string;
  creationType: string;
  fields: Record<string, any>;
};

export type BulkEditFieldConflict = {
  key: string;
  keptInputField: string;
  droppedTypes: string[];
};

export type MergedBulkEditForm = {
  /** Shape DynamicForm's modalFormFields prop expects. */
  formFields: Record<string, any>;
  /** Field key -> the entity types it applies to. Universal keys are absent. */
  fieldTypeMap: Record<string, string[]>;
  typesInSelection: string[];
  /** Selected types that none of the configured form queries described. */
  unmatchedTypes: string[];
  conflicts: BulkEditFieldConflict[];
};

const formCache = new Map<string, ExtractedForm>();

const sameType = (a: unknown, b: unknown): boolean =>
  String(a).toLowerCase() === String(b).toLowerCase();

// The other write paths strip these before sending; a relation document should not
// carry form bookkeeping or a teaser copy of the related entity.
const stripRelationForStorage = (relation: any): any => {
  const { editStatus, value, teaserMetadata, ...rest } = relation;
  return rest;
};

const useBulkEditForm = () => {
  const { loadDocument } = useImport();

  const findFormTab = (dynamicForm: Record<string, any>): any =>
    Object.values(dynamicForm ?? {}).find(
      (value: any) => value?.__typename === "FormTab",
    );

  const extractForm = (
    queryName: string,
    data: any,
  ): ExtractedForm | undefined => {
    const formTab = findFormTab(data?.GetDynamicForm);
    if (!formTab?.formFields) return undefined;

    const entries = Object.entries<any>(formTab.formFields).filter(
      ([, value]) => typeof value === "object" && value !== null,
    );
    // Each per-type form names the type it creates, so no type-to-query config is needed.
    const creationType = entries.find(
      ([, value]) => value.__typename === "FormAction",
    )?.[1]?.creationType;
    if (!creationType) return undefined;

    const fields = Object.fromEntries(
      entries.filter(([, value]) => value.__typename === "PanelMetaData"),
    );
    return { queryName, creationType, fields };
  };

  const fetchForm = async (
    queryName: string,
  ): Promise<ExtractedForm | undefined> => {
    const cached = formCache.get(queryName);
    if (cached) return cached;

    const query = await loadDocument(queryName);
    if (!query) {
      console.warn(`Bulk edit: no query named '${queryName}' exists, skipping it`);
      return undefined;
    }

    // Queried directly instead of through useDynamicForm, whose dynamicForm and
    // dynamicFormLoaded are module singletons shared with any open form.
    let result: any;
    try {
      result = await apolloClient.query({ query, fetchPolicy: "cache-first" });
    } catch (error) {
      console.warn(`Bulk edit: fetching '${queryName}' failed, skipping it`, error);
      return undefined;
    }
    const form = extractForm(queryName, result?.data);
    if (!form) {
      console.warn(
        `Bulk edit: '${queryName}' has no form tab with a creationType, skipping it`,
      );
      return undefined;
    }

    formCache.set(queryName, form);
    return form;
  };

  const buildBulkField = (field: any, types: string[]): any => {
    const clone = structuredClone(field);
    // A bulk form submits only the fields the user touched, so nothing may be
    // required — and validation is read straight off the field on every render.
    delete clone.inputField.validation;
    // A prefilled value in a bulk form reads as an intentional edit.
    delete clone.defaultValue;
    clone.onlyForEntityTypes = types;
    return clone;
  };

  const mergeFormFields = (
    forms: ExtractedForm[],
    typesInSelection: string[],
  ): Pick<
    MergedBulkEditForm,
    "formFields" | "fieldTypeMap" | "conflicts"
  > => {
    const relevantForms = forms.filter((form) =>
      typesInSelection.some((type) => sameType(type, form.creationType)),
    );

    const candidatesPerKey = new Map<string, { type: string; field: any }[]>();
    relevantForms.forEach((form) =>
      Object.values(form.fields).forEach((field: any) => {
        if (!field.key || !field.inputField?.type) return;
        const candidates = candidatesPerKey.get(field.key) ?? [];
        candidates.push({ type: form.creationType, field });
        candidatesPerKey.set(field.key, candidates);
      }),
    );

    const formFields: Record<string, any> = {};
    const fieldTypeMap: Record<string, string[]> = {};
    const conflicts: BulkEditFieldConflict[] = [];

    candidatesPerKey.forEach((candidates, key) => {
      // One key means one form value, so two variants of the same key cannot both
      // render. Group by input field and keep the widest group: a type that loses
      // simply does not get the field, which beats writing a value picked from the
      // wrong option list.
      const perInputField = new Map<string, string[]>();
      candidates.forEach(({ type, field }) => {
        const inputFieldType = field.inputField.type;
        perInputField.set(inputFieldType, [
          ...(perInputField.get(inputFieldType) ?? []),
          type,
        ]);
      });

      // Ties keep the first input field seen, so the order of the configured
      // formQueries decides which types win.
      const [keptInputField, keptTypes] = [...perInputField.entries()].reduce(
        (widest, entry) => (entry[1].length > widest[1].length ? entry : widest),
      );
      const droppedTypes = candidates
        .map(({ type }) => type)
        .filter((type) => !keptTypes.includes(type));

      if (droppedTypes.length > 0) {
        conflicts.push({ key, keptInputField, droppedTypes });
        console.warn(
          `Bulk edit: '${key}' uses a different input field on ${droppedTypes.join(", ")}; those types are excluded from this field`,
        );
      }

      const field = candidates.find(
        ({ field: candidate }) => candidate.inputField.type === keptInputField,
      )!.field;
      const coversWholeSelection = typesInSelection.every((type) =>
        keptTypes.some((keptType) => sameType(keptType, type)),
      );

      formFields[key] = buildBulkField(field, keptTypes);
      if (coversWholeSelection) delete formFields[key].onlyForEntityTypes;
      else fieldTypeMap[key] = keptTypes;
    });

    formFields.bulkEditAction = {
      __typename: "FormAction",
      label: "actions.labels.apply",
      icon: DamsIcons.Edit,
      actionType: ActionType.BulkUpdateMetadata,
    };

    return { formFields, fieldTypeMap, conflicts };
  };

  const buildMergedBulkEditForm = async (
    formQueries: string[],
    typesInSelection: string[],
  ): Promise<MergedBulkEditForm> => {
    const forms = (
      await Promise.all(formQueries.map((queryName) => fetchForm(queryName)))
    ).filter(Boolean) as ExtractedForm[];

    const unmatchedTypes = typesInSelection.filter(
      (type) => !forms.some((form) => sameType(form.creationType, type)),
    );

    return {
      ...mergeFormFields(forms, typesInSelection),
      typesInSelection,
      unmatchedTypes,
    };
  };

  const metadataKeysForType = (
    keys: string[],
    fieldTypeMap: Record<string, string[]>,
    entityType: string,
  ): string[] =>
    keys.filter((key) => {
      const types = fieldTypeMap[key];
      if (!types) return true;
      return types.some((type) => sameType(type, entityType));
    });

  /**
   * One elody-shaped document per selected entity, carrying only the metadata keys
   * that exist on that entity's type. `relations` is present only to replace them:
   * the batch endpoint overwrites every relation of a type it sees, and omitting the
   * key leaves relations untouched — so adding or removing must not come through here.
   */
  const buildJsonDocuments = (
    byType: Record<string, string[]>,
    payload: {
      metadata: { key: string; value: unknown }[];
      relationsToReplace: any[];
    },
    fieldTypeMap: Record<string, string[]>,
    relationMode: BulkEditModes,
  ): Record<string, unknown>[] => {
    const metadataKeys = payload.metadata.map((entry) => entry.key);
    const replacesRelations =
      relationMode === BulkEditModes.Replace &&
      payload.relationsToReplace.length > 0;

    return Object.entries(byType).flatMap(([type, idsOfType]) => {
      const keysForType = metadataKeysForType(metadataKeys, fieldTypeMap, type);
      const metadata = payload.metadata.filter((entry) =>
        keysForType.includes(entry.key),
      );
      if (metadata.length === 0 && !replacesRelations) return [];

      const relations = payload.relationsToReplace.map(stripRelationForStorage);
      return idsOfType.map((id) => ({
        id,
        identifiers: [id],
        type,
        metadata,
        ...(replacesRelations ? { relations } : {}),
      }));
    });
  };

  const groupIdsByType = (
    items: InBulkProcessableItem[],
  ): { byType: Record<string, string[]>; missingType: string[] } => {
    const byType: Record<string, string[]> = {};
    const missingType: string[] = [];

    items.forEach((item) => {
      if (!item.type) {
        missingType.push(item.id);
        return;
      }
      byType[item.type] = [...(byType[item.type] ?? []), item.id];
    });

    return { byType, missingType };
  };

  const clearBulkEditFormCache = (): void => formCache.clear();

  return {
    buildMergedBulkEditForm,
    mergeFormFields,
    metadataKeysForType,
    buildJsonDocuments,
    groupIdsByType,
    clearBulkEditFormCache,
  };
};

export { useBulkEditForm };
