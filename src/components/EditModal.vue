<template>
  <div
    v-if="isEdit"
    class="flex justify-center fixed bottom-0 w-[calc(100%-6rem)] p-5 z-20"
  >
    <BulkOperationsSubmitBar
      :button-label="$t('bulk-operations.save')"
      :button-icon="DamsIcons.Save"
      :show-delete-button="isEditToggleVisible === 'edit-delete'"
      :disabled="showErrors"
      @submit="
        async () => {
          clickButton();
          await save();
          await getTenants();
        }
      "
      @cancel="openDiscardModal()"
      @close="openDiscardModal()"
      @delete="openDeleteModal()"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import { DamsIcons, TypeModals } from "@/generated-types/queries";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { inject } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";

const { isEdit, save, discard, showErrors, clickButton, isEditToggleVisible } =
  useEditMode();
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();
const { discardEditForForm } = useFormHelper();
const config: any = inject("config");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);

const openDiscardModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        discard();
        const id = inject("entityFormData")?.id;
        discardEditForForm(id);
        closeModal(TypeModals.Confirm);
      },
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "discard-edit",
    openImmediately: true,
  });
};
</script>
