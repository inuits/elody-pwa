<template>
  <BaseModal ref="modal" :modal-state="modal.modalState.value.state" modal-position="right" modal-width-style="w-11/12"
    @hide-modal="modal.closeModal()">
    <AssetMediaFileLibrary v-if="modal.modalState.value.state === 'Show'" />
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "./base/BaseModal.vue";
import AssetMediaFileLibrary from "./AssetMediaFileLibrary.vue";
import { TypeModals } from "@/generated-types/queries";
import { useAvailableModals } from "@/composables/useAvailableModals";

const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.SimpleSearch);

</script>