<template>
  <base-context-menu-item
    @clicked="doAction()"
    :label="$t(label)"
    :icon="Unicons[icon].name"
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
const { update } = useFieldArray("relationValues.relations");
const { save, disableEditMode, addSaveCallback, clearSaveCallbacks } =
  useEditMode();
import { inject } from "vue";

const props = defineProps<{
  label: String;
  icon: String;
  action: ContextMenuElodyActionEnum;
  entityId: String;
  relation: object;
}>();

const submitForm: callback = inject("submitForm") as callback;

const deleteRelation = async () => {
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

const doAction = () => {
  if (props.action === ContextMenuElodyActionEnum.Delete) {
    addSaveHandler();
    deleteRelation();
  }
};
</script>
