<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.DynamicForm).state"
    :modal-position="getModalInfo(TypeModals.DynamicForm).modalPosition"
    modal-width-style="w-2/5"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.DynamicForm)"
  >
    <dynamic-form
      :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { TypeModals } from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const { closeModal, getModalInfo } = useBaseModal();
</script>

<style scoped></style>
