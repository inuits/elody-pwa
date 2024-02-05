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
import { useI18n } from "vue-i18n";
import useEditMode from "@/composables/useEdit";
const { t } = useI18n();
const { update } = useFieldArray("relationValues.relations");
const { save, disableEditMode } = useEditMode();

const props = defineProps<{
  label: String;
  icon: String
  action: ContextMenuElodyActionEnum;
  entityId: String;
  relation: object;
}>();

const deleteRelation = async () => {
  if (props.relation !== "no-relation-found") {
    update(props.relation.idx, {
      ...props.relation.relation,
      editStatus: EditStatus.Deleted,
    });
  }
  await save();
  disableEditMode();
};

const doAction = () => {
  if (props.action === ContextMenuElodyActionEnum.Delete) deleteRelation();
};
</script>
