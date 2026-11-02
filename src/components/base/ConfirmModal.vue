<template>
  <BaseModal
    :modal-type="TypeModals.Confirm"
    :title="pendingConfirm?.options.title"
    modal-height-style="my-[37.5vh]"
    @hide-modal="resolveConfirm('cancel')"
  >
    <slot />
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import { TypeModals } from "@/generated-types/queries";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { pendingConfirm, resolveConfirm } = useConfirmModal();
</script>
