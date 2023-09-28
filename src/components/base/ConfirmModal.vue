<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Confirm).state"
    :modal-position="modalPosition"
    modal-width-style="w-1/2"
    modal-height-style="my-[37.5vh]"
    @hide-modal="closeModal(TypeModals.Confirm)"
  >
    <slot />
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { computed } from "vue";

const { closeModal, getModalInfo, modals } = useBaseModal();

const modalPosition = computed(
  () => modals.value[TypeModals.Confirm].modalPosition
);
</script>
