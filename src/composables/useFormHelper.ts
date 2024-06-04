import {
  type BaseRelationValuesInput,
  EditStatus,
  type IntialValues,
  type MetadataValuesInput,
  type PanelMetaData,
} from "@/generated-types/queries";
import { findPanelMetadata } from "@/helpers";
import { defineRule, type FormContext, useForm } from "vee-validate";
import { ref } from "vue";
import { useRoute } from "vue-router";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { all } from "@vee-validate/rules";

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
  const createEntityValues = (
    intialValueFields: PanelMetaData[]
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
    formValues: EntityValues
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

  const recreateForm = (
    key: string,
    newFormValues: EntityValues
  ): FormContext<any> => {
    deleteForm(key);
    return createForm(key, newFormValues);
  };

  const defineValidationRules = () => {
    Object.entries(all).forEach(([name, rule]) => {
      defineRule(name, rule);
    });

    defineRule("has_required_relation", getHasSpecificRelationRule);
  };

  const getHasSpecificRelationRule = (
    value: BaseRelationValuesInput[],
    parameters: string[]
  ): boolean => {
    if (!Array.isArray(value)) {
      return false;
    }

    const relations = value.filter(
      (relation: BaseRelationValuesInput) =>
        relation.editStatus !== EditStatus.Deleted
    );
    const [relationType, amount = 1] = parameters[0].split(":");
    const specificRelationsLength =
      relations.filter(
        (relation: BaseRelationValuesInput) => relation.type === relationType
      )?.length || 0;

    return specificRelationsLength >= Number(amount);
  };

  const __isNotEmpty = (str: any) => str.trim() !== "";

  const formContainsValues = (key: string) => {
    const form = forms.value[key];
    if (!form) return false;
    const values = Object.values(form.values.intialValues || {});
    return values.some(__isNotEmpty);
  };

  const getEditableMetadataKeys = (
    columnList: Record<string, any>,
    formId: string
  ): string[] => {
    const keyArray: string[] = [];
    const panelMetadataItems = findPanelMetadata(columnList);

    panelMetadataItems.forEach((metadataItem: PanelMetaData) => {
      if (!metadataItem.inputField || keyArray.includes(metadataItem.key))
        return;
      keyArray.push(metadataItem.key);
    });
    editableFields.value[formId] = keyArray;
    return keyArray;
  };

  const addEditableMetadataOnRelationKey = (
    key: string,
    formId: string
  ): void => {
    editableFields.value[formId]?.push(key);
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
    formId: string | undefined = undefined
  ) => {
    const form: FormContext<any> | undefined = formId
      ? getForm(formId)
      : getFormByRouteId().form;
    if (!form) return;

    const relationsToSet: BaseRelationValuesInput[] = [];
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
    formId: string | undefined = undefined
  ) => {
    const form: FormContext<any> | undefined = formId
      ? getForm(formId)
      : getFormByRouteId().form;
    if (!form) return;
    const relationIds: string[] = selectedItems.map(
      (item: InBulkProcessableItem) => item.id
    );
    // TODO: Find something better to unref this
    const relationValues = JSON.parse(
      JSON.stringify(form.values.relationValues)
    );

    const relationsToDelete: BaseRelationValuesInput[] = relationValues[
      relationType
    ]?.filter(
      (relation: BaseRelationValuesInput) => !relationIds.includes(relation.key)
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
    parentEntityId: string
  ):
    | { idx: number; relation: BaseRelationValuesInput }
    | "no-relation-found" => {
    const form = getForm(parentEntityId);
    if (!form || !form.values.relationValues) return "no-relation-found";
    let idx: number | "no-idx" = "no-idx";
    const relationsWithSameType = form.values.relationValues[type];
    const relation = relationsWithSameType.find(
      (relation: BaseRelationValuesInput, index: number) => {
        if (relation.key === key) {
          idx = index;
          return true;
        }
      }
    );

    return idx === "no-idx" ? "no-relation-found" : { relation, idx };
  };

  const parseIntialValuesForFormSubmit = (
    intialValues: IntialValues,
    entityId: string
  ): MetadataValuesInput[] => {
    const metadata: any[] = [];
    Object.keys(intialValues)
      .filter((key) => key !== "__typename")
      .forEach((key) => {
        if (!editableFields.value[entityId]?.includes(key)) return;
        metadata.push({ key, value: (intialValues as any)[key] || "" });
      });
    return metadata;
  };

  const parseRelationValuesForFormSubmit = (relationValues: {
    [key: string]: any;
  }): BaseRelationValuesInput[] => {
    const relations: any[] = [];
    Object.keys(relationValues).forEach((relationType: string) => {
      const typedRelations: BaseRelationValuesInput[] =
        relationValues[relationType];
      if (!Array.isArray(typedRelations)) return;

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
    entityId: string
  ): BaseRelationValuesInput[] => {
    const editableRelationMetadataItems = Object.entries(
      relationMetadata
    ).filter((entry) => !editableFields.value[entityId].includes(entry.key));

    editableRelationMetadataItems.forEach((entry) => {
      const fieldKey: string = __fieldKeyWithoutId(entry[0]);
      const fieldValue: any = entry[1];

      const id = __linkedEntityId(entry[0]);
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        if (relation.key === id) {
          if (!relation.metadata) relation.metadata = [];
          const existingField = relation.metadata.find(
            (metadataItem: any) => metadataItem.key === fieldKey
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

  return {
    createForm,
    addForm,
    getForm,
    getForms,
    deleteForm,
    deleteForms,
    forms,
    getEditableMetadataKeys,
    addEditableMetadataOnRelationKey,
    editableFields,
    createEntityValues,
    formContainsValues,
    defineValidationRules,
    discardEditForForm,
    addRelations,
    replaceRelationsFromSameType,
    recreateForm,
    findRelation,
    getTeaserMetadataInState,
    deleteTeaserMetadataItemInState,
    parseIntialValuesForFormSubmit,
    parseRelationValuesForFormSubmit,
    parseRelationMetadataForFormSubmit,
  };
};

export { useFormHelper };
