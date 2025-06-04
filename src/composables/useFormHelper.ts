import {
  type BaseRelationValuesInput,
  EditStatus,
  ValidationRules,
  type IntialValues,
  type MetadataValuesInput,
  type PanelMetaData,
} from "@/generated-types/queries";
import { findPanelMetadata } from "@/helpers";
import { defineRule, type FormContext, useForm } from "vee-validate";
import { ref, inject } from "vue";
import { useRoute } from "vue-router";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { all } from "@vee-validate/rules";
import { DateTime } from "luxon";

const forms = ref<{ [key: string]: FormContext<any> }>({});
const editableFields = ref<{ [key: string]: string[] }>({});
const teaserMetadataSaved = ref<{ [key: string]: object }>({});

export type EntityValues = {
  intialValues?: IntialValues;
  relationValues?: { [key: string]: any };
  relationMetadata?: IntialValues | {};
  relatedEntityData?: IntialValues | {};
};

const useFormHelper = () => {
  const config = inject("config") as any;

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
      relatedEntityData: {},
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

  const discardEditForForm = (key: string) => {
    getForm(key)?.resetForm();
  };

  const addForm = (key: string, form: FormContext<any>) => {
    forms.value[key] = form;
  };

  const getForm = (key: string): FormContext<any> | undefined => {
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

  const defineValidationRules = () => {
    Object.entries(all).forEach(([name, rule]) => {
      defineRule(name, rule);
    });
    defineRule(ValidationRules.HasRequiredRelation, getHasSpecificRelationRule);
    defineRule(
      ValidationRules.HasOneOfRequiredRelations,
      getHasOneOfSpecificRelationsRule,
    );
    defineRule(
      ValidationRules.HasOneOfRequiredMetadata,
      getHasOneOfSpecificMetadataRule,
    );
    defineRule(ValidationRules.MaxDateToday, getMaxDateTodayRule);
    defineRule(ValidationRules.ExistingDate, mustBeExistingDateRule);
    defineRule(ValidationRules.Regex, regexValidator);
  };

  const getHasSpecificRelationRule = (
    value: BaseRelationValuesInput[],
    parameters: string[],
  ): boolean => {
    if (!Array.isArray(value)) {
      return false;
    }
    const relations = value.filter(
      (relation: BaseRelationValuesInput) =>
        relation.editStatus !== EditStatus.Deleted,
    );
    const [amount = 1, relationType, exact = false] = parameters[0].split(":");
    const specificRelationsLength =
      relations.filter(
        (relation: BaseRelationValuesInput) => relation.type === relationType,
      )?.length || 0;

    if (exact == "true") return specificRelationsLength == Number(amount);
    else return specificRelationsLength >= Number(amount);
  };

  const getHasOneOfSpecificRelationsRule = (
    value: BaseRelationValuesInput[],
    parameters: string[],
    ctx: any,
  ) => {
    if (!Array.isArray(value)) {
      return false;
    }
    const relationValues = ctx.form.relationValues;
    const [amount = 1, ...relationTypes] = parameters[0].split(":");
    let specificRelationsLength = 0;
    relationTypes.forEach(async (relationType: string) => {
      specificRelationsLength += relationValues[relationType]?.length || 0;
    });
    const isValid = specificRelationsLength >= Number(amount);
    if (isValid) {
      relationTypes.forEach((relationType) => {
        if (relationValues[relationType] === undefined)
          relationValues[relationType] = [];
      });
    }
    return isValid;
  };

  const getHasOneOfSpecificMetadataRule = (
    value: any,
    parameters: string[],
    ctx: any,
  ) => {
    const intialValues = ctx.form.intialValues;
    const [amount = 1, ...includedMetadataFields] = parameters[0].split(":");
    let filledInMetadataFields = 0;
    includedMetadataFields.forEach(async (metadataField: string) => {
      filledInMetadataFields += intialValues[metadataField]?.length ? 1 : 0;
    });
    return filledInMetadataFields >= Number(amount);
  };

  const getMaxDateTodayRule = (value: string): string | boolean => {
    if (!value) return true;

    const timestamp = new Date(value).getTime();
    const now = Date.now();
    if (now < timestamp) return "notifications.errors.future-date-error.title";
    return true;
  };

  const mustBeExistingDateRule = (value: string): boolean | string => {
    if (!value) return true;
    if (!DateTime.fromJSDate(new Date(value)).isValid)
      return "notifications.errors.construct-date-error.title";
    return true;
  };

  const getSingleParam = <TParam = unknown>(
    params: [TParam] | Record<string, TParam>,
    paramName: string,
  ) => {
    return Array.isArray(params) ? params[0] : params[paramName];
  };

  const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    return false;
  };

  const regexValidator = (
    value: unknown,
    params: [string | RegExp] | { regex: RegExp | string },
  ): boolean => {
    if (isEmpty(value)) {
      return true;
    }

    let regex = getSingleParam(params, "regex");
    if (typeof regex === "string") {
      regex = regex.replace(/\?\./g, "|");
      regex = new RegExp(regex);
    }

    if (Array.isArray(value)) {
      return value.every((val) => regexValidator(val, { regex }));
    }

    return regex.test(String(value));
  };

  const __isNotEmpty = (str: any) => str.trim() !== "";

  const formContainsValues = (key: string) => {
    const form = forms.value[key];
    if (!form) return false;
    const values = Object.values(form.values.intialValues || {});
    return values.some(__isNotEmpty);
  };

  const getKeyBasedOnInputField = (metadataItem: PanelMetaData) => {
    if (metadataItem.inputField.fieldKeyToSave != undefined)
      return metadataItem.inputField.fieldKeyToSave;
    return metadataItem.key;
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
      keyArray.push(getKeyBasedOnInputField(metadataItem));
    });
    editableFields.value[formId] = keyArray;
    return keyArray;
  };

  const addEditableMetadataKeys = (keys: string[], formId: string): void => {
    keys.forEach((key: string) => {
      editableFields.value[formId]?.push(key);
    });
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
      const currentRelations =
        form.values.relationValues[relationType]?.filter(
          (relation: BaseRelationValuesInput) =>
            !relation.editStatus || relation.editStatus !== EditStatus.New,
        ) || [];
      relationsToSet.push(...currentRelations);
    }
    selectedItems.forEach((item) => {
      addTeaserMetadataToState(item.id, item.teaserMetadata);
      relationsToSet.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        value: item.value,
      });
    });

    form.setFieldValue(`relationValues.${relationType}`, relationsToSet);
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

    const relationsToDelete: BaseRelationValuesInput[] = relationValues[
      relationType
    ]?.filter(
      (relation: BaseRelationValuesInput) =>
        !relationIds.includes(relation.key),
    );

    const relationsToSet: BaseRelationValuesInput[] = [];
    selectedItems.forEach((item) => {
      relationsToSet.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        value: item.value,
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
    if (!form || !form.values.relationValues) return "no-relation-found";
    let idx: number | "no-idx" = "no-idx";
    const relationsWithSameType = form.values.relationValues[type];
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

  const parseIntialValuesForFormSubmit = (
    intialValues: IntialValues,
    entityId: string,
    locale?: string,
    fields?: Record<string, PanelMetaData>,
  ): MetadataValuesInput[] => {
    const metadata: any[] = [];
    Object.keys(intialValues)
      .filter((key) => key !== "__typename")
      .forEach((key) => {
        if (!editableFields.value[entityId]?.includes(key)) return;
        const normalizedMetadata: {
          key: string;
          value: unknown;
          lang?: string;
        } = { key, value: (intialValues as any)[key] };
        const isEnabledMultilanguage =
          config.features.supportsMultilingualMetadataEditing;
        if (isEnabledMultilanguage && fields?.[key]?.isMultilingual) {
          normalizedMetadata.lang = locale;
        }
        metadata.push(normalizedMetadata);
      });
    return metadata;
  };

  const parseRelationValuesForFormSubmit = (relationValues: {
    [key: string]: any;
  }): BaseRelationValuesInput[] => {
    const relations: any[] = [];
    if (!relationValues) return [];
    Object.keys(relationValues).forEach((relationType: string) => {
      const typedRelations: BaseRelationValuesInput[] =
        relationValues[relationType];
      if (
        !Array.isArray(typedRelations) ||
        typeof typedRelations[0] !== "object"
      )
        return;

      typedRelations.forEach((relation: BaseRelationValuesInput) => {
        // TODO: Find something better to unref this
        relation = JSON.parse(JSON.stringify(relation));

        if (!relation.editStatus) relation.editStatus = EditStatus.Unchanged;
        relations.push(relation);
      });
    });
    return relations;
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

  const parseFormValuesToFormInput = (
    uuid: string,
    values: EntityValues,
    updateOnlyRelations = false,
    locale?: string,
    fields?: Record<string, PanelMetaData>,
  ) => {
    let metadata: MetadataValuesInput[] = [];
    let relations: BaseRelationValuesInput[] = [];

    if (values.intialValues)
      metadata = parseIntialValuesForFormSubmit(
        values.intialValues,
        uuid,
        locale,
        fields,
      );

    if (values.relationValues)
      relations = parseRelationValuesForFormSubmit(values.relationValues);

    if (values.relationMetadata && relations)
      relations = parseRelationMetadataForFormSubmit(
        values.relationMetadata,
        relations,
        uuid,
      );
    if (values.relationRootdata && relations)
      relations = parseRelationRootDataForFormSubmit(
        values.relationRootdata,
        relations,
        uuid,
      );

    return { metadata, relations, updateOnlyRelations };
  };

  return {
    createForm,
    addForm,
    getForm,
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
    defineValidationRules,
    discardEditForForm,
    addRelations,
    replaceRelationsFromSameType,
    findRelation,
    getRelationsBasedOnType,
    getTeaserMetadataInState,
    deleteTeaserMetadataItemInState,
    parseFormValuesToFormInput,
    parseIntialValuesForFormSubmit,
    parseRelationValuesForFormSubmit,
    parseRelationMetadataForFormSubmit,
  };
};

export { useFormHelper };
