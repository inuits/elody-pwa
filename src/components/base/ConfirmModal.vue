<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="center"
    modal-width-style="w-1/3"
    modal-height-style="h-[15vh] my-[37.5vh]"
    @hide-modal="modal.closeModal()"
  >
    <slot />
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useAvailableModals } from "@/composables/useAvailableModals";

const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.Confirm);
</script>
