<template>
  <BaseModal
    :modal-type="openedModalType"
    @hide-modal="handleCloseModal"
  >
    <BulkOperationsExportCsv v-if="isCsvExportModal" />
    <BulkOperationsDeleteEntities v-if="isDeleteEntitiesModal" />
    <BulkOperationsDeleteRelations v-if="isDeleteRelationsModal" />
    <BulkOperationsEditModal v-if="isBulkEditModal" />
    <BulkOperationsMergeModal v-if="isMergeModal" />
  </BaseModal>
</template>

<script lang="ts" setup>
import { TypeModals } from "@/generated-types/queries";
import BulkOperationsExportCsv from "./BulkOperationsExportCsv.vue";
import BulkOperationsDeleteEntities from "./BulkOperationsDeleteEntities.vue";
import BulkOperationsDeleteRelations from "./BulkOperationsDeleteRelations.vue";
import BulkOperationsEditModal from "./BulkOperationsEditModal.vue";
import BulkOperationsMergeModal from "./BulkOperationsMergeModal.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useI18n } from "vue-i18n";
const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { confirm } = useConfirmModal();
const { t } = useI18n();

const handleCloseModal = async () => {
  const modalType = openedModalType.value;
  if (getModalInfo(modalType).closeConfirmation) {
    const choice = await confirm({
      title: t("confirm.discard-modal.title"),
      message: t("confirm.discard-modal.message"),
      confirmLabel: t("confirm.discard-modal.confirm"),
      cancelLabel: t("confirm.discard-modal.cancel"),
    });
    if (choice !== "confirm") return;
    changeCloseConfirmation(modalType, false);
  }
  closeModal(modalType);
};

const isCsvExportModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperations).open;
});

const isDeleteEntitiesModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteEntities).open;
});

const isDeleteRelationsModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteRelations).open;
});

const isBulkEditModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsEdit).open;
});

const isMergeModal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsMerge).open;
});

const openedModalType = computed(() => {
  if (isCsvExportModal.value) return TypeModals.BulkOperations;
  if (isDeleteEntitiesModal.value)
    return TypeModals.BulkOperationsDeleteEntities;
  if (isBulkEditModal.value) return TypeModals.BulkOperationsEdit;
  if (isMergeModal.value) return TypeModals.BulkOperationsMerge;
  return TypeModals.BulkOperationsDeleteRelations;
});
</script>
