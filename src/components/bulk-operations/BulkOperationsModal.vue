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
              :required="csvExportOption.key.required"
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
  BulkOperationTypes,
  DamsIcons,
  type DropdownOption,
  Entitytyping,
  FetchMediafilesOfEntityDocument,
  FetchMediafilesOfEntityQuery,
  FetchMediafilesOfEntityQueryVariables,
  GetBulkOperationCsvExportKeysDocument,
  type GetBulkOperationCsvExportKeysQuery,
  type GetBulkOperationCsvExportKeysQueryVariables,
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
import { computed, inject, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";
import {
  formatTeaserMetadata,
  getChildrenOfHomeRoutes,
  getHomeRoute,
} from "@/helpers";
import { useModalActions } from "@/composables/useModalActions";

const entityTypeMappingByContext: {
  [key: string]: Entitytyping;
} = {
  [BulkOperationsContextEnum.EntityElementMedia]: Entitytyping.Mediafile,
};

const getEntityTypeByContext = (
  context: BulkOperationsContextEnum | string
): string | undefined => {
  const entityTypeByContext =
    entityTypeMappingByContext[context as BulkOperationsContextEnum];
  if (entityTypeByContext) return entityTypeByContext;

  const route = [getHomeRoute(config), ...getChildrenOfHomeRoutes(config)].find(
    (route: { name: string }) => route.name === context
  );

  return route?.meta?.entityType;
};

const {
  getEnqueuedItems,
  getEnqueuedItemCount,
  enqueueItemForBulkProcessing,
  dequeueAllItemsForBulkProcessing,
  triggerBulkSelectionEvent,
} = useBulkOperations();

const { getBulkOperationType } = useModalActions();

const config = inject("config") as any;
const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
const { getThumbnail } = useThumbnailHelper();
const { getModal, closeModal, getModalInfo } = useBaseModal();

const modal = getModal(TypeModals.BulkOperations);
const skip = ref<number>(1);
const limit = ref<number>(config.bulkSelectAllSizeLimit);

const isFetchMediafilesOfAssetFlow = ref<boolean>(false);
const entityType = computed(() =>
  isFetchMediafilesOfAssetFlow.value
    ? Entitytyping.Mediafile
    : getEntityTypeByContext(context.value)
);

const context: Context = computed(
  () => getModal(TypeModals.BulkOperations).context
);

const items = ref<InBulkProcessableItem[]>([]);
const loadItems = () =>
  (items.value = getEnqueuedItems(context.value, skip.value, limit.value));

const refetchEnabled = ref<boolean>(false);
const queryVariablesForExportKeys: GetBulkOperationCsvExportKeysQueryVariables =
  {
    entityType: entityType.value,
  };
const { refetch, onResult } = useQuery<GetBulkOperationCsvExportKeysQuery>(
  GetBulkOperationCsvExportKeysDocument,
  queryVariablesForExportKeys,
  () => ({ enabled: ref<boolean>(!!entityType.value && refetchEnabled.value) })
);
const csvExportOptions = ref<{ isSelected: boolean; key: DropdownOption }[]>(
  []
);

const queryVariablesForMediafiles: FetchMediafilesOfEntityQueryVariables = {
  entityIds: [],
};
const { refetch: refetchMediafiles, onResult: mediafilesResult } =
  useQuery<FetchMediafilesOfEntityQuery>(
    FetchMediafilesOfEntityDocument,
    queryVariablesForMediafiles,
    () => ({ enabled: isFetchMediafilesOfAssetFlow.value })
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

  const exportURL = `/api/export/csv?type=${
    entityType.value
  }&ids=${getEnqueuedItems(context.value)
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
      link.download = `${entityType.value}.csv`;
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
      csvExportOptions.value.push({ isSelected: key.required, key });
  }
});

mediafilesResult((result) => {
  if (!result.data || !isFetchMediafilesOfAssetFlow.value) return;
  const mediafiles = result.data.FetchMediafilesOfEntity;
  mediafiles.forEach((mediafile) => {
    enqueueItemForBulkProcessing(RouteNames.Mediafiles, {
      id: mediafile.id,
      teaserMetadata: formatTeaserMetadata(
        mediafile.teaserMetadata,
        mediafile.intialValues
      ),
      type: Entitytyping.Mediafile,
    });
  });
  executeNormalFlow();
});

const firstFetchMediafilesOfEntities = () => {
  const assets = getEnqueuedItems(RouteNames.Assets, skip.value, limit.value);
  queryVariablesForMediafiles.entityIds = assets.map((asset) => asset.id);
  refetchMediafiles(queryVariablesForMediafiles);
};

const executeNormalFlow = () => {
  refetchEnabled.value = true;
  queryVariablesForExportKeys.entityType = entityType.value;
  refetch(queryVariablesForExportKeys);
  loadItems();
};

const determineFlow = () => {
  if (!context.value || !modal?.open) return;
  const bulkOperationType = getBulkOperationType();
  isFetchMediafilesOfAssetFlow.value =
    bulkOperationType &&
    bulkOperationType === BulkOperationTypes.ExportCsvOfMediafilesFromAsset;
  if (isFetchMediafilesOfAssetFlow.value) firstFetchMediafilesOfEntities();
  else executeNormalFlow();
};

watch(
  () => context.value,
  () => determineFlow(),
  { immediate: true }
);

watch(
  () => modal?.open,
  (isBulkOperationsModalOpen: boolean | undefined) => {
    if (isBulkOperationsModalOpen) determineFlow();
    else {
      dequeueAllItemsForBulkProcessing(
        BulkOperationsContextEnum.BulkOperationsCsvExport
      );
      dequeueAllItemsForBulkProcessing(RouteNames.Mediafiles);
    }
  }
);
</script>
