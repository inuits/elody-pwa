<template>
  <base-context-menu-item
    @clicked="doAction()"
    :label="$t(label, [entityTypeLabel])"
    :icon="Unicons[icon].name"
    :disable="isDisabled"
    :tooltipLabel="
      isDisabled ? 'tooltip.bulkOperationsActionBar.readmode' : undefined
    "
  />
</template>

<script setup lang="ts">
import {
  ContextMenuElodyActionEnum,
  type DeleteDataMutation,
  DeleteDataDocument,
  Entitytyping,
  Collection,
  TypeModals,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useEditMode } from "@/composables/useEdit";
import { inject, computed } from "vue";
import { useShareLink } from "@/composables/useShareLink";
import { DefaultApolloClient, useMutation } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import {
  type Context,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { useDeleteRelations } from "@/composables/useDeleteRelations";
import { useBaseNotification } from "@/composables/useBaseNotification";

const props = defineProps<{
  label: String;
  icon: String;
  action: ContextMenuElodyActionEnum;
  entityType: Entitytyping;
  entityId: String;
  relation?:
    | { idx: number; relation: object }
    | "no-relation-found"
    | undefined;
  bulkOperationsContext: Context;
  refetchEntities: Function;
}>();

const { deleteRelations, submit } = useDeleteRelations();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { initializeConfirmModal } = useConfirmModal();
const { displaySuccessNotification } = useBaseNotification();
const { closeModal } = useBaseModal();
const { t } = useI18n();
const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const entityFormData: {
  id: string;
  collection: Collection;
} = inject("entityFormData") as {
  id: string;
  collection: Collection;
};
const useEditHelper = useEditMode(entityFormData.id);
const apolloClient = inject(DefaultApolloClient);
const { createShareLink } = useShareLink(apolloClient as ApolloClient<any>);
const config: any = inject("config");

const entityTypeLabel = computed(() =>
  t(`entity-translations.singular.${props.entityType}`),
);
const isDisabled = computed(() => {
  return (
    useEditHelper.isEdit.value &&
    (props.action === ContextMenuElodyActionEnum.DeleteRelation ||
      props.action === ContextMenuElodyActionEnum.DeleteEntity)
  );
});

const childRoutes = getChildrenOfHomeRoutes(config).map(
  (route: any) => route.meta,
);

const deleteRelation = async () => {
  dequeueItemForBulkProcessing(
    props.bulkOperationsContext,
    props.relation.relation.key,
  );

  await deleteRelations(
    entityFormData.id,
    props.relation?.relation?.type,
    [props.relation.relation],
    props.bulkOperationsContext,
  );
  await props.refetchEntities();
};

const deleteEntity = async () => {
  dequeueItemForBulkProcessing(
    props.bulkOperationsContext,
    props.relation.relation.key,
  );
  let collection;
  if (props.entityType.toLowerCase() === Entitytyping.Mediafile) {
    collection = Collection.Mediafiles;
  } else {
    collection = childRoutes.find(
      (route: any) => route.entityType === props.entityType,
    ).type;
  }

  try {
    await mutate({
      id: props.entityId,
      path: collection,
      deleteMediafiles: false,
    });
    await props.refetchEntities();
    displaySuccessNotification(
      "notifications.success.entityDeleted.title",
      "notifications.success.entityDeleted.description",
    );
  } catch (e) {
    console.log(e);
    displaySuccessNotification(
      "notifications.errors.entityDeleted.title",
      "notifications.errors.entityDeleted.description",
    );
  }
};

const openDeleteEntityConfirmation = async () => {
  initializeConfirmModal({
    confirmButton: { buttonCallback: deleteEntity },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "delete-entity",
    openImmediately: true,
  });
};

const doAction = () => {
  if (props.action === ContextMenuElodyActionEnum.DeleteRelation) {
    useEditHelper.setSubmitFunction(() =>
      submit(entityFormData.id, entityFormData.collection),
    );
    deleteRelation();
  }
  if (props.action === ContextMenuElodyActionEnum.DeleteEntity) {
    openDeleteEntityConfirmation();
  }
  if (props.action === ContextMenuElodyActionEnum.Share) {
    createShareLink();
  }
};
</script>
