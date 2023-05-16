<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-5/12"
    @hide-modal="modal.closeModal()"
  >
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useAvailableModals } from "@/composables/useAvailableModals";

const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.BulkOperations);
</script>
