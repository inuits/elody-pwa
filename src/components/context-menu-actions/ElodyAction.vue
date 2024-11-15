<template>
  <base-context-menu-item
    @clicked="doAction()"
    :label="$t(label)"
    :icon="Unicons[icon].name"
    :disable="isDisabled"
    :tooltipLabel="
      isDisabled ? 'tooltip.bulkOperationsActionBar.readmode' : undefined
    "
  />
</template>

<script setup lang="ts">
import {
  EditStatus,
  ContextMenuElodyActionEnum,
  type DeleteDataMutation,
  DeleteDataDocument,
  Entitytyping,
  Collection
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useFieldArray } from "vee-validate";
import useEditMode, { type callback } from "@/composables/useEdit";
import { inject, computed } from "vue";
import { useShareLink } from "@/composables/useShareLink";
import { DefaultApolloClient, useMutation } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { Context, useBulkOperations } from "@/composables/useBulkOperations";
import { getChildrenOfHomeRoutes } from "@/helpers";

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

const { update } = useFieldArray(
  `relationValues.${props.relation?.relation?.type}`
);
const { save, disableEditMode, addSaveCallback, clearSaveCallbacks, isEdit } =
  useEditMode();
const { dequeueItemForBulkProcessing } = useBulkOperations();

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const submitForm: callback = inject("submitForm") as callback;
const apolloClient = inject(DefaultApolloClient);
const { createShareLink } = useShareLink(apolloClient as ApolloClient<any>);
const config: any = inject("config");

const isDisabled = computed(() => {
  return isEdit.value &&
    (
      props.action === ContextMenuElodyActionEnum.DeleteRelation ||
      props.action === ContextMenuElodyActionEnum.DeleteEntity
    );
});

const childRoutes = getChildrenOfHomeRoutes(config).map(
  (route: any) => route.meta
);

const deleteRelation = async () => {
  dequeueItemForBulkProcessing(props.bulkOperationsContext, props.relation.relation.key);
  if (props.relation !== "no-relation-found")
    update(props.relation.idx, {
      ...props.relation.relation,
      editStatus: EditStatus.Deleted,
    });
  await save();
  disableEditMode();
};

const addSaveHandler = () => {
  clearSaveCallbacks();
  addSaveCallback(submitForm, "first");
};

const deleteEntity = async () => {
  let collection;
  if (props.entityType.toLowerCase() === Entitytyping.Mediafile) {
    collection = Collection.Mediafiles;
  } else {
    collection = childRoutes.find(
      (route: any) => route.entityType === props.entityType
    ).type;
  }

  try {
    await mutate({ id: props.entityId, path: collection, deleteMediafiles: false });
    await props.refetchEntities();
  } catch (e) {
    console.log(e);
  }
}

const doAction = () => {
  if (props.action === ContextMenuElodyActionEnum.DeleteRelation) {
    addSaveHandler();
    deleteRelation();
  }
  if (props.action === ContextMenuElodyActionEnum.DeleteEntity) {
    deleteEntity();
  }
  if (props.action === ContextMenuElodyActionEnum.Share) {
    createShareLink();
  }
};
</script>
