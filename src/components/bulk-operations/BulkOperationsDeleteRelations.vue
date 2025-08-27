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
        <BaseButtonNew
          :label="t('confirm.delete-relations.confirm')"
          :icon="DamsIcons.Trash"
          button-style="redDefault"
          button-size="small"
          @click="deleteSelectedRelations"
        />
      </div>

      <div>
        <BaseButtonNew
          :label="t('confirm.delete-relations.cancel')"
          button-style="default"
          button-size="small"
          @click="closeModal(TypeModals.BulkOperationsDeleteRelations)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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

const { t } = useI18n();
const { getEnqueuedItems } = useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getRelationType, getParentId, getCollection, getCallbackFunctions } = useModalActions();
const useEditHelper = useEditMode(getParentId());

const { deleteRelations, submit } = useDeleteRelations();

const modal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteRelations);
});

const getSelectedItems = () => {
  const context = modal.value.context as Context;
  return getEnqueuedItems(context);
};

const deleteSelectedRelations = async () => {
  useEditHelper.setSubmitFunction(() =>
    submit(
      getParentId() as string,
      getCollection() as Collection,
      TypeModals.BulkOperationsDeleteRelations,
    ),
  );
  deleteRelations(
    getParentId() as string,
    getRelationType() as string,
    getSelectedItems(),
    modal.value.context as Context,
  );
  const callbackFunctions = getCallbackFunctions() || [];
  for (const callback of callbackFunctions) {
    if (callback) await callback();
  }
};
</script>

<style scoped></style>
