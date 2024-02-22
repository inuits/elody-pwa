import {
  type BaseRelationValuesInput,
  EditStatus,
  type IntialValues,
  type PanelMetaData,
  type RelationValues,
} from "@/generated-types/queries";
import { findPanelMetadata } from "@/helpers";
import { defineRule, type FormContext, useField, useForm } from "vee-validate";
import { ref } from "vue";
import { useRoute } from "vue-router";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import * as AllRules from "@vee-validate/rules";

const forms = ref<{ [key: string]: FormContext<any> }>({});
const editableFields = ref<{ [key: string]: string[] }>({});
const teaserMetadataSaved = ref<{ [key: string]: object }>({});

export type EntityValues = {
  intialValues?: IntialValues;
  relationValues?: RelationValues;
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
      relationValues: { label: "", relations: [] },
    };
  };

  const createForm = (
    key: string,
    formValues: EntityValues
  ): FormContext<any> => {
    // if (forms.value[key]) {
    //   const form = forms.value[key];
    //   form.values = formValues;
    //   return form;
    // }
    const form = useForm<EntityValues>({
      initialValues: formValues,
    });
    // formValues.relationValues?.relations &&  form.setFieldValue("relationValues.relations", [
    //   ...formValues.relationValues?.relations
    // ]);
    const { resetField } = useField("relationValues.relations");
    formValues.relationValues?.relations &&
      resetField({ value: formValues.relationValues?.relations });
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

  const deleteForm = (key: string) => {
    delete forms.value[key];
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
    Object.keys(AllRules).forEach((rule: string) => {
      defineRule(rule, AllRules[rule]);
    });
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
    editableFields.value[formId].push(key);
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
    relationType: string
  ) => {
    const { form } = getFormByRouteId();

    if (selectedItems.length <= 0 || !form) return;

    const oldRelations: BaseRelationValuesInput[] =
      form.values.relationValues.relations;
    const newRelations: BaseRelationValuesInput[] = [];
    selectedItems.forEach((item) => {
      addTeaserMetadataToState(item.id, item.teaserMetadata);
      newRelations.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        value: item.value,
      });
    });

    form.setFieldValue("relationValues.relations", [
      ...oldRelations,
      ...newRelations,
    ]);
  };

  const replaceRelationsFromSameType = (
    selectedItems: InBulkProcessableItem[],
    relationType: string
  ) => {
    const { form } = getFormByRouteId();

    const newRelationIds: string[] = selectedItems.map(
      (item: InBulkProcessableItem) => item.id
    );

    const otherRelations: BaseRelationValuesInput[] =
      form.values.relationValues.relations.filter(
        (relation: BaseRelationValuesInput) => relation.type !== relationType
      );
    const relationsToDelete: BaseRelationValuesInput[] =
      form.values.relationValues.relations.filter(
        (relation: BaseRelationValuesInput) =>
          relation.type === relationType &&
          !newRelationIds.includes(relation.key)
      );
    const newRelations: BaseRelationValuesInput[] = [];
    selectedItems.forEach((item) => {
      newRelations.push({
        key: item.id,
        type: relationType,
        editStatus: EditStatus.New,
        value: item.value,
      });
    });

    relationsToDelete.forEach((relation: BaseRelationValuesInput) => {
      newRelations.push({
        key: relation.key,
        type: relation.type,
        editStatus: EditStatus.Deleted,
        value: relation.value,
      });
    });

    form.setFieldValue("relationValues.relations", [
      ...otherRelations,
      ...newRelations,
    ]);
  };

  const findRelation = (
    key: string,
    type: string
  ):
    | { idx: number; relation: BaseRelationValuesInput }
    | "no-relation-found" => {
    const { form } = getFormByRouteId();
    if (!form || form.values.relationValues?.relations <= 0)
      return "no-relation-found";
    let idx: number | "no-idx" = "no-idx";
    const relation = form.values.relationValues?.relations?.find(
      (relation: BaseRelationValuesInput, index: number) => {
        if (relation.key === key && relation.type === type) {
          idx = index;
          return true;
        }
      }
    );

    return idx === "no-idx" ? "no-relation-found" : { relation, idx };
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
  };
};

export { useFormHelper };
