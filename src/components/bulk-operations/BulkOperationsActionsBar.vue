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
import { DamsIcons } from "@/generated-types/queries";
import {
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import { auth } from "@/main";
import BasePaginationNew from "@/components/base/BasePagination.vue";
import BasePaginationSkeleton from "@/components/base/skeletons/BasePaginationSkeleton.vue";
import { useRoute } from "vue-router";
import { useStateManagement } from "@/composables/useStateManagement";
import {
  useBulkOperationsActionsBar,
  type BulkOperationsActionsBarProps,
  type BulkOperationsActionsBarEmits,
} from "@/composables/useBulkOperationsActionsBar";

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

const route = useRoute();
const { getStateForRoute } = useStateManagement();

const {
  bulkOperations,
  selectedBulkOperation,
  bulkOperationsPromiseIsResolved,
  selectedSkip,
  hasBulkOperationsWithItemsSelection,
  itemsSelected,
  handleSelectedBulkOperation,
  setSkip,
  getEnqueuedItemCount,
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
} = useBulkOperationsActionsBar(
  props as BulkOperationsActionsBarProps,
  emit as BulkOperationsActionsBarEmits,
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
