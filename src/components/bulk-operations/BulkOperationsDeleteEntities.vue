<template>
  <div class="p-8 flex flex-col w-full h-full">
    <div>
      <div class="w-full mb-2">
        <h1 class="title flex justify-center">
          {{ t("confirm.delete-entities.title") }}
        </h1>
      </div>
      <div>
        <div class="pt-4">
          {{ t(`confirm.delete-entities.message`) }}
        </div>
        <div v-if="form" class="pt-4">
          <div class="text-md flex">
            <p>{{ t(form.label) }}:</p>
          </div>
          <BaseInputCheckbox
            v-for="option in options"
            :key="option.key.value"
            v-model="option.isSelected"
            class="my-1"
            :label="t(option.key.label)"
            :item="{ id: option.key.value }"
            :context="BulkOperationsContextEnum.BulkOperationsCsvExport"
            :required="false"
            input-style="accentNormal"
          />
        </div>
      </div>
    </div>
    <div class="flex justify-between mt-4">
      <div>
        <BaseButtonNew
          :label="t('confirm.delete-entities.confirm')"
          :icon="DamsIcons.Trash"
          button-style="redDefault"
          button-size="small"
          @click="handleDelete"
        />
      </div>

      <div>
        <BaseButtonNew
          :label="t('confirm.delete-entities.cancel')"
          button-style="default"
          button-size="small"
          @click="closeModal(TypeModals.BulkOperationsDeleteEntities)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import { watch, computed, ref } from "vue";
import {
  DamsIcons,
  DropdownOption,
  TypeModals,
} from "@/generated-types/queries";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type Context,
  BulkOperationsContextEnum,
  InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import { useDeleteEntities } from "@/composables/useDeleteEntities";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";

const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { dequeueAllItemsForBulkProcessing, getEnqueuedItems } =
  useBulkOperations();
const { closeModal, getModalInfo } = useBaseModal();
const { getCallbackFunction } = useModalActions();
const { deleteEntities, getDeletionForm, form } = useDeleteEntities();

const modal = computed(() => {
  return getModalInfo(TypeModals.BulkOperationsDeleteEntities);
});

const options = ref<{ isSelected: boolean; key: DropdownOption }[]>([]);

const normalizeOptions = (
  options: DropdownOption[],
): { isSelected: boolean; key: DropdownOption }[] => {
  return options.map((item: DropdownOption) => ({
    isSelected: false,
    key: item,
  }));
};

const normalizeOptionsToObjectOfKeyValue = (
  options: { isSelected: boolean; key: DropdownOption }[],
) => {
  if (options.length === 0) return {};

  return options.reduce(
    (acc, option) => {
      acc[option.key.value] = option.isSelected;
      return acc;
    },
    {} as { [key: string]: boolean },
  );
};

const deleteSelectedItems = async () => {
  const context = modal.value.context as Context;
  const selectedItems: InBulkProcessableItem[] = getEnqueuedItems(context);
  if (selectedItems.length <= 0) return;

  try {
    const linkedEntitiesToRemove = normalizeOptionsToObjectOfKeyValue(
      options.value,
    );
    const isDeleted = await deleteEntities(
      selectedItems,
      false,
      linkedEntitiesToRemove,
    );

    if (isDeleted) {
      closeModal(TypeModals.BulkOperationsDeleteEntities);
      dequeueAllItemsForBulkProcessing(context);
      getCallbackFunction()?.();
      createNotificationOverwrite(
        NotificationType.default,
        t("notifications.success.entityDeleted.title"),
        t("notifications.success.entityDeleted.description"),
      );
    }
  } catch (error) {
    console.error("Error deleting selected items:", error);
  }
};

const handleDelete = () => {
  deleteSelectedItems();
};

watch(
  () => modal.value,
  async (newModal) => {
    if (newModal.open && newModal.formQuery) {
      await getDeletionForm(newModal.formQuery);
      if (!form.value) return;
      options.value = normalizeOptions(form.value.inputField.options);
    }
  },
  { immediate: true },
);
</script>

<style scoped></style>
