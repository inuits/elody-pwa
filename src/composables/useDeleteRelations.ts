import {
  Collection,
  EditStatus,
  TypeModals,
  type BaseRelationValuesInput,
  type Entity,
  MutateEntityValuesDocument,
} from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEditMode } from "@/composables/useEdit";
import type { FormContext } from "vee-validate";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import {
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { apolloClient } from "@/main";
import { inject, type Ref } from "vue";

type SelectedItem = { key: string } | InBulkProcessableItem;

export function useDeleteRelations() {
  const {
    findRelation,
    getRelationsBasedOnType,
    getForm,
    parseFormValuesToFormInput,
  } = useFormHelper();
  const { closeModal } = useBaseModal();
  const { displaySuccessNotification } = useBaseNotification();
  const { dequeueItemForBulkProcessing } = useBulkOperations();
  const libraryEntities = inject<Ref<Entity[]>>("libraryEntities");

  const deleteRelationDirect = async (
    entity: Entity,
    relationType: string,
    itemKey: string,
  ) => {
    const currentRelations: BaseRelationValuesInput[] = ((
      entity.relationValues as Record<string, any>
    )?.[relationType] ?? []) as BaseRelationValuesInput[];

    const updated = currentRelations.map((r) =>
      r.key === itemKey
        ? { ...r, editStatus: EditStatus.Deleted }
        : { ...r, editStatus: EditStatus.Unchanged },
    );

    await apolloClient.mutate({
      mutation: MutateEntityValuesDocument,
      variables: {
        id: entity.id,
        formInput: { metadata: [], relations: updated },
        collection: Collection.Entities,
      },
    });
  };

  const deleteRelations = async (
    entityId: string,
    relationType: string,
    selectedItems: SelectedItem[],
    context: Context,
    saveImmediately: boolean = true,
    libraryEntityId?: string,
  ) => {
    const { save } = useEditMode(entityId);
    const form = getForm(entityId) as FormContext;
    if (!form) return;

    let relations: BaseRelationValuesInput[] = getRelationsBasedOnType(
      entityId,
      relationType,
    );
    const directDeletions: Promise<void>[] = [];

    selectedItems.forEach((item) => {
      const itemKey = "key" in item ? item.key : item.id;
      const relation = findRelation(itemKey, relationType, entityId);

      const relatedEntity = libraryEntities?.value.find(
        (e) => e.id === (libraryEntityId ?? itemKey),
      );
      if (relatedEntity) {
        const relationValues = (relatedEntity.relationValues ?? {}) as Record<string, any[]>;
        const inverseRelationType = Object.keys(relationValues).find((type) =>
          relationValues[type]?.some((r: any) => r.key === entityId),
        );
        if (inverseRelationType) {
          directDeletions.push(
            deleteRelationDirect(relatedEntity, inverseRelationType, entityId),
          );
        }
      }

      if (relation !== "no-relation-found") {
        relations = relations.filter((relation) => relation.key !== itemKey);
        relations.push({
          ...relation.relation,
          editStatus: EditStatus.Deleted,
        });
      }
      dequeueItemForBulkProcessing(context, itemKey);
    });

    form.setFieldValue(`relationValues.${relationType}`, relations);
    if (saveImmediately) await save(true);
    await Promise.all(directDeletions);
  };

  const submit = async (
    entityId: string,
    collection: Collection,
    modalType?: TypeModals,
  ) => {
    const { disableEdit } = useEditMode(entityId);
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

    displaySuccessNotification(
      "notifications.success.entityUpdated.title",
      "notifications.success.entityUpdated.description",
    );

    disableEdit();
  };

  return {
    deleteRelations,
    deleteRelationDirect,
    submit,
  };
}
