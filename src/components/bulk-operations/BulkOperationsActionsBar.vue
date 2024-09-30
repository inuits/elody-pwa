<template>
  <div
    v-if="bulkOperationsPromiseIsResolved"
    class="flex justify-between items-center rounded alignment-nested-divs"
    :class="[
      useExtendedBulkOperations
        ? `px-3 !py-1 bg-neutral-white`
        : `bg-transparent`,
      { 'py-3': useExtendedBulkOperations },
    ]"
  >
    <div class="flex justify-start items-center">
      <div
        class="px-2 my-2.5 rounded-md"
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
      <div v-if="hasBulkOperationsWithItemsSelection">
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
<!--      <div v-if="hasBulkOperationsWithItemsSelection">-->
<!--        <span-->
<!--          :class="[-->
<!--            totalItemsCount <= bulkSelectAllSizeLimit-->
<!--              ? 'select-actions'-->
<!--              : 'disabled-select-actions',-->
<!--            useExtendedBulkOperations && itemsSelected-->
<!--              ? `text-accent-accent`-->
<!--              : `text-text-body`,-->
<!--          ]"-->
<!--          @click="-->
<!--            () => {-->
<!--              if (totalItemsCount <= bulkSelectAllSizeLimit) emit('selectAll');-->
<!--            }-->
<!--          "-->
<!--        >-->
<!--          <div class="flex flex-row items-center">-->
<!--            {{ $t("bulk-operations.select-all") }}-->
<!--            <base-tooltip-->
<!--              v-if="totalItemsCount > bulkSelectAllSizeLimit"-->
<!--              position="center"-->
<!--            >-->
<!--              <template #activator="{ on }">-->
<!--                <div v-on="on">-->
<!--                  <unicon-->
<!--                    :name="Unicons.QuestionCircle.name"-->
<!--                    height="20"-->
<!--                  />-->
<!--                </div>-->
<!--              </template>-->
<!--              <template #default>-->
<!--                <span class="w-max hover:text-accent-accent">-->
<!--                  {{ t("bulk-operations.bulk-select-all-size-limit-reached", [bulkSelectAllSizeLimit]) }}-->
<!--                </span>-->
<!--              </template>-->
<!--            </base-tooltip>-->
<!--          </div>-->
<!--        </span>-->
<!--      </div>-->
    </div>

    <div
      v-if="showButton && useExtendedBulkOperations"
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
        <ActionMenuGroup
          v-if="bulkOperations !== undefined"
          v-model="selectedBulkOperation"
          :options="bulkOperations"
          :items-selected="itemsSelected"
          :entity-type="entityType"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  BulkOperationTypes,
  DamsIcons,
  ActionContextEntitiesSelectionType,
  type DropdownOption,
  Entitytyping,
  GenerateTranscodeDocument,
  GenerateTranscodeMutation,
  GetBulkOperationsDocument,
  type GetBulkOperationsQuery,
  MetadataAndRelation,
  ModalStyle,
  RouteNames,
  TranscodeType,
  TypeModals,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  Context,
  DownloadMediafilesContextForBulkOperationsForm,
  InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { apolloClient, bulkSelectAllSizeLimit } from "@/main";
import { computed, onMounted, ref, watch } from "vue";
import {
  GenericContextForModals,
  useBaseModal,
} from "@/composables/useBaseModal";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useImport } from "@/composables/useImport";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
    useExtendedBulkOperations: boolean;
    showButton?: boolean;
    confirmSelectionButton?: boolean;
    entityType: Entitytyping;
    customBulkOperations?: String | undefined;
    refetchEntities: Function;
  }>(),
  {
    totalItemsCount: 0,
    showButton: true,
    confirmSelectionButton: false,
    customBulkOperations: undefined,
  }
);

const emit = defineEmits<{
  (event: "selectPage"): void;
  (event: "selectAll"): void;
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
  (
    event: "setBulkOperationsAvailable",
    isBulkOperationsAvailable: boolean
  ): void;
  (event: "refetch"): void;
  (
    event: "customBulkOperationsPromise",
    bulkOperationsPromise: () => Promise<void>
  ): void;
  (event: "applyCustomBulkOperations"): void;
  (event: "initializeEntityPickerComponent"): void;
}>();

const route = useRoute();
const { loadDocument } = useImport();
const refetchEnabled = ref<boolean>(false);
const entityType = computed(() => props.entityType || route.meta.entityType);
const { mutate } = useMutation<GenerateTranscodeMutation>(
  GenerateTranscodeDocument
);
const { refetch, onResult } = useQuery<GetBulkOperationsQuery>(
  GetBulkOperationsDocument,
  { entityType: entityType.value },
  () => ({ enabled: entityType.value ? refetchEnabled.value : false })
);
const bulkOperations = ref<DropdownOption[]>([]);
const selectedBulkOperation = ref<DropdownOption>();
const bulkOperationsPromiseIsResolved = ref<boolean>(
  !props.customBulkOperations
);
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
    emit("setBulkOperationsAvailable", false);
  }
});

const hasBulkOperationsWithItemsSelection = computed<boolean>(() => {
  const operationsWithContext = bulkOperations.value?.filter(
    (item: DropdownOption) => {
      if (!item.actionContext) return true;
      return (
        item.actionContext?.entitiesSelectionType ===
        ActionContextEntitiesSelectionType.SomeSelected
      );
    }
  );
  return (bulkOperations.value && operationsWithContext?.length > 0) || false;
});

const itemsSelected = computed<boolean>(
  () => getEnqueuedItemCount(props.context) > 0
);

const customBulkOperationsPromise = async () => {
  const query = await loadDocument(props.customBulkOperations);
  return apolloClient
    .query({
      query: query,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      const bulkOperationsResult =
        result.data?.CustomBulkOperations.bulkOperationOptions;
      bulkOperations.value = bulkOperationsResult?.options || [];
      bulkOperationsPromiseIsResolved.value = true;
    });
};

onMounted(() => {
  if (entityType.value) refetchEnabled.value = true;
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
    openModal(TypeModals.BulkOperations, ModalStyle.CenterWide, undefined, undefined, undefined, undefined, props.context);
  if (selectedBulkOperation.value?.value === BulkOperationTypes.ExportCsvOfMediafilesFromAsset) {
    const savedContext: DownloadMediafilesContextForBulkOperationsForm = {
      type: selectedBulkOperation.value?.value,
    };
    openModal(TypeModals.BulkOperations, ModalStyle.CenterWide, undefined, undefined, undefined, savedContext, RouteNames.Mediafiles);
  }
  if (selectedBulkOperation.value?.value === BulkOperationTypes.Edit)
    openModal(TypeModals.BulkOperationsEdit, ModalStyle.Right);
  if (
    selectedBulkOperation.value?.value ===
    BulkOperationTypes.AddToManifestViewerCollection
  ) {
    enqueueItemsForManifestCollection();
    dequeueAllItemsForBulkProcessing(props.context);
  }
  if (selectedBulkOperation.value?.bulkOperationModal) {
    if (
      selectedBulkOperation.value?.value ===
      BulkOperationTypes.DownloadMediafiles
    ) {
      let modal = selectedBulkOperation.value?.bulkOperationModal;
      const enqueuedItems = getEnqueuedItems(props.context);
      const savedContext: DownloadMediafilesContextForBulkOperationsForm = {
        type: selectedBulkOperation.value?.value,
        mediafiles: [],
        entities: [],
        includeAssetCsv: props.context !== RouteNames.Mediafile,
        relationType: modal.formRelationType,
      };
      if (
        props.context === RouteNames.Mediafile ||
        props.context === RouteNames.Mediafiles ||
        props.context === BulkOperationsContextEnum.EntityElementMedia
      )
        savedContext.mediafiles = enqueuedItems.map((item) => item.id);
      else savedContext.entities = enqueuedItems.map((item) => item.id);
      openModal(
        modal.typeModal,
        ModalStyle.Center,
        modal.formQuery,
        undefined,
        modal.askForCloseConfirmation,
        savedContext
      );
    }

    if (
      selectedBulkOperation.value?.value ===
        BulkOperationTypes.ReorderEntities ||
      selectedBulkOperation.value?.value === BulkOperationTypes.StartOcr ||
      selectedBulkOperation.value?.value === BulkOperationTypes.CreateEntity
    ) {
      let modal = selectedBulkOperation.value?.bulkOperationModal;
      const savedContext: GenericContextForModals = {
        type: selectedBulkOperation.value?.value,
        parentId: route.params.id,
        relationType: modal.formRelationType,
        collection: route.meta.type,
        callbackFunction: props.refetchEntities,
      };
      openModal(
        modal.typeModal,
        ModalStyle.Center,
        modal.formQuery,
        undefined,
        modal.askForCloseConfirmation,
        savedContext
      );
    }

    if (selectedBulkOperation.value?.value === BulkOperationTypes.AddRelation) {
      emit("initializeEntityPickerComponent");
      let modal = selectedBulkOperation.value?.bulkOperationModal;
      openModal(
        modal.typeModal,
        ModalStyle.RightWide,
        modal.formQuery,
        undefined,
        modal.askForCloseConfirmation,
      );
    }
  }
});

watch(
  () => getModalInfo(TypeModals.DynamicForm).open || getModalInfo(TypeModals.BulkOperations).open,
  (isBulkOperationModalOpen: boolean | undefined) => {
    if (!isBulkOperationModalOpen) selectedBulkOperation.value = undefined;
  }
);

watch(
  () => entityType.value,
  (type: Entitytyping) => {
    refetch({ entityType: type });
  }
);

watch(
  () => props.customBulkOperations,
  () => {
    if (!props.customBulkOperations || bulkOperationsPromiseIsResolved.value)
      return;
    emit("customBulkOperationsPromise", customBulkOperationsPromise);
    emit("applyCustomBulkOperations");
  },
  { immediate: true }
);

watch(
  () => hasBulkOperationsWithItemsSelection.value,
  (hasBulkOperations: boolean) => {
    if (props.confirmSelectionButton) return;
    emit("setBulkOperationsAvailable", hasBulkOperations);
  },
  { immediate: true }
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
