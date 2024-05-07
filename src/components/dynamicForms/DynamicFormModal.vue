<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.DynamicForm).state"
    :modal-position="getModalInfo(TypeModals.DynamicForm).modalPosition"
    modal-width-style="w-2/5"
    :modal-color="
      getModalInfo(TypeModals.DynamicForm).formQuery === 'GetUploadForm'
        ? 'bg-neutral-lightest'
        : 'bg-neutral-white'
    "
    @hide-modal="closeModal(TypeModals.DynamicForm)"
  >
    <dynamic-form
      v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
      :key="getModalInfo(TypeModals.DynamicForm).formQuery"
      :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
      :saved-context="getModalInfo(TypeModals.DynamicForm).savedContext"
      :router="useRouter()"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalState, TypeModals } from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useRouter } from "vue-router";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { onMounted } from "vue";

const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();

onMounted(() => {
  initializeConfirmModal(
    () => {
      changeCloseConfirmation(TypeModals.DynamicForm, false);
      closeModal(TypeModals.DynamicForm);
    },
    undefined,
    () => closeModal(TypeModals.Confirm),
    "discard-modal"
  );
});
</script>

<style scoped></style>
