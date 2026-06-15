<template>
  <base-context-menu-item
    @clicked="doAction"
    :label="$t(label, [entityTypeLabel])"
    :icon="Unicons[icon].name"
    :disable="isDisabled"
    :tooltipLabel="
      isDisabled ? 'tooltip.bulkOperationsActionBar.readmode' : undefined
    "
    :as-button="asButton"
    @click.prevent
  />
</template>

<script setup lang="ts">
import {
  ContextMenuElodyActionEnum,
  type DeleteDataMutation,
  DeleteDataDocument,
  Entitytyping,
  type Entity,
  Collection,
  TypeModals,
  ModalStyle,
  ContextMenuFormFlow,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useEditMode } from "@/composables/useEdit";
import { inject, computed, type Ref } from "vue";
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
import { useImport } from "@/composables/useImport";
import { typeUrlMapping } from "@/main";

const props = defineProps<{
  label: string;
  icon: string;
  action: ContextMenuElodyActionEnum;
  entityType: Entitytyping;
  entityId: string;
  parentEntityId: string;
  formQuery?: string;
  typeModal?: TypeModals;
  formFlow?: ContextMenuFormFlow;
  formTitle?: string;
  relation?:
    | { idx: number; relation: object }
    | "no-relation-found"
    | undefined;
  bulkOperationsContext: Context | undefined;
  refetchEntities: () => any;
  asButton?: boolean;
}>();

const { deleteRelations, submit } = useDeleteRelations();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { confirm } = useConfirmModal();
const { displaySuccessNotification } = useBaseNotification();
const { openModal } = useBaseModal();
const { t } = useI18n();
const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const { loadDocument } = useImport();
const entityFormData: {
  id: string;
  collection: Collection;
  type: string;
} = inject("entityFormData") as {
  id: string;
  collection: Collection;
  type: string;
};
const useEditHelper = useEditMode(entityFormData?.id);
const apolloClient = inject(DefaultApolloClient);
const { createShareLink } = useShareLink(apolloClient as ApolloClient<any>);
const config: any = inject("config");
const refetchParentEntity: any = inject("RefetchParentEntity");
const libraryEntities = inject<Ref<Entity[]>>("libraryEntities");

const resolvedRelationType = computed<string | undefined>(() => {
  if (props.relation && props.relation !== "no-relation-found")
    return (props.relation.relation as any).type;
  const libraryEntity = libraryEntities?.value?.find(
    (e) => e.id === props.entityId,
  );
  if (!libraryEntity) return undefined;
  const relationValues = (libraryEntity.relationValues ?? {}) as Record<
    string,
    any[]
  >;
  return Object.keys(relationValues).find((type) =>
    relationValues[type]?.some((r: any) => r.key === entityFormData?.id),
  );
});

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

const mediaTypes = [
  Entitytyping.Mediafile?.toLowerCase(),
  Entitytyping.MediaFileEntity?.toLowerCase(),
].filter((type) => type !== undefined);

const deleteRelation = async () => {
  if (!resolvedRelationType.value) await props.refetchEntities();
  if (!resolvedRelationType.value) return;

  const hasRelation = props.relation && props.relation !== "no-relation-found";

  if (hasRelation) {
    dequeueItemForBulkProcessing(
      props.bulkOperationsContext,
      (props.relation as { idx: number; relation: any }).relation.key,
    );
  }

  await deleteRelations(
    entityFormData.id,
    resolvedRelationType.value,
    hasRelation
      ? [(props.relation as { idx: number; relation: any }).relation]
      : [{ key: props.entityId }],
    props.bulkOperationsContext,
    true,
    props.entityId,
  );
  await refetchParentEntity();
  await props.refetchEntities();
};

const deleteEntity = async () => {
  dequeueItemForBulkProcessing(
    props.bulkOperationsContext,
    props.relation.relation?.key,
  );

  const mappedEntityType =
    typeUrlMapping?.reverseMapping?.[props.entityType] ?? props.entityType;
  const isMediaType = mediaTypes.includes(mappedEntityType.toLowerCase());
  const collection = isMediaType
    ? Collection.Mediafiles
    : childRoutes.find((route) => route.entityType === props.entityType)?.type;

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
  const choice = await confirm({
    title: t("confirm.delete-entity.title"),
    message: t("confirm.delete-entity.message"),
    confirmLabel: t("confirm.delete-entity.confirm"),
    cancelLabel: t("confirm.delete-entity.cancel"),
  });
  if (choice !== "confirm") return;
  await deleteEntity();
};

const downloadQueryResult = async () => {
  if (!props.formQuery) return;
  const document = await loadDocument(props.formQuery);
  const result = await (apolloClient as ApolloClient<any>).query({
    query: document,
    variables: { id: props.parentEntityId },
    fetchPolicy: "no-cache",
  });
  const data = Object.values(result.data)[0];
  downloadResponse(data);
};

const downloadResponse = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.formQuery}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const doAction = async () => {
  if (props.action === ContextMenuElodyActionEnum.DownloadQueryResult) {
    await downloadQueryResult();
  }

  if (props.action === ContextMenuElodyActionEnum.DeleteRelation) {
    useEditHelper.setSubmitFunction(() =>
      submit(entityFormData.id, entityFormData.collection),
    );
    deleteRelation();
  }
  if (props.action === ContextMenuElodyActionEnum.UpdateMetadata) {
    openModal(
      TypeModals.EntityEditModal,
      ModalStyle.CenterWide,
      props.formQuery,
      undefined,
      undefined,
      undefined,
      {
        entityId: props.entityId || entityFormData.id,
        entityType:
          props.entityType || entityFormData.type || Entitytyping.BaseEntity,
        flow: props.formFlow,
        title: props.formTitle,
        // relation context: lets the modal edit metadata ON the relation
        // (e.g. dynamic processor config) instead of the entity itself
        parentEntityId: props.parentEntityId,
        relationType: resolvedRelationType.value,
        relationKey: props.entityId,
        relationMetadata:
          props.relation && props.relation !== "no-relation-found"
            ? (props.relation.relation as any).metadata
            : undefined,
        callback: () => {
          if (refetchParentEntity) {
            refetchParentEntity();
          } else {
            props.refetchEntities();
          }
        },
      },
    );
  }
  if (props.action === ContextMenuElodyActionEnum.DeleteEntity) {
    openDeleteEntityConfirmation();
  }
  if (props.action === ContextMenuElodyActionEnum.Share) {
    createShareLink();
  }

  if (
    props.action === ContextMenuElodyActionEnum.CreateEntityFromExternalSource
  ) {
    if (props.typeModal === TypeModals.GuidedFlow) {
      openModal(
        TypeModals.GuidedFlow,
        ModalStyle.CenterWide,
        props.formQuery,
        undefined,
        true,
      );
    } else {
      openModal(
        TypeModals.DynamicForm,
        ModalStyle.CenterWide,
        props.formQuery,
        undefined,
        undefined,
        undefined,
      );
    }
  }
};
</script>
