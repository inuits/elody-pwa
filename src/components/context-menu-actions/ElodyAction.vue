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
  Collection,
  TypeModals,
  type Entity,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  MutateEntityValuesDocument,
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useFieldArray } from "vee-validate";
import useEditMode from "@/composables/useEdit";
import { inject, computed } from "vue";
import { useShareLink } from "@/composables/useShareLink";
import { DefaultApolloClient, useMutation } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { Context, useBulkOperations } from "@/composables/useBulkOperations";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseModal } from "@/composables/useBaseModal";
import { type EntityValues, useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import { useSubmitForm } from "vee-validate";
import type { FormContext } from "vee-validate";

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
  `relationValues.${props.relation?.relation?.type}`,
);
const { save, disableEditMode, addSaveCallback, clearSaveCallbacks, isEdit } =
  useEditMode();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();
const { t } = useI18n();
const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const entityFormData: {
  id: string;
  values: EntityValues;
  collection: Collection;
  setEntityFormValues: Function;
  resetEntityForm: Function;
} = inject("entityFormData") as {
  id: string;
  values: EntityValues;
  collection: Collection;
  setEntityFormValues: Function;
  resetEntityForm: Function;
};
const apolloClient = inject(DefaultApolloClient);
const { createShareLink } = useShareLink(apolloClient as ApolloClient<any>);
const config: any = inject("config");
const { getForm } = useFormHelper();
const { parseFormValuesToFormInput } = useFormHelper();
const { createNotification } = useNotification();

const { mutate: mutateEntityValues } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

const isDisabled = computed(() => {
  return (
    isEdit.value &&
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
  if (props.relation !== "no-relation-found")
    update(props.relation.idx, {
      ...props.relation.relation,
      editStatus: EditStatus.Deleted,
    });

  await save();
  disableEditMode();
};

const submit = useSubmitForm<EntityValues>(async () => {
  const form = getForm(entityFormData.id) as FormContext;
  if (!entityFormData.collection)
    throw Error("Could not determine collection for submit");

  const result = await mutateEntityValues({
    id: entityFormData.id,
    formInput: parseFormValuesToFormInput(
      entityFormData.id,
      form?.values,
      true,
    ),
    collection: entityFormData.collection,
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

  createNotification({
    displayTime: 10,
    type: NotificationType.default,
    title: t("notifications.success.entityUpdated.title"),
    description: t("notifications.success.entityUpdated.description"),
    shown: true,
  });

  disableEditMode();
});

const addSaveHandler = () => {
  clearSaveCallbacks();
  addSaveCallback(submit, "first");
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
  } catch (e) {
    console.log(e);
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
    addSaveHandler();
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
