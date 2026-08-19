import {
  type BaseRelationValuesInput,
  BulkEditModes,
  EditStatus,
  type IntialValues,
  type MetadataValuesInput,
  type PanelMetaData,
} from "@/generated-types/queries";
import { findPanelMetadata } from "@/helpers";
import { type FormContext, useForm } from "vee-validate";
import { ref, inject, nextTick, getCurrentInstance, unref } from "vue";
import { useRoute } from "vue-router";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { useInheritedRelations } from "./useInheritedRelations";

const forms = ref<{ [key: string]: FormContext<any> }>({});
const editableFields = ref<{ [key: string]: string[] }>({});
const bulkEditRelationModes = ref<{ [formId: string]: BulkEditModes }>({});
const bulkEditClearedFields = ref<{ [formId: string]: string[] }>({});
const teaserMetadataSaved = ref<{ [key: string]: object }>({});
const multilingualTranslations = ref<{
  [formId: string]: {
    [fieldKey: string]: { key: string; value: unknown; lang: string }[];
  };
}>({});

export type BulkEditPayload = {
  metadata: MetadataValuesInput[];
  relationsToAdd: BaseRelationValuesInput[];
  relationsToRemove: BaseRelationValuesInput[];
  relationsToReplace: BaseRelationValuesInput[];
  /** Relation types to empty completely, regardless of the chosen mode. */
  relationTypesToClear: string[];
  hasChanges: boolean;
};

export type EntityValues = {
  intialValues?: IntialValues;
  relationValues?: { [key: string]: any };
  relationMetadata?: IntialValues | {};
  relatedEntityData?: {
    metadata?: IntialValues | {};
    relations?: IntialValues | {};
  };
  relationRootdata?: IntialValues | {};
};

const useFormHelper = () => {
  const instance = getCurrentInstance();
  const config = instance ? (inject("config", null) as any) : null;

  const createEntityValues = (
    intialValueFields: PanelMetaData[],
  ): EntityValues => {
    const intialValues: any = {};
    Object.values(intialValueFields).forEach((field: PanelMetaData) => {
      if (!field.key) return;
      intialValues[field.key] = "";
    });
    return {
      intialValues: intialValues,
      relationValues: {},
      relationMetadata: {},
      relatedEntityData: { metadata: {}, relations: {} },
    };
  };

  const createForm = (
    key: string,
    formValues: EntityValues,
  ): FormContext<any> => {
    const form = useForm<EntityValues>({
      initialValues: formValues,
    });
    addForm(key, form);
    return form;
  };

  const discardEditForForm = async (key: string) => {
    const form = getForm(key);
    if (!form) {
      console.error(`Unable to discard, no form with key: ${key}`);
      return;
    }

    const cleanInitialValues = JSON.parse(
      JSON.stringify(form.meta.initialValues),
    );

    await nextTick();

    form.resetForm(
      {
        values: cleanInitialValues,
        touched: {},
        errors: {},
      },
      { force: true },
    );
  };

  const addForm = (key: string, form: FormContext<any>) => {
    forms.value[key] = form;
  };

  const getForm = (key: string | undefined): FormContext<any> | undefined => {
    if (!key) return undefined;
    const form = forms.value[key];
    if (!form) {
      return undefined;
    }
    return form;
  };

  const getForms = (): { [key: string]: FormContext<any> } => {
    return forms.value;
  };

  const deleteForm = (key: string): boolean => {
    try {
      delete forms.value[key];
      return true;
    } catch {
      console.warn(`Form with key, ${key} does not exist. Deletion aborted`);
      return false;
    }
  };

  const deleteForms = () => {
    forms.value = {};
  };

  const __isNotEmpty = (str: any) => str.trim() !== "";

  const formContainsValues = (key: string) => {
    const form = forms.value[key];
    if (!form) return false;
    const values = Object.values(form.values.intialValues || {});
    return values.some(__isNotEmpty);
  };

  const getKeyBasedOnInputField = (metadataItem: PanelMetaData): string => {
    if (!metadataItem.inputField?.fieldKeyToSave) return metadataItem.key;
    return metadataItem.inputField.fieldKeyToSave;
  };

  const getEditableMetadataKeys = (
    columnList: Record<string, any>,
    formId: string,
  ): string[] => {
    const keyArray: string[] = [];
    const panelMetadataItems = findPanelMetadata(columnList);

    panelMetadataItems.forEach((metadataItem: PanelMetaData) => {
      if (!metadataItem.inputField || keyArray.includes(metadataItem.key))
        return;
      if (
        metadataItem.inputField.relationType &&
        !metadataItem.inputField.isMetadataField
      )
        return;
      keyArray.push(getKeyBasedOnInputField(metadataItem));
    });
    editableFields.value[formId] = keyArray;
    return keyArray;
  };

  const addEditableMetadataKeys = (keys: string[], formId: string): void => {
    const currentKeys = editableFields.value[formId] || [];
    const newKeys = keys.filter((k) => !currentKeys.includes(k));
    if (newKeys.length === 0) return;
    editableFields.value[formId] = [...currentKeys, ...newKeys];
  };

  const route = useRoute();

  const getFormByRouteId = () => {
    const id = route.params.id as string;
    const form = getForm(id);
    return { id, form };
  };

  const getTeaserMetadataInState = (id: string): [] => {
    return teaserMetadataSaved.value[id];
  };

  const deleteTeaserMetadataItemInState = (id: string) => {
    delete teaserMetadataSaved.value[id];
  };

  const addTeaserMetadataToState = (id: string, teaserMetadata: object) => {
    teaserMetadataSaved.value[id] = teaserMetadata;
  };

  const addRelations = (
    selectedItems: InBulkProcessableItem[],
    relationType: string,
    formId: string | undefined = undefined,
    keepExisted: boolean = false,
  ) => {
    const form: FormContext<any> | undefined = formId
      ? getForm(formId)
      : getFormByRouteId().form;
    if (!form) return;

    const relationsToSet: BaseRelationValuesInput[] = [];
    if (keepExisted) {
      const existingRelations = form.values.relationValues[relationType];
      const currentRelations = Array.isArray(existingRelations)
        ? existingRelations.filter(
            (relation: BaseRelationValuesInput) =>
              !relation.editStatus || relation.editStatus !== EditStatus.New,
          )
        : [];
      relationsToSet.push(...currentRelations);
    }
    selectedItems.forEach((item) => {
      addTeaserMetadataToState(item.id, item.teaserMetadata);
      relationsToSet.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        metadata: item.metadata ? item.metadata : undefined,
        value: item.value,
      });
    });

    form.setFieldValue(`relationValues.${relationType}`, relationsToSet);
  };

  const addMappedRelations = (
    relations: BaseRelationValuesInput[],
    relationType: string,
    formId: string | undefined = undefined,
  ) => {
    const form: FormContext<any> | undefined = formId
      ? getForm(formId)
      : getFormByRouteId().form;
    if (!form) return;

    form.setFieldValue(`relationValues.${relationType}`, relations);
  };

  const replaceRelationsFromSameType = (
    selectedItems: InBulkProcessableItem[],
    relationType: string,
    formId: string | undefined = undefined,
  ) => {
    const form: FormContext<any> | undefined = formId
      ? getForm(formId)
      : getFormByRouteId().form;
    if (!form) return;
    const relationIds: string[] = selectedItems.map(
      (item: InBulkProcessableItem) => item.id,
    );
    // TODO: Find something better to unref this
    const relationValues = JSON.parse(
      JSON.stringify(form.values.relationValues),
    );

    const existingRelations = relationValues[relationType];
    const relationsToDelete: BaseRelationValuesInput[] = Array.isArray(
      existingRelations,
    )
      ? existingRelations.filter(
          (relation: BaseRelationValuesInput) =>
            !relationIds.includes(relation.key),
        )
      : [];

    const relationsToSet: BaseRelationValuesInput[] = [];
    selectedItems.forEach((item) => {
      relationsToSet.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        value: item.value,
        metadata: item.metadata ? item.metadata : undefined,
      });
    });

    if (relationsToDelete)
      relationsToDelete.forEach((relation: BaseRelationValuesInput) => {
        relationsToSet.push({
          key: relation.key,
          type: relation.type,
          editStatus: EditStatus.Deleted,
          value: relation.value,
        });
      });

    form.setFieldValue(`relationValues.${relationType}`, relationsToSet);
  };

  const findRelation = (
    key: string,
    type: string,
    parentEntityId: string,
  ):
    | { idx: number; relation: BaseRelationValuesInput }
    | "no-relation-found" => {
    const form = getForm(parentEntityId);
    const relations = form?.values?.relationValues;

    if (!relations) return "no-relation-found";

    let idx: number | "no-idx" = "no-idx";
    const relationsWithSameType = relations[type];
    if (!Array.isArray(relationsWithSameType)) return "no-relation-found";
    const relation = relationsWithSameType?.find(
      (relation: BaseRelationValuesInput, index: number) => {
        if (relation.key === key) {
          idx = index;
          return true;
        }
      },
    );

    return idx === "no-idx" ? "no-relation-found" : { relation, idx };
  };

  const getRelationsBasedOnType = (
    parentEntityId: string,
    type: string,
  ): BaseRelationValuesInput[] | [] => {
    const form = getForm(parentEntityId);
    if (!form || !form.values.relationValues) return [];
    return form.values.relationValues[type];
  };

  const extractMetadataValue = (value: unknown): unknown => {
    if (typeof value === "boolean") return value;
    if (value && typeof value === "object" && (value as any).formatter)
      return (value as any).label ?? "";
    return value;
  };

  const parseIntialValuesForFormSubmit = (
    intialValues: IntialValues,
    entityId: string,
    locale?: string,
    fields?: Record<string, PanelMetaData>,
  ): MetadataValuesInput[] => {
    if (!config) {
      console.warn(
        "useFormHelper: parseIntialValuesForFormSubmit called without config context.",
      );
    }
    const metadata: any[] = [];
    Object.keys(intialValues)
      .filter((key) => key !== "__typename")
      .forEach((key) => {
        if (!editableFields.value[entityId]?.includes(key)) return;
        const normalizedMetadata: {
          key: string;
          value: unknown;
          lang?: string;
        } = {
          key,
          value: extractMetadataValue((intialValues as any)[key] ?? ""),
        };
        const isEnabledMultilanguage =
          config?.features?.supportsMultilingualMetadataEditing;
        if (isEnabledMultilanguage && fields?.[key]?.isMultilingual) {
          const storedTranslations = getMultilingualTranslations(entityId, key);
          if (storedTranslations?.length) {
            for (const translation of storedTranslations) {
              metadata.push({
                key: translation.key,
                value: translation.value,
                lang: translation.lang,
              });
            }
            return;
          }
          normalizedMetadata.lang = locale;
        }
        metadata.push(normalizedMetadata);
      });
    return metadata;
  };

  interface RelationValues {
    [key: string]: any;
  }

  const getAllRelations = (
    relationValues: RelationValues,
  ): BaseRelationValuesInput[] => {
    if (!relationValues) {
      return [];
    }
    return Object.values(relationValues)
      .flat()
      .filter((relation) => typeof relation === "object" && relation !== null)
      .map((relation) => JSON.parse(JSON.stringify(relation)));
  };

  const parseRelationValuesForFormSubmit = (relationValues: RelationValues) => {
    return getAllRelations(relationValues).flatMap((relation) => {
      if (relation.inheritFrom) {
        return [];
      }
      return {
        ...relation,
        editStatus: relation.editStatus || EditStatus.Unchanged,
      };
    });
  };

  const parseInheritedRelationValuesFromFormSubmit = async (
    relationValues: RelationValues,
  ) => {
    if (!relationValues) return [];

    const { extractInheritedValue } = useInheritedRelations();
    const allRelations = getAllRelations(relationValues);
    const originalRelationsList = Object.values(relationValues).flat();

    const processedPromises = allRelations.map(async (relation) => {
      if (!relation.inheritFrom) {
        return [];
      }

      const extractedValue = await extractInheritedValue({
        ...relation.inheritFrom,
        relations: originalRelationsList,
      });

      if (!extractedValue) {
        return [];
      }

      const { inheritFrom, ...rest } = relation;

      return {
        ...rest,
        key: extractedValue,
        value: extractedValue,
      };
    });

    const nestedResults = await Promise.all(processedPromises);
    return nestedResults.flat();
  };

  const __linkedEntityId = (key: string) => {
    return key.slice(key.indexOf("-") + 1, key.length);
  };
  const __fieldKeyWithoutId = (key: string) => {
    return key.slice(0, key.indexOf("-"));
  };

  const parseRelationMetadataForFormSubmit = (
    relationMetadata: IntialValues,
    relations: BaseRelationValuesInput[],
    entityId: string,
  ): BaseRelationValuesInput[] => {
    const editableRelationMetadataItems = Object.entries(
      relationMetadata,
    ).filter((entry) => !editableFields.value[entityId].includes(entry.key));

    editableRelationMetadataItems.forEach((entry) => {
      const fieldKey: string = __fieldKeyWithoutId(entry[0]);
      const fieldValue: any = entry[1];

      const id = __linkedEntityId(entry[0]);
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        if (relation.key === id) {
          if (!relation.metadata || !Array.isArray(relation.metadata))
            relation.metadata = [];
          const existingField = relation.metadata.find(
            (metadataItem: any) => metadataItem.key === fieldKey,
          );
          if (existingField) {
            existingField.value = fieldValue;
          } else {
            relation.metadata.push({ key: fieldKey, value: fieldValue });
          }

          if (relation.editStatus !== EditStatus.Deleted)
            relation.editStatus = EditStatus.Changed;
        }
      }
    });
    return relations;
  };

  const parseRelationRootDataForFormSubmit = (
    relationRootdata: IntialValues,
    relations: BaseRelationValuesInput[],
    entityId: string,
  ): BaseRelationValuesInput[] => {
    const editableRelationRootdataItems = Object.entries(
      relationRootdata,
    ).filter((entry) => !editableFields.value[entityId].includes(entry.key));

    editableRelationRootdataItems.forEach((entry) => {
      const fieldKey: string = __fieldKeyWithoutId(entry[0]);
      const fieldValue: any = entry[1];

      const id = __linkedEntityId(entry[0]);
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        if (relation.key === id) {
          relation[fieldKey] = fieldValue;
          if (relation.editStatus !== EditStatus.Deleted)
            relation.editStatus = EditStatus.Changed;
        }
      }
    });
    return relations;
  };

  const parseMetadataWithRepeatableValues = (
    metadata: MetadataValuesInput[],
    repeatableMetadataValues: any,
  ): MetadataValuesInput[] => {
    Object.keys(repeatableMetadataValues).forEach((panelKey: string) => {
      const associatedMetadataItemIndex: number = metadata.findIndex(
        (metadataItem: MetadataValuesInput) => metadataItem.key === panelKey,
      );
      if (!associatedMetadataItemIndex || associatedMetadataItemIndex === -1)
        return;
      metadata[associatedMetadataItemIndex].value = [
        ...Object.values(repeatableMetadataValues[panelKey]),
      ];
    });

    return metadata;
  };

  const extractMainValuesFromEntityValues = (
    values: EntityValues,
  ): EntityValues & { repeatableMetadataValues: any } => {
    const { "repeatable-panels": repeatableMetadataValues, ...cleanedInitial } =
      values.intialValues as Record<string, any>;

    return {
      intialValues: cleanedInitial as IntialValues,
      relationValues: values.relationValues,
      relationMetadata: values.relationMetadata,
      relationRootdata: values.relationRootdata,
      repeatableMetadataValues: repeatableMetadataValues,
    };
  };

  const parseFormValuesToFormInput = (
    uuid: string,
    values: EntityValues,
    updateOnlyRelations = false,
    locale?: string,
    fields?: Record<string, PanelMetaData>,
  ) => {
    let metadata: MetadataValuesInput[] = [];
    let relations: BaseRelationValuesInput[] = [];

    const {
      intialValues,
      relationValues,
      relationMetadata,
      relationRootdata,
      repeatableMetadataValues,
    } = extractMainValuesFromEntityValues(values);

    if (intialValues)
      metadata = parseIntialValuesForFormSubmit(
        intialValues,
        uuid,
        locale,
        fields,
      );

    if (relationValues)
      relations = parseRelationValuesForFormSubmit(relationValues);

    if (relationMetadata && relations)
      relations = parseRelationMetadataForFormSubmit(
        relationMetadata,
        relations,
        uuid,
      );
    if (relationRootdata && relations)
      relations = parseRelationRootDataForFormSubmit(
        relationRootdata,
        relations,
        uuid,
      );

    if (repeatableMetadataValues && metadata)
      metadata = parseMetadataWithRepeatableValues(
        metadata,
        repeatableMetadataValues,
      );

    return { metadata, relations, updateOnlyRelations };
  };

  const emptyValueForField = (field: any, currentValue: unknown): unknown => {
    if (Array.isArray(currentValue)) return [];
    return String(field?.inputField?.type ?? "")
      .toLowerCase()
      .includes("multiselect")
      ? []
      : "";
  };

  const processClearedKeys = (
    clearedKeys: string[],
    fieldByKey: Map<string, any>,
    allowedKeys: string[],
    intialValues: any,
  ) => {
    const clearedMetadata: MetadataValuesInput[] = [];
    const relationTypesToClear: string[] = [];
    const clearedRelationTypes = new Set<string>();

    clearedKeys.forEach((key) => {
      const field = fieldByKey.get(key);
      const relationType = field?.inputField?.relationType;

      if (relationType) {
        clearedRelationTypes.add(relationType);
        relationTypesToClear.push(relationType);
        return;
      }

      if (!allowedKeys.includes(key)) return;

      clearedMetadata.push({
        key,
        value: emptyValueForField(field, (intialValues as any)?.[key]),
      });
    });

    return { clearedMetadata, relationTypesToClear, clearedRelationTypes };
  };

  const buildBulkEditPayload = (
    values: EntityValues,
    {
      formId,
      isFieldDirty,
      relationMode = BulkEditModes.Add,
      fields = [],
      clearedKeys = [],
    }: {
      formId: string;
      isFieldDirty: (path: string) => boolean;
      relationMode?: BulkEditModes;
      fields?: PanelMetaData[];
      clearedKeys?: string[];
    },
  ): BulkEditPayload => {
    const relationsToAdd: BaseRelationValuesInput[] = [];
    const relationsToRemove: BaseRelationValuesInput[] = [];
    const relationsToReplace: BaseRelationValuesInput[] = [];

    const allowedKeys = editableFields.value[formId] ?? [];
    const { intialValues, relationValues } =
      extractMainValuesFromEntityValues(values);

    const fieldByKey = new Map<string, any>(
      fields.map((field: any) => [field.key, field]),
    );

    const { clearedMetadata, relationTypesToClear, clearedRelationTypes } =
      processClearedKeys(clearedKeys, fieldByKey, allowedKeys, intialValues);

    const metadata: MetadataValuesInput[] = [...clearedMetadata];

    Object.entries(intialValues ?? {}).forEach(([key, value]) => {
      if (key === "__typename") return;
      if (!allowedKeys.includes(key)) return;
      if (clearedKeys.includes(key)) return;
      if (value === undefined || value === null) return;
      if (!isFieldDirty(`intialValues.${key}`)) return;

      metadata.push({ key, value: extractMetadataValue(value) });
    });

    const targetMapping: { [key: string]: BaseRelationValuesInput[] } = {
      [BulkEditModes.Remove]: relationsToRemove,
      [BulkEditModes.Add]: relationsToAdd,
      [BulkEditModes.Replace]: relationsToReplace,
    };

    const target: BaseRelationValuesInput[] = targetMapping[relationMode];

    Object.entries(relationValues ?? {}).forEach(
      ([relationType, relations]) => {
        if (!Array.isArray(relations)) return;
        if (clearedRelationTypes.has(relationType)) return;

        const picked = relations.filter(
          (relation: any) =>
            relation &&
            relation.editStatus !== EditStatus.Deleted &&
            relation.key,
        );

        if (picked.length === 0) return;

        picked.forEach((relation: any) =>
          target.push({
            ...relation,
            editStatus:
              relationMode === BulkEditModes.Remove
                ? EditStatus.Deleted
                : EditStatus.New,
          }),
        );
      },
    );

    return {
      metadata,
      relationsToAdd,
      relationsToRemove,
      relationsToReplace,
      relationTypesToClear,
      hasChanges:
        metadata.length > 0 ||
        relationsToAdd.length > 0 ||
        relationsToRemove.length > 0 ||
        relationsToReplace.length > 0 ||
        relationTypesToClear.length > 0,
    };
  };

  const setMultilingualTranslations = (
    formId: string,
    fieldKey: string,
    translations: { key: string; value: unknown; lang: string }[],
  ) => {
    if (!multilingualTranslations.value[formId]) {
      multilingualTranslations.value[formId] = {};
    }
    multilingualTranslations.value[formId][fieldKey] = translations;
  };

  const getMultilingualTranslations = (
    formId: string,
    fieldKey: string,
  ): { key: string; value: unknown; lang: string }[] | undefined => {
    return multilingualTranslations.value[formId]?.[fieldKey];
  };

  const getBulkEditRelationMode = (formId: string): BulkEditModes =>
    bulkEditRelationModes.value[formId] ?? BulkEditModes.Add;

  const setBulkEditRelationMode = (
    formId: string,
    mode: BulkEditModes,
  ): void => {
    bulkEditRelationModes.value[formId] = mode;
  };

  const clearBulkEditFormState = (formId: string): void => {
    delete bulkEditRelationModes.value[formId];
    delete bulkEditClearedFields.value[formId];
    delete editableFields.value[formId];
  };

  const getBulkEditClearedFields = (formId: string): string[] =>
    bulkEditClearedFields.value[formId] ?? [];

  const toggleBulkEditClearedField = (formId: string, key: string): void => {
    const cleared = getBulkEditClearedFields(formId);
    bulkEditClearedFields.value[formId] = cleared.includes(key)
      ? cleared.filter((clearedKey) => clearedKey !== key)
      : [...cleared, key];
  };

  return {
    createForm,
    addForm,
    getForm,
    getFormByRouteId,
    getForms,
    deleteForm,
    deleteForms,
    forms,
    getEditableMetadataKeys,
    getKeyBasedOnInputField,
    addEditableMetadataKeys,
    editableFields,
    createEntityValues,
    formContainsValues,
    discardEditForForm,
    addRelations,
    addMappedRelations,
    replaceRelationsFromSameType,
    findRelation,
    getRelationsBasedOnType,
    getTeaserMetadataInState,
    deleteTeaserMetadataItemInState,
    parseFormValuesToFormInput,
    buildBulkEditPayload,
    getBulkEditRelationMode,
    setBulkEditRelationMode,
    clearBulkEditFormState,
    getBulkEditClearedFields,
    toggleBulkEditClearedField,
    parseIntialValuesForFormSubmit,
    parseRelationValuesForFormSubmit,
    parseRelationMetadataForFormSubmit,
    parseInheritedRelationValuesFromFormSubmit,
    setMultilingualTranslations,
    getMultilingualTranslations,
  };
};

export { useFormHelper };
