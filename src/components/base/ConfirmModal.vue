<template>
  <BaseModal
    :modal-type="TypeModals.Confirm"
    :cancel-button-availabe="true"
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

const { closeModal } = useBaseModal();
</script>
