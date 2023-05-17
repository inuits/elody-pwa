<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-11/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full h-[95%]">
        <div class="basis-[60%]"></div>
        <div class="grow"></div>
      </div>
      <div class="basis-full h-[5%]"></div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useAvailableModals } from "@/composables/useAvailableModals";

const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.BulkOperations);
</script>
