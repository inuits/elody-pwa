<template>
  <div
    class="flex justify-between items-center rounded alignment-nested-divs"
    :class="[
      useExtendedBulkOperations && itemsSelected
        ? `px-3 !py-2 bg-neutral-white`
        : `bg-transparent`,
      { 'py-3': useExtendedBulkOperations },
    ]"
  >
    <div class="flex justify-start">
      <div
        class="px-2 rounded-md"
        :class="
          useExtendedBulkOperations && itemsSelected
            ? `text-neutral-white bg-accent-normal`
            : `text-text-body bg-neutral-light`
        "
      >
        <span>
          <span v-if="itemsSelected" class="font-bold"
            >{{ getEnqueuedItemCount(context) }}/</span
          >{{ totalItemsCount }}
          {{ $t("bulk-operations.items") }}
          <span v-if="itemsSelected">{{ $t("bulk-operations.selected") }}</span>
        </span>
      </div>
      <div v-if="itemsSelected">
        <span
          class="select-actions"
          :class="
            useExtendedBulkOperations ? `text-accent-accent` : `text-text-body`
          "
          @click="dequeueAllItemsForBulkProcessing(context)"
        >
          {{ $t("bulk-operations.undo-selection") }}
        </span>
      </div>
      <div>
        <span
          class="select-actions"
          :class="
            useExtendedBulkOperations && itemsSelected
              ? `text-accent-accent`
              : `text-text-body`
          "
          @click="() => emit('selectPage')"
        >
          {{ $t("bulk-operations.select-page") }}
        </span>
      </div>
      <div>
        <span
          :class="[
            totalItemsCount <= bulkSelectAllSizeLimit
              ? 'select-actions'
              : 'disabled-select-actions',
            useExtendedBulkOperations && itemsSelected
              ? `text-accent-accent`
              : `text-text-body`,
          ]"
          @click="
            () => {
              if (totalItemsCount <= bulkSelectAllSizeLimit) emit('selectAll');
            }
          "
        >
          {{ $t("bulk-operations.select-all") }}
        </span>
      </div>
    </div>

    <div
      v-if="useExtendedBulkOperations && itemsSelected"
      class="flex justify-end w-60"
    >
      <div v-if="confirmSelectionButton" class="w-full !m-0">
        <BaseButtonNew
          :label="$t('bulk-operations.confirm-selection')"
          :icon="DamsIcons.Check"
          button-style="accentAccent"
          button-size="small"
          @click="emit('confirmSelection', getEnqueuedItems(context))"
        />
      </div>
      <div v-else class="w-full !m-0">
        <BaseDropdownNew
          v-if="bulkOperations !== undefined"
          v-model="selectedBulkOperation"
          :options="bulkOperations"
          dropdown-style="accentAccent"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  BaseEntity,
  BulkOperationTypes,
  DamsIcons,
  type DropdownOption,
  GetBulkOperationsDocument,
  type GetBulkOperationsQuery,
  MetadataAndRelation,
  ModalState,
  RouteNames,
  TranscodeType,
  TypeModals,
  GenerateTranscodeDocument,
  GenerateTranscodeMutation,
  Entitytyping,
} from "@/generated-types/queries";
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { apolloClient, bulkSelectAllSizeLimit } from "@/main";
import { computed, onMounted, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
    useExtendedBulkOperations: boolean;
    confirmSelectionButton?: boolean;
    entityType: Entitytyping;
  }>(),
  {
    totalItemsCount: 0,
    confirmSelectionButton: false,
  }
);

const emit = defineEmits<{
  (event: "selectPage"): void;
  (event: "selectAll"): void;
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
  (event: "noBulkOperationsAvailable"): void;
  (event: "refetch"): void;
}>();

const route = useRoute();
const refetchEnabled = ref<boolean>(false);
const entityType = computed(() => props.entityType || route.meta.entityType);
const { mutate } = useMutation<GenerateTranscodeMutation>(
  GenerateTranscodeDocument
);
const { refetch, onResult } = useQuery<GetBulkOperationsQuery>(
  GetBulkOperationsDocument,
  { entityType: entityType.value },
  () => ({ enabled: refetchEnabled.value })
);
const bulkOperations = ref<DropdownOption[]>([]);
const selectedBulkOperation = ref<DropdownOption>();
const {
  getEnqueuedItemCount,
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
  enqueueItemForBulkProcessing,
} = useBulkOperations();
const { openModal, getModalInfo } = useBaseModal();
const { createNotificationOverwrite } = useNotification();
const { t } = useI18n();
const router = useRouter();

onResult((result) => {
  try {
    if (!result.data) return;
    bulkOperations.value =
      result.data?.BulkOperations?.bulkOperationOptions?.options;
  } catch (e) {
    emit("noBulkOperationsAvailable");
  }
});

const itemsSelected = computed<boolean>(
  () => getEnqueuedItemCount(props.context) > 0
);

onMounted(() => {
  refetchEnabled.value = true;
  refetch();
});

const enqueueItemsForManifestCollection = () => {
  try {
    const manifests = getEnqueuedItems(props.context).map(
      (item: InBulkProcessableItem) =>
        item.teaserMetadata?.find(
          (metadataItem: MetadataAndRelation) =>
            metadataItem.key === "manifest_url"
        )?.value
    );
    const newItems: InBulkProcessableItem[] = manifests.map(
      (manifest: string) => {
        return { id: manifest };
      }
    );
    newItems.forEach((item: InBulkProcessableItem) =>
      enqueueItemForBulkProcessing(
        BulkOperationsContextEnum.ManifestCollection,
        item
      )
    );
    router.push({ name: RouteNames.ManifestViewer });
  } catch {
    createNotificationOverwrite(
      NotificationType.error,
      t("notifications.errors.manifest-collection-error.title"),
      t("notifications.errors.manifest-collection-error.description")
    );
  }
};

const generateTranscodeFromMediafiles = (
  type: TranscodeType,
  entityIds: string[]
) => {
  mutate({ mediafileIds: entityIds, transcodeType: type }).then(() => {
    createNotificationOverwrite(
      NotificationType.default,
      t("notifications.default.generate-transcode.title"),
      t("notifications.default.generate-transcode.description")
    );
    dequeueAllItemsForBulkProcessing(props.context);
    emit("refetch");
  });
};

watch(selectedBulkOperation, () => {
  if (selectedBulkOperation.value?.value === BulkOperationTypes.ExportCsv)
    openModal(TypeModals.BulkOperations, undefined, "right");
  if (selectedBulkOperation.value?.value === BulkOperationTypes.Edit)
    openModal(TypeModals.BulkOperationsEdit, undefined, "right");
  if (
    selectedBulkOperation.value?.value ===
    BulkOperationTypes.AddToManifestViewerCollection
  ) {
    enqueueItemsForManifestCollection();
    dequeueAllItemsForBulkProcessing(props.context);
  }
  if (selectedBulkOperation.value?.value === BulkOperationTypes.TranscodePdf) {
    generateTranscodeFromMediafiles(
      TranscodeType.Pdf,
      getEnqueuedItems(props.context).map((entity: BaseEntity) => entity.id)
    );
  }
  if (
    selectedBulkOperation.value?.value === BulkOperationTypes.DownloadMediafiles
    && selectedBulkOperation.value?.bulkOperationModal
  ) {
      let modal = selectedBulkOperation.value?.bulkOperationModal;
      openModal(
        modal.typeModal,
        undefined,
        "right",
        modal.formQuery,
        modal.askForCloseConfirmation,
        props.context
      );
  }
});

watch(
  () => getModalInfo(TypeModals.BulkOperations).state,
  (bulkOperationsModalState: ModalState) => {
    if (bulkOperationsModalState === ModalState.Hide)
      selectedBulkOperation.value = undefined;
  }
);

watch(
  () => entityType.value,
  (type: Entitytyping) => {
    refetch({ entityType: type });
  }
);
</script>

<style lang="postcss" scoped>
.alignment-nested-divs div div {
  @apply py-1 mr-3;
}

.select-actions {
  @apply underline cursor-pointer select-none;
}

.disabled-select-actions {
  @apply text-text-light select-none;
}
</style>
