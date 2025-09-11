<template>
  <div
    v-if="bulkOperationsPromiseIsResolved"
    class="flex justify-between items-center rounded alignment-nested-divs px-3 !py-1 bg-background-light"
  >
    <div class="flex justify-start items-center">
      <div
        class="px-2 my-2.5 rounded-md"
        :class="
          useExtendedBulkOperations && itemsSelected
            ? `text-neutral-white bg-accent-normal`
            : `text-text-body bg-accent-highlight`
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
      <div
        v-if="
          useExtendedBulkOperations &&
          hasBulkOperationsWithItemsSelection &&
          enableSelection
        "
      >
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
    </div>
    <div v-if="!excludePagination && showPagination" class="flex">
      <BasePaginationSkeleton v-if="isLoading" />
      <BasePaginationNew
        v-else
        v-model:skip="selectedSkip"
        :limit="selectedPaginationLimitOption ?? NaN"
        :total-items="
          totalItemsCount ?? (getStateForRoute(route)?.totalEntityCount || 1)
        "
        @update:skip="setSkip"
      />
    </div>
    <div
      v-if="showButton && useExtendedBulkOperations"
      class="flex justify-end w-fit"
    >
      <div v-if="confirmSelectionButton" class="w-full !m-0">
        <BaseButtonNew
          :label="$t('bulk-operations.confirm-selection')"
          :icon="DamsIcons.Check"
          button-style="accentAccent"
          :disabled="!itemsSelected"
          button-size="small"
          @click="emit('confirmSelection', getEnqueuedItems(context))"
        />
      </div>
      <div v-else class="!m-0">
        <ActionMenuGroup
          v-if="bulkOperations !== undefined && auth.isAuthenticated.value"
          v-model="selectedBulkOperation"
          @update:modelValue="handleSelectedBulkOperation"
          :options="bulkOperations"
          :items-selected="itemsSelected"
          :entity-type="entityType"
          :parent-entity-id="parentEntityId"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Entitytyping } from "@/generated-types/queries";
import {
  ActionContextEntitiesSelectionType,
  BulkOperationTypes,
  DamsIcons,
  type DropdownOption,
  GetBulkOperationsDocument,
  type GetBulkOperationsQuery,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";
import {
  type Context,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { apolloClient } from "@/main";
import { computed, inject, onMounted, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useQuery } from "@vue/apollo-composable";
import { useImport } from "@/composables/useImport";
import { useRoute } from "vue-router";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import { auth } from "@/main";
import BasePaginationNew from "@/components/base/BasePagination.vue";
import { useStateManagement } from "@/composables/useStateManagement";
import BasePaginationSkeleton from "@/components/base/skeletons/BasePaginationSkeleton.vue";
import useEntitySingle from "@/composables/useEntitySingle";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
    useExtendedBulkOperations: boolean;
    showButton?: boolean;
    confirmSelectionButton?: boolean;
    entityType: Entitytyping;
    customBulkOperations?: string | undefined;
    refetchEntities: () => any;
    enableSelection?: boolean;
    parentEntityId?: string | undefined;
    relationType: string;
    skipItemsWithRelationDuringBulkDelete?: string[];
    selectedPaginationLimitOption: number;
    excludePagination: boolean;
    setSkip?: (skip: number) => void;
    showPagination?: boolean;
    isLoading?: boolean;
  }>(),
  {
    totalItemsCount: 0,
    showButton: true,
    confirmSelectionButton: false,
    customBulkOperations: undefined,
    enableSelection: true,
    parentEntityId: undefined,
    skipItemsWithRelationDuringBulkDelete: undefined,
    setSkip: undefined,
    excludePagination: false,
    showPagination: true,
    isLoading: false,
  },
);

const emit = defineEmits<{
  (event: "selectPage"): void;
  (event: "selectAll"): void;
  (event: "confirmSelection", selectedItems: InBulkProcessableItem[]): void;
  (
    event: "setBulkOperationsAvailable",
    isBulkOperationsAvailable: boolean,
  ): void;
  (event: "refetch"): void;
  (
    event: "customBulkOperationsPromise",
    bulkOperationsPromise: () => Promise<void>,
  ): void;
  (event: "applyCustomBulkOperations"): void;
  (
    event: "initializeEntityPickerComponent",
    enableCropMode: boolean,
    keyToSaveCropCoordinates: string,
  ): void;
}>();

const refetchParentEntity: any = inject("RefetchParentEntity");
const route = useRoute();
const { getStateForRoute } = useStateManagement();
const { loadDocument } = useImport();
const refetchEnabled = ref<boolean>(false);
const entityType = computed(() => props.entityType || route.meta.entityType);
const { refetch, onResult } = useQuery<GetBulkOperationsQuery>(
  GetBulkOperationsDocument,
  { entityType: entityType.value },
  () => ({ enabled: entityType.value ? refetchEnabled.value : ref(false) }),
);
const bulkOperations = ref<DropdownOption[]>([]);
const selectedBulkOperation = ref<DropdownOption>();
const bulkOperationsPromiseIsResolved = ref<boolean>(
  !props.customBulkOperations,
);
const selectedSkip = ref<number>(1);

const {
  getEnqueuedItemCount,
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
} = useBulkOperations();
const {
  initializeGeneralProperties,
  initializePropertiesForDownload,
  initializePropertiesForCreateEntity,
  initializePropertiesForBulkDeleteRelations,
  initializePropertiesForBulkDeleteEntities,
  setCallbackFunctions,
  resetAllProperties,
  getCallbackFunctions,
} = useModalActions();
const { openModal, getModalInfo } = useBaseModal();

onResult((result) => {
  try {
    if (!result.data) return;
    bulkOperations.value =
      result.data?.BulkOperations?.bulkOperationOptions?.options;
  } catch {
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
    },
  );
  return (bulkOperations.value && operationsWithContext?.length > 0) || false;
});

const itemsSelected = computed<boolean>(
  () => getEnqueuedItemCount(props.context) > 0,
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

const setSelectedSkipFromState = ({
  updateSkipGlobally = true,
}: { updateSkipGlobally?: boolean } = {}) => {
  const state = getStateForRoute(route, true);
  const skip = state?.queryVariables?.skip || 1;
  selectedSkip.value = skip;
  if (updateSkipGlobally) props.setSkip(skip);
};

const setSkip = async (newSkip: number) => {
  await props.setSkip(newSkip, true);
};

onMounted(() => {
  if (!props.excludePagination && props.showPagination)
    setSelectedSkipFromState();
  if (entityType.value && !props.customBulkOperations)
    refetchEnabled.value = true;
  refetch();
});

const handleSelectedBulkOperation = () => {
  if (!selectedBulkOperation.value) return;
  const modal = selectedBulkOperation.value?.bulkOperationModal;
  const bulkOperationType = selectedBulkOperation.value?.value;
  let modalStyle = ModalStyle.CenterWide;

  initializeGeneralProperties(
    useEntitySingle().getEntityUuid() || route.params.id,
    modal?.formRelationType,
    route.meta.type,
    [refetchParentEntity, props.refetchEntities].filter(Boolean),
    bulkOperationType,
  );
  if (bulkOperationType === BulkOperationTypes.DownloadMediafiles)
    initializePropertiesForDownload(
      getEnqueuedItems(props.context),
      props.context,
    );
  if (bulkOperationType === BulkOperationTypes.AddRelation) {
    emit(
      "initializeEntityPickerComponent",
      modal!.enableImageCrop || false,
      modal!.keyToSaveCropCoordinates || "",
    );
  }
  if (bulkOperationType === BulkOperationTypes.CreateEntity)
    initializePropertiesForCreateEntity();

  if (
    bulkOperationType === BulkOperationTypes.ReorderEntities ||
    bulkOperationType === BulkOperationTypes.DeleteEntities
  ) {
    setCallbackFunctions(
      [refetchParentEntity, props.refetchEntities].filter(Boolean),
    );
  }

  if (bulkOperationType === BulkOperationTypes.DeleteEntities) {
    modalStyle = ModalStyle.Center;
    initializePropertiesForBulkDeleteEntities(
      modal?.skipItemsWithRelationDuringBulkDelete,
    );
  }

  if (bulkOperationType === BulkOperationTypes.DeleteRelations) {
    initializePropertiesForBulkDeleteRelations(props.relationType);
  }

  openModal(
    modal.typeModal,
    modalStyle,
    modal.formQuery,
    undefined,
    modal.askForCloseConfirmation,
    bulkOperationType === BulkOperationTypes.ExportCsvOfMediafilesFromAsset
      ? RouteNames.Mediafiles
      : props.context,
  );
};

watch(
  () =>
    getModalInfo(TypeModals.DynamicForm).open ||
    getModalInfo(TypeModals.BulkOperations).open,
  (isBulkOperationModalOpen: boolean | undefined) => {
    if (!isBulkOperationModalOpen) selectedBulkOperation.value = undefined;
  },
);

watch(
  () => entityType.value,
  (type: Entitytyping) => {
    if (!type) return;
    refetch({ entityType: type });
  },
);

watch(
  () =>
    [
      getModalInfo(TypeModals.DynamicForm).open,
      getModalInfo(TypeModals.BulkOperations).open,
      getModalInfo(TypeModals.BulkOperationsDeleteEntities).open,
    ].some((isOpen) => isOpen),
  (isAnyModalOpen) => {
    if (!isAnyModalOpen) {
      resetAllProperties();
    }
  },
);

watch(
  () => props.customBulkOperations,
  () => {
    if (!props.customBulkOperations || bulkOperationsPromiseIsResolved.value)
      return;
    emit("customBulkOperationsPromise", customBulkOperationsPromise);
    emit("applyCustomBulkOperations");
  },
  { immediate: true },
);

watch(
  () => hasBulkOperationsWithItemsSelection.value,
  (hasBulkOperations: boolean) => {
    if (props.confirmSelectionButton) return;
    emit("setBulkOperationsAvailable", hasBulkOperations);
  },
  { immediate: true },
);

watch(
  () => props.isLoading,
  (currentState: boolean) => {
    if (currentState) return;
    setSelectedSkipFromState({ updateSkipGlobally: false });
  },
);
</script>

<style>
@reference "@/assets/main.css"

.alignment-nested-divs div div {
  @apply py-1 mr-3;
}

.select-actions {
  @apply px-2 underline cursor-pointer select-none;
}

.disabled-select-actions {
  @apply text-text-light select-none;
}
</style>
