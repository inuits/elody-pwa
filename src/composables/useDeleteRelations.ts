import {
  EditStatus,
  TypeModals,
  type BaseRelationValuesInput,
  type Entity,
  MutateEntityValuesDocument,
  Collection,
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
import { useModalActions } from "@/composables/useModalActions";
import { apolloClient } from "@/main";
import {
  mutateEntityRelations,
  findInverseRelationType,
} from "@/composables/useRelationMutation";

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
  const { getLibraryEntities } = useModalActions();

  const deleteRelationDirect = async (
    entity: Entity,
    relationType: string,
    itemKey: string,
  ) => {
    await mutateEntityRelations(entity, relationType, (relation) => ({
      ...relation,
      editStatus: relation.key === itemKey ? EditStatus.Deleted : EditStatus.Unchanged,
    }));
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

    const libraryEntities = getLibraryEntities();
    let relations: BaseRelationValuesInput[] = getRelationsBasedOnType(
      entityId,
      relationType,
    );
    const directDeletions: Promise<void>[] = [];
    let hasOwnSideChange = false;

    selectedItems.forEach((item) => {
      const itemKey = "key" in item ? item.key : item.id;
      const relation = findRelation(itemKey, relationType, entityId);

      const relatedEntity = libraryEntities?.value.find(
        (entity) => entity.id === (libraryEntityId ?? itemKey),
      );
      if (relatedEntity) {
        const inverseRelationType = findInverseRelationType(relatedEntity, entityId);
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
        hasOwnSideChange = true;
      }
      dequeueItemForBulkProcessing(context, itemKey);
    });

    if (libraryEntities?.value) {
      const deletedKeys = new Set(selectedItems.map((item) => ("key" in item ? item.key : item.id)));
      libraryEntities.value = libraryEntities.value.filter((e) => !deletedKeys.has(e.id));
    }

    // Only this entity's own relation array changed if the relation actually lived here;
    // when it only lived on the other side (deleted above via deleteRelationDirect),
    // saving here is a redundant, concurrent no-op mutation against the same entities
    // the backend's own relation-sync hook is touching, and races it.
    if (hasOwnSideChange) {
      form.setFieldValue(`relationValues.${relationType}`, relations);
      if (saveImmediately) await save(true);
    }
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

    if (modalType) closeModal(TypeModals.BulkOperationsDeleteRelations);

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
