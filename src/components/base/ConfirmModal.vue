<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Confirm).state"
    modal-position="center"
    modal-width-style="w-1/3"
    modal-height-style="h-[15vh] my-[37.5vh]"
    @hide-modal="closeModal(TypeModals.Confirm)"
  >
    <slot />
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const { createModal, closeModal, getModalInfo } = useBaseModal();
createModal(TypeModals.Confirm);
</script>
