<template>
  <BaseModal
    v-if="modal"
    :modal-type="TypeModals.BulkOperations"
    @hide-modal="closeModal(TypeModals.BulkOperations)"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full gap-8 h-full">
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
              :label="t(csvExportOption.key.label)"
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
          :button-label="t('bulk-operations.export-to-csv')"
          :button-icon="DamsIcons.DocumentInfo"
          :disabled="
            getEnqueuedItemCount(
              BulkOperationsContextEnum.BulkOperationsCsvExport
            ) === 0
          "
          :selected-items-count="getEnqueuedItemCount(context)"
          :showDeleteButton="false"
          @submit="exportCsv()"
          @cancel="closeModal(TypeModals.BulkOperations)"
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
  useBulkOperations,
} from "@/composables/useBulkOperations";
import {
  DamsIcons,
  type DropdownOption, Entitytyping,
  GetBulkOperationCsvExportKeysDocument,
  type GetBulkOperationCsvExportKeysQuery,
  RouteNames,
  TypeModals,
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
import { inject, ref, watch, computed } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

type MapRouteNameAgainstEntitytype = {
  [key: RouteNames]: Entitytyping;
};

const entityTypeMapping: MapRouteNameAgainstEntitytype = {
  [RouteNames.Assets]: Entitytyping.Asset,
  [RouteNames.Home]: Entitytyping.Asset,
  [RouteNames.Mediafiles]: Entitytyping.Mediafile,
  default: Entitytyping.Asset,
}

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
const config = inject("config") as any;
const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { getThumbnail } = useThumbnailHelper();
const { getModal, closeModal } = useBaseModal();
const modal = getModal(TypeModals.BulkOperations);
const skip = ref<number>(1);
const limit = ref<number>(config.bulkSelectAllSizeLimit);

const items = ref<InBulkProcessableItem[]>([]);
const loadItems = () =>
  (items.value = getEnqueuedItems(props.context, skip.value, limit.value));

const refetchEnabled = ref<boolean>(false);
const { refetch, onResult } = useQuery<GetBulkOperationCsvExportKeysQuery>(
  GetBulkOperationCsvExportKeysDocument,
  { entityType: entityTypeMapping[props.context] },
  () => ({ enabled: props.context && refetchEnabled.value })
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

  const exportURL = `/api/export/csv?ids=${getEnqueuedItems(props.context)
    .map((item) => item.id)
    .join(",")}${fieldQueryParameter}`;

  await fetch(encodeURI(exportURL), {
    method: "GET",
  })
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
  closeModal(TypeModals.BulkOperations);
};

onResult((result) => {
  if (result.data) {
    csvExportOptions.value = [];
    for (let key of result.data.BulkOperationCsvExportKeys.options)
      csvExportOptions.value.push({ isSelected: false, key });
  }
});

watch(
  () => props.context,
  () => {
    if (!props.context) return;
    refetchEnabled.value = true;
    refetch(entityTypeMapping[props.context])
  },
  { immediate: true }
)

watch(
  () => modal?.open,
  (isBulkOperationsModalOpen: boolean | undefined) => {
    if (isBulkOperationsModalOpen) {
      refetchEnabled.value = true;
      refetch({entityType: entityTypeMapping[props.context]});
      loadItems();
    }
    else {
      dequeueAllItemsForBulkProcessing(
        BulkOperationsContextEnum.BulkOperationsCsvExport
      );
    }
  }
);
</script>
