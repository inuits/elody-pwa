import {
  EditStatus,
  TypeModals,
  type BaseRelationValuesInput,
  type Entity,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import useEditMode from "@/composables/useEdit";
import type { Collection } from "@/generated-types/queries";
import { MutateEntityValuesDocument } from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import {
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";

type SelectedItem = { key: string } | InBulkProcessableItem;

export function useDeleteRelations() {
  const {
    findRelation,
    getRelationsBasedOnType,
    getForm,
    parseFormValuesToFormInput,
  } = useFormHelper();
  const { save, disableEditMode } = useEditMode();
  const { closeModal } = useBaseModal();
  const { createNotification } = useNotification();
  const { dequeueItemForBulkProcessing } = useBulkOperations();

  const deleteRelations = async (
    entityId: string,
    relationType: string,
    selectedItems: SelectedItem[],
    context: Context,
    saveImmediately: boolean = true,
  ) => {
    const form = getForm(entityId) as FormContext;
    if (!form) return;

    let relations: BaseRelationValuesInput[] = getRelationsBasedOnType(
      entityId,
      relationType,
    );
    selectedItems.forEach((item) => {
      const itemKey = "key" in item ? item.key : item.id;
      const relation = findRelation(itemKey, relationType, entityId);
      if (relation !== "no-relation-found") {
        relations = relations.filter((relation) => relation.key !== itemKey);
        relations.push({
          ...relation.relation,
          editStatus: EditStatus.Deleted,
        });
        dequeueItemForBulkProcessing(context, itemKey);
      }
    });

    form.setFieldValue(`relationValues.${relationType}`, relations);
    if (saveImmediately) await save(true);
  };

  const submit = async (
    entityId: string,
    collection: Collection,
    modalType?: TypeModals,
  ) => {
    const form = getForm(entityId) as FormContext;
    if (!form) return;

    const result = await apolloClient.mutate({
      mutation: MutateEntityValuesDocument,
      variables: {
        id: entityId,
        formInput: parseFormValuesToFormInput(entityId, form.values, true),
        collection,
      },
    });

    if (!result?.data?.mutateEntityValues) return;

    const mutatedEntity = result.data.mutateEntityValues as Entity;
    const updatedRelationValues = { ...mutatedEntity.relationValues };
    Object.keys(form.values.relationValues).forEach((key) => {
      if (!(key in mutatedEntity.relationValues)) {
        updatedRelationValues[key] = [];
      }
    });

    form.resetForm({
      values: {
        intialValues: mutatedEntity.intialValues,
        relationValues: updatedRelationValues,
      },
    });

    if (modalType) closeModal(TypeModals.BulkOperationsDeleteRelations);

    createNotification({
      displayTime: 10,
      type: NotificationType.default,
      title: "notifications.success.entityUpdated.title",
      description: "notifications.success.entityUpdated.description",
      shown: true,
    });

    disableEditMode();
  };

  return {
    deleteRelations,
    submit,
  };
}
