<template>
  <div class="p-8 flex flex-col w-full h-full">
    <div>
      <div class="w-full mb-2">
        <h1 class="title flex justify-center">
          {{ t("confirm.delete-relations.title") }}
        </h1>
      </div>
      <div>
        <div class="pt-4">
          {{ t("confirm.delete-relations.message") }}
        </div>
      </div>
    </div>
    <div class="flex justify-between mt-4">
      <div>
        <BaseButton
          :label="t('confirm.delete-relations.confirm')"
          :icon="DamsIcons.Trash"
          button-style="danger"
          button-size="sm"
          :loading="isDeleting"
          @click="deleteSelectedRelations"
        />
      </div>

      <div>
        <BaseButton
          :label="t('confirm.delete-relations.cancel')"
          button-style="secondary"
          button-size="sm"
          :disabled="isDeleting"
          @click="closeModal(TypeModals.BulkOperationsDeleteRelations)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import {
  TypeModals,
  type Collection,
  DamsIcons,
} from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type Context,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import { useEditMode } from "@/composables/useEdit";
import { useDeleteRelations } from "@/composables/useDeleteRelations";
import { useAsyncAction } from "@/composables/useAsyncAction";
import { useBaseNotification } from "@/composables/useBaseNotification";

const { t } = useI18n();
const { displayErrorNotification } = useBaseNotification();
const { isBusy: isDeleting, run } = useAsyncAction();
const { getEnqueuedItems } = useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getRelationType, getParentId, getCollection, getCallbackFunctions } =
  useModalActions();
const useEditHelper = useEditMode(getParentId());

const { deleteRelations, submit } = useDeleteRelations();

const modal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteRelations);
});

const getSelectedItems = () => {
  const context = modal.value.context as Context;
  return getEnqueuedItems(context);
};

const deleteSelectedRelations = () =>
  run(async () => {
    useEditHelper.setSubmitFunction(() =>
      submit(
        getParentId() as string,
        getCollection() as Collection,
        TypeModals.BulkOperationsDeleteRelations,
      ),
    );
    try {
      await deleteRelations(
        getParentId() as string,
        getRelationType() as string,
        getSelectedItems(),
        modal.value.context as Context,
      );
      const callbackFunctions = getCallbackFunctions() || [];
      for (const callback of callbackFunctions) {
        if (callback) await callback();
      }
    } catch (error) {
      console.error("Error deleting selected relations:", error);
      closeModal(TypeModals.BulkOperationsDeleteRelations);
      displayErrorNotification(
        t("notifications.errors.entityDeleted.title"),
        t("notifications.errors.entityDeleted.description"),
      );
    }
  });
</script>

<style scoped></style>
