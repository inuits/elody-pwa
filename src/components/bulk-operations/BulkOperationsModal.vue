<template>
  <BaseModal
    :modal-type="openedModalType"
    @hide-modal="closeModal(openedModalType)"
  >
    <BulkOperationsExportCsv v-if="isCsvExportModal" />
    <BulkOperationsDeleteEntities v-if="isDeleteEntitiesModal" />
    <BulkOperationsDeleteRelations v-if="isDeleteRelationsModal" />
  </BaseModal>
</template>

<script lang="ts" setup>
import { TypeModals } from "@/generated-types/queries";
import BulkOperationsExportCsv from "./BulkOperationsExportCsv.vue";
import BulkOperationsDeleteEntities from "./BulkOperationsDeleteEntities.vue";
import BulkOperationsDeleteRelations from "./BulkOperationsDeleteRelations.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
const { closeModal, getModalInfo } = useBaseModal();

const isCsvExportModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperations).open;
});

const isDeleteEntitiesModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteEntities).open;
});

const isDeleteRelationsModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteRelations).open;
});

const openedModalType = computed(() => {
  if (isCsvExportModal.value) return TypeModals.BulkOperations;
  if (isDeleteEntitiesModal.value)
    return TypeModals.BulkOperationsDeleteEntities;
  return TypeModals.BulkOperationsDeleteRelations;
});
</script>
