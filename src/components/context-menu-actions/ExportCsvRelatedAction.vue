<template>
  <base-context-menu-item
    @clicked="openExportModal"
    :label="$t(label)"
    :icon="Unicons[icon].name"
  />
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import {
  BulkOperationTypes,
  ModalStyle,
  TypeModals,
} from "@/queryLoader";

const props = defineProps<{
  label: string;
  icon: string;
  entityId: string;
  entityType: string;
  parentRelation: string;
}>();

const { openModal } = useBaseModal();
const { initializeGeneralProperties } = useModalActions();

const openExportModal = () => {
  initializeGeneralProperties(
    props.entityId,
    props.parentRelation,
    undefined as any,
    [],
    BulkOperationTypes.ExportCsv,
  );
  openModal(
    TypeModals.BulkOperations,
    ModalStyle.CenterWide,
    undefined,
    undefined,
    false,
    undefined,
    { relatedExportEntityType: props.entityType },
  );
};
</script>
