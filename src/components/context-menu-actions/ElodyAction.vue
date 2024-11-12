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
} from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useFieldArray } from "vee-validate";
import useEditMode, { type callback } from "@/composables/useEdit";
import { inject, computed } from "vue";
import { useShareLink } from "@/composables/useShareLink";
import { DefaultApolloClient } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";

const props = defineProps<{
  label: String;
  icon: String;
  action: ContextMenuElodyActionEnum;
  entityId: String;
  relation?:
    | { idx: number; relation: object }
    | "no-relation-found"
    | undefined;
}>();

const { update } = useFieldArray(
  `relationValues.${props.relation?.relation?.type}`
);
const { save, disableEditMode, addSaveCallback, clearSaveCallbacks, isEdit } =
  useEditMode();
const submitForm: callback = inject("submitForm") as callback;
const apolloClient = inject(DefaultApolloClient);
const { createShareLink } = useShareLink(apolloClient as ApolloClient<any>);

const deleteRelation = async () => {
  if (props.relation !== "no-relation-found")
    update(props.relation.idx, {
      ...props.relation.relation,
      editStatus: EditStatus.Deleted,
    });
  await save();
  disableEditMode();
};

const isDisabled = computed(() => {
  return isEdit.value && props.action === ContextMenuElodyActionEnum.Delete;
});

const addSaveHandler = () => {
  clearSaveCallbacks();
  addSaveCallback(submitForm, "first");
};

const doAction = () => {
  if (props.action === ContextMenuElodyActionEnum.Delete) {
    addSaveHandler();
    deleteRelation();
  }
  if (props.action === ContextMenuElodyActionEnum.Share) {
    createShareLink();
  }
};
</script>
