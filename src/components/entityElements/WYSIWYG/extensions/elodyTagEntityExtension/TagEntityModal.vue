<template>
  <BaseModal
    :modal-type="TypeModals.ElodyEntityTaggingModal"
    :cancel-button-availabe="true"
    @hide-modal="closeModal(TypeModals.ElodyEntityTaggingModal)"
  >
    <p>Hey!</p>
  </BaseModal>
</template>

<script setup lang="ts">
import { TypeModals } from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";

const { closeModal } = useBaseModal();
</script>

<style scoped></style>
