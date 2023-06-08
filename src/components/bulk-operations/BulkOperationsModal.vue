<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-11/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full gap-8 h-[94%]">
        <div class="h-full basis-[56%]">
          <div class="h-[40px] mb-6">
            <LibraryBar
              v-model:skip="skip"
              v-model:limit="limit"
              :total-items="getEnqueuedItemCount(context)"
              @update:skip="loadItems()"
              @update:limit="loadItems()"
            />
          </div>
          <div class="h-[90%] overflow-y-hidden hover:overflow-y-auto">
            <ListItem
              v-for="item in items"
              :key="item.id"
              :item-id="item.id"
              :teaser-metadata="item.teaserMetadata"
              :bulk-operations-context="context"
              :thumb-icon="getThumbnail(item)"
            />
          </div>
        </div>
        <div class="grow">
          <div class="flex items-center h-[40px] mb-6">
            <BulkOperationsActionsBar
              :context="BulkOperationsContextEnum.BulkOperationsCsvExport"
              :total-items-count="csvExportOptions.length"
              :use-extended-bulk-operations="false"
              @select-page="bulkSelect"
              @select-all="bulkSelect"
            />
          </div>
          <div class="h-[90%] overflow-y-hidden hover:overflow-y-auto">
            <BaseInputCheckbox
              v-for="csvExportOption in csvExportOptions"
              :key="csvExportOption.key.value"
              :class="{ 'mb-2': csvExportOption.isSelected }"
              v-model="csvExportOption.isSelected"
              :label="csvExportOption.key.label"
              :item="{ id: csvExportOption.key.value }"
              :bulk-operations-context="
                BulkOperationsContextEnum.BulkOperationsCsvExport
              "
              input-style="accentNormal"
            />
          </div>
        </div>
      </div>
      <div class="basis-full h-[55px]">
        <BulkOperationsSubmitBar
          :context="context"
          :selected-items-count="getEnqueuedItemCount(context)"
          :is-disabled-button="
            getEnqueuedItemCount(
              BulkOperationsContextEnum.BulkOperationsCsvExport
            ) === 0
          "
          :button-icon="DamsIcons.DocumentInfo"
          button-label="Exporteer naar csv"
          @submit="exportCsv()"
          @cancel="modal.closeModal()"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  BulkOperationsContextEnum,
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import {
  DamsIcons,
  GetBulkOperationCsvExportKeysDocument,
  ModalState,
  TypeModals,
  type DropdownOption,
  type GetBulkOperationCsvExportKeysQuery,
} from "@/generated-types/queries";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

const props = defineProps<{
  context: Context;
}>();

const {
  getEnqueuedItems,
  getEnqueuedItemCount,
  enqueueItemForBulkProcessing,
  dequeueAllItemsForBulkProcessing,
  triggerBulkSelectionEvent,
} = useBulkOperations();
const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { getThumbnail } = useThumbnailHelper();
const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.BulkOperations);
const skip = ref<number>(1);
const limit = ref<number>(1);

const items = ref<InBulkProcessableItem[]>([]);
const loadItems = () =>
  (items.value = getEnqueuedItems(props.context, skip.value, limit.value));

const refetchEnabled = ref<boolean>(false);
const { refetch, onResult } = useQuery<GetBulkOperationCsvExportKeysQuery>(
  GetBulkOperationCsvExportKeysDocument,
  undefined,
  () => ({ enabled: refetchEnabled.value })
);
const csvExportOptions = ref<{ isSelected: boolean; key: DropdownOption }[]>(
  []
);

const bulkSelect = () => {
  for (let csvExportOption of csvExportOptions.value)
    enqueueItemForBulkProcessing(
      BulkOperationsContextEnum.BulkOperationsCsvExport,
      {
        id: csvExportOption.key.value,
      }
    );
  triggerBulkSelectionEvent(BulkOperationsContextEnum.BulkOperationsCsvExport);
};

const exportCsv = async () => {
  let fieldQueryParameter = "";
  csvExportOptions.value.forEach((option) => {
    if (option.isSelected)
      fieldQueryParameter += `&field[]=${option.key.value}`;
  });

  await fetch(
    `/api/export/csv?ids=${getEnqueuedItems(props.context)
      .map((item) => item.id)
      .join(",")}${fieldQueryParameter}`,
    {
      method: "GET",
    }
  )
    .then((response: Response) => {
      if (!response.ok) throw response;
      return response.text();
    })
    .then((csv: string) => {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "entities.csv";
      link.click();

      URL.revokeObjectURL(url);
    })
    .catch(async (response: Response) =>
      createNotificationOverwrite(
        NotificationType.error,
        t("bulk-operations.csv-export.error.title"),
        await response.text(),
        15
      )
    );
};

onResult((result) => {
  if (result.data)
    for (let key of result.data.BulkOperationCsvExportKeys.options)
      csvExportOptions.value.push({ isSelected: false, key });
});

watch(
  () => getModal(TypeModals.BulkOperations).modalState.value.state,
  () => {
    if (
      getModal(TypeModals.BulkOperations).modalState.value.state ===
      ModalState.Show
    ) {
      if (csvExportOptions.value.length <= 0) {
        refetchEnabled.value = true;
        refetch();
      }
      loadItems();
    }

    if (
      getModal(TypeModals.BulkOperations).modalState.value.state ===
      ModalState.Hide
    )
      dequeueAllItemsForBulkProcessing(
        BulkOperationsContextEnum.BulkOperationsCsvExport
      );
  }
);
</script>
