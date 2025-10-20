<template>
  <div
    v-if="editModeHelper.isEdit"
    class="flex justify-center fixed bottom-0 w-[calc(100%-6rem)] p-5 z-edit-modal"
  >
    <BulkOperationsSubmitBar
      :button-label="$t('bulk-operations.save')"
      tooltip-label="save"
      :button-icon="DamsIcons.Save"
      :show-delete-button="editModeHelper.editMode === 'edit-delete'"
      :disabled="editModeHelper.showErrors"
      @submit="
        async () => {
          editModeHelper.clickButton();
          await editModeHelper.save();
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

const props = withDefaults(
  defineProps<{
    entityId: string;
  }>(),
  {},
);

const editModeHelper = useEditMode(props.entityId);
const { initializeConfirmModal } = useConfirmModal();
const { closeModal } = useBaseModal();
const { discardEditForForm } = useFormHelper();
const config: any = inject("config");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);

const openDiscardModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        editModeHelper.discard();
        discardEditForForm(props.entityId);
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
