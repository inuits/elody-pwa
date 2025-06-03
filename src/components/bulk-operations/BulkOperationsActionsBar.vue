<template>
  <div
    v-if="bulkOperationsPromiseIsResolved"
    class="flex justify-between items-center rounded alignment-nested-divs px-3 !py-1 bg-neutral-white"
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
    <div class="flex">
      <BasePaginationNew
        v-model:skip="selectedSkip"
        :limit="selectedPaginationLimitOption ?? NaN"
        :total-items="
          totalItems || getStateForRoute(route)?.totalEntityCount || 1
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
import { computed, onMounted, ref, toRefs, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useQuery } from "@vue/apollo-composable";
import { useImport } from "@/composables/useImport";
import { useRoute } from "vue-router";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import { auth } from "@/main";
import BasePaginationNew from "@/components/base/BasePagination.vue";
import { useStateManagement } from "@/composables/useStateManagement";

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
    enableSelection?: boolean;
    parentEntityId?: string | undefined;
    relationType: string;
    skipItemsWithRelationDuringBulkDelete?: string[];
    selectedPaginationLimitOption: number;
    setSkip: Function;
    totalItems: number;
  }>(),
  {
    totalItemsCount: 0,
    showButton: true,
    confirmSelectionButton: false,
    customBulkOperations: undefined,
    enableSelection: true,
    parentEntityId: undefined,
    skipItemsWithRelationDuringBulkDelete: undefined,
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
  (event: "initializeEntityPickerComponent"): void;
}>();

const route = useRoute();
const { getStateForRoute } = useStateManagement();
const { loadDocument } = useImport();
const refetchEnabled = ref<boolean>(false);
const { totalItems } = toRefs(props);
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
  setCallbackFunction,
} = useModalActions();
const { openModal, getModalInfo } = useBaseModal();

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

const setSelectedSkipFromState = () => {
  const state = getStateForRoute(route);
  const skip = state?.queryVariables?.skip || 1;
  selectedSkip.value = skip;
  props.setSkip(skip);
}

const setSkip = async (newSkip: number) => {
  await props.setSkip(newSkip, true);
};

onMounted(() => {
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
    route.params.id,
    modal?.formRelationType,
    route.meta.type,
    props.refetchEntities,
    bulkOperationType,
  );
  if (bulkOperationType === BulkOperationTypes.DownloadMediafiles)
    initializePropertiesForDownload(
      getEnqueuedItems(props.context),
      props.context,
    );
  if (bulkOperationType === BulkOperationTypes.AddRelation)
    emit("initializeEntityPickerComponent");
  if (bulkOperationType === BulkOperationTypes.CreateEntity)
    initializePropertiesForCreateEntity();

  if (
    bulkOperationType === BulkOperationTypes.ReorderEntities ||
    bulkOperationType === BulkOperationTypes.DeleteEntities
  ) {
    setCallbackFunction(props.refetchEntities);
  }

  if (bulkOperationType === BulkOperationTypes.DeleteEntities) {
    modalStyle = ModalStyle.Center;
    initializePropertiesForBulkDeleteEntities(modal?.skipItemsWithRelationDuringBulkDelete)
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
