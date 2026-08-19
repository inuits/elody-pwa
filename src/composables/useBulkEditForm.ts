import {
  ActionType,
  BulkEditModes,
  DamsIcons,
  ValidationRules,
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
  formFields: Record<string, any>;
  fieldTypeMap: Record<string, string[]>;
  typesInSelection: string[];
  unmatchedTypes: string[];
  conflicts: BulkEditFieldConflict[];
};

const formCache = new Map<string, ExtractedForm>();

const sameType = (a: unknown, b: unknown): boolean =>
  String(a).toLowerCase() === String(b).toLowerCase();

// required_if is deliberately left out: it depends on values this form does not
// know, so treat such a field as clearable and let the backend judge.
const isRequiredField = (field: any): boolean => {
  const rules: string[] = field?.inputField?.validation?.value ?? [];
  return [
    ValidationRules.Required,
    ValidationRules.HasRequiredRelation,
    ValidationRules.HasOneOfRequiredRelations,
  ].some((rule) => rules.includes(rule));
};

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
      console.warn(
        `Bulk edit: no query named '${queryName}' exists, skipping it`,
      );
      return undefined;
    }

    let result: any;
    try {
      result = await apolloClient.query({ query, fetchPolicy: "cache-first" });
    } catch (error) {
      console.warn(
        `Bulk edit: fetching '${queryName}' failed, skipping it`,
        error,
      );
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

  const buildBulkField = (
    field: any,
    types: string[],
    requiredForAllTypes: boolean,
  ): any => {
    const clone = structuredClone(field);
    // Validation is dropped below, so carry the one bit the form still needs:
    // a field every selected type requires can never be emptied.
    clone.requiredForAllTypes = requiredForAllTypes;
    // A bulk form submits only the fields the user touched, so nothing may be
    // required — and validation is read straight off the field on every render.
    delete clone.inputField.validation;
    // A prefilled value in a bulk form reads as an intentional edit.
    delete clone.defaultValue;
    clone.onlyForEntityTypes = types;
    return clone;
  };

  const getCandidatesPerKey = (
    forms: ExtractedForm[],
    typesInSelection: string[],
  ) => {
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

    return candidatesPerKey;
  };

  const resolveFieldCandidates = (
    key: string,
    candidates: { type: string; field: any }[],
    typesInSelection: string[],
  ) => {
    const perInputField = new Map<string, string[]>();

    candidates.forEach(({ type, field }) => {
      const inputFieldType = field.inputField.type;
      perInputField.set(inputFieldType, [
        ...(perInputField.get(inputFieldType) ?? []),
        type,
      ]);
    });

    // Find the input field type shared by the most entities
    const [keptInputField, keptTypes] = [...perInputField.entries()].reduce(
      (widest, entry) => (entry[1].length > widest[1].length ? entry : widest),
    );

    const droppedTypes = candidates
      .map(({ type }) => type)
      .filter((type) => !keptTypes.includes(type));

    const conflict =
      droppedTypes.length > 0 ? { key, keptInputField, droppedTypes } : null;

    const field = candidates.find(
      ({ field: candidate }) => candidate.inputField.type === keptInputField,
    )!.field;

    const coversWholeSelection = typesInSelection.every((type) =>
      keptTypes.some((keptType) => sameType(keptType, type)),
    );

    const requiredForAllTypes = candidates
      .filter(({ type }) => keptTypes.includes(type))
      .every(({ field: candidate }) => isRequiredField(candidate));

    return {
      conflict,
      field,
      keptTypes,
      coversWholeSelection,
      requiredForAllTypes,
    };
  };

  const mergeFormFields = (
    forms: ExtractedForm[],
    typesInSelection: string[],
  ): Pick<MergedBulkEditForm, "formFields" | "fieldTypeMap" | "conflicts"> => {
    const formFields: Record<string, any> = {};
    const fieldTypeMap: Record<string, string[]> = {};
    const conflicts: BulkEditFieldConflict[] = [];

    const candidatesPerKey = getCandidatesPerKey(forms, typesInSelection);

    candidatesPerKey.forEach((candidates, key) => {
      const {
        conflict,
        field,
        keptTypes,
        coversWholeSelection,
        requiredForAllTypes,
      } = resolveFieldCandidates(key, candidates, typesInSelection);

      if (conflict) {
        conflicts.push(conflict);
        console.warn(
          `Bulk edit: '${key}' uses a different input field on ${conflict.droppedTypes.join(", ")}; those types are excluded from this field`,
        );
      }

      formFields[key] = buildBulkField(field, keptTypes, requiredForAllTypes);

      if (coversWholeSelection) {
        delete formFields[key].onlyForEntityTypes;
      } else {
        fieldTypeMap[key] = keptTypes;
      }
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

  const appliesToType = (
    scope: Record<string, string[]>,
    name: string,
    entityType: string,
  ): boolean => {
    const types = scope[name];
    if (!types) return true;
    return types.some((type) => sameType(type, entityType));
  };

  const metadataKeysForType = (
    keys: string[],
    fieldTypeMap: Record<string, string[]>,
    entityType: string,
  ): string[] =>
    keys.filter((key) => appliesToType(fieldTypeMap, key, entityType));

  const relationsForType = <T extends { type: string }>(
    relations: T[],
    relationTypeScope: Record<string, string[]>,
    entityType: string,
  ): T[] =>
    relations.filter((relation) =>
      appliesToType(relationTypeScope, relation.type, entityType),
    );

  const relationTypesForType = (
    relationTypes: string[],
    relationTypeScope: Record<string, string[]>,
    entityType: string,
  ): string[] =>
    relationTypes.filter((relationType) =>
      appliesToType(relationTypeScope, relationType, entityType),
    );

  const resolveSucceededIds = (
    ids: string[],
    transports: { carriedIds: string[]; succeededIds: string[] }[],
    failedIds: Set<string>,
  ): string[] =>
    ids.filter((id) => {
      if (failedIds.has(id)) return false;
      return transports
        .filter((transport) => transport.carriedIds.includes(id))
        .every((transport) => transport.succeededIds.includes(id));
    });

  const buildJsonDocuments = (
    byType: Record<string, string[]>,
    payload: {
      metadata: { key: string; value: unknown }[];
      relationsToReplace: any[];
    },
    fieldTypeMap: Record<string, string[]>,
    relationMode: BulkEditModes,
    relationTypeScope: Record<string, string[]> = {},
  ): Record<string, unknown>[] => {
    const metadataKeys = payload.metadata.map((entry) => entry.key);
    const replaces = relationMode === BulkEditModes.Replace;

    return Object.entries(byType).flatMap(([type, idsOfType]) => {
      const keysForType = metadataKeysForType(metadataKeys, fieldTypeMap, type);
      const metadata = payload.metadata.filter((entry) =>
        keysForType.includes(entry.key),
      );
      const relations = replaces
        ? relationsForType(
            payload.relationsToReplace,
            relationTypeScope,
            type,
          ).map(stripRelationForStorage)
        : [];
      if (metadata.length === 0 && relations.length === 0) return [];

      return idsOfType.map((id) => ({
        id,
        identifiers: [id],
        type,
        metadata,
        ...(relations.length > 0 ? { relations } : {}),
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
    relationsForType,
    relationTypesForType,
    resolveSucceededIds,
    buildJsonDocuments,
    groupIdsByType,
    clearBulkEditFormCache,
  };
};

export { useBulkEditForm };
