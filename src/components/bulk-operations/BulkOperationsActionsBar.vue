<template>
  <div
    v-if="bulkOperationsPromiseIsResolved"
    role="toolbar"
    :aria-label="$t('bulk-operations.toolbar-label')"
    class="flex justify-between items-center rounded alignment-nested-divs px-3 !py-1 bg-background-light"
  >
    <div class="flex justify-start items-center">
      <div
        class="selection-count"
        :class="{
          'selection-count--active': useExtendedBulkOperations && itemsSelected,
        }"
        role="status"
      >
        <span>
          <span v-if="itemsSelected" class="font-bold"
            >{{ getEnqueuedItemCount(context) }}/</span
          ><button
            v-if="canRevealExactCount(totalItemsCount, exactCount)"
            type="button"
            class="underline decoration-dotted cursor-pointer disabled:cursor-wait"
            :disabled="exactCountLoading"
            :title="$t('bulk-operations.reveal-exact-count')"
            @click="emit('revealExactCount')"
          >
            {{ formatResultCount(totalItemsCount, locale) }}</button
          ><span v-else
            >{{ formatDisplayCount(totalItemsCount, exactCount, locale) }}
          </span>
          {{ $t("bulk-operations.items") }}
          <span v-if="itemsSelected">{{ $t("bulk-operations.selected") }}</span>
        </span>
      </div>
      <div v-if="exactCountLoading" class="flex items-center ml-1">
        <SpinnerLoader theme="accent" :dimensions="12" />
      </div>
      <BaseTooltip
        v-else-if="canRevealExactCount(totalItemsCount, exactCount)"
        position="top-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div v-on="on" class="flex items-center ml-1">
            <Unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <span>
          {{ $t("bulk-operations.capped-items-tooltip") }}
        </span>
      </BaseTooltip>
      <div v-if="itemsSelected">
        <button type="button" class="select-actions" @click="dequeueAllItemsForBulkProcessing(context)">
          {{ $t("bulk-operations.undo-selection") }}
        </button>
      </div>
      <div
        v-if="
          useExtendedBulkOperations &&
          hasBulkOperationsWithItemsSelection &&
          enableSelection
        "
      >
        <button
          type="button"
          class="select-actions"
          @click="() => emit('selectPage')"
        >
          {{ $t("bulk-operations.select-page") }}
        </button>
      </div>
    </div>
    <div v-if="!excludePagination && showPagination" class="flex">
      <BasePaginationSkeleton v-if="isLoading" />
      <BasePaginationNew v-else />
    </div>
    <div
      v-if="showButton && useExtendedBulkOperations"
      class="flex justify-end w-fit"
    >
      <div v-if="confirmSelectionButton" class="w-full !m-0">
        <BaseButton
          :label="
            $t('bulk-operations.confirm-selection-count', {
              count: getEnqueuedItemCount(context),
            })
          "
          :icon="DamsIcons.Check"
          button-style="commit"
          :disabled="!itemsSelected"
          button-size="sm"
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
          :sub-dropdown-options="subDropdownOptions"
          :clear-sub-dropdown-options="clearSubDropdownOptions"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  canRevealExactCount,
  formatDisplayCount,
  formatResultCount,
} from "@/composables/useResultCount";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BasePaginationNew from "@/components/base/BasePagination.vue";
import BasePaginationSkeleton from "@/components/base/skeletons/BasePaginationSkeleton.vue";
import {
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import {
  useBulkOperationsActionsBar,
  type BulkOperationsActionsBarEmits,
  type BulkOperationsActionsBarProps,
} from "@/composables/useBulkOperationsActionsBar";
import { DamsIcons, type Entitytyping } from "@/generated-types/queries";
import { auth } from "@/main";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { Unicons } from "@/types";

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
    relationType?: string;
    skipItemsWithRelationDuringBulkDelete?: string[];
    selectedPaginationLimitOption: number;
    excludePagination?: boolean;
    showPagination?: boolean;
    isLoading?: boolean;
    exactCount?: number | null;
    exactCountLoading?: boolean;
  }>(),
  {
    totalItemsCount: 0,
    exactCount: null,
    exactCountLoading: false,
    showButton: true,
    confirmSelectionButton: false,
    customBulkOperations: undefined,
    enableSelection: true,
    parentEntityId: undefined,
    skipItemsWithRelationDuringBulkDelete: undefined,
    excludePagination: false,
    showPagination: true,
    isLoading: false,
    relationType: "",
  },
);

const { locale } = useI18n();

const parentEntity: Entity = inject("ParentEntityProvider", undefined);

const emit = defineEmits<{
  (event: "selectPage"): void;
  (event: "selectAll"): void;
  (event: "revealExactCount"): void;
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
    customQueryEntityPickerList?: string,
    customQueryEntityPickerListFilters?: string,
  ): void;
}>();

const {
  bulkOperations,
  selectedBulkOperation,
  bulkOperationsPromiseIsResolved,
  hasBulkOperationsWithItemsSelection,
  itemsSelected,
  subDropdownOptions,
  clearSubDropdownOptions,
  handleSelectedBulkOperation,
  getEnqueuedItemCount,
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
} = useBulkOperationsActionsBar(
  props as BulkOperationsActionsBarProps,
  emit as BulkOperationsActionsBarEmits,
  parentEntity,
);
</script>

<style>
@reference "@/assets/main.css"

.alignment-nested-divs div div {
  @apply py-1 mr-3;
}

/* The live count. Selected swaps to the panel-header pair rather than the
   retired mint, so it stays legible on the dark-accent tenants too. */
.selection-count {
  padding: var(--spacing-ds-3) var(--spacing-ds-6);
  margin: var(--spacing-ds-6) 0;
  border-radius: var(--radius-chip);
  background-color: var(--color-chip-count-bg);
  color: var(--color-text-body);
  font-size: var(--text-ui);
}

.selection-count--active {
  background-color: var(--color-surface-panel-header);
  color: var(--color-text-panel-header);
}

/* Real buttons: these were clickable spans, so the keyboard could not reach
   "Wis selectie" or "Selecteer pagina" at all. */
.select-actions {
  padding: 0 var(--spacing-ds-5);
  text-decoration: underline;
  cursor: pointer;
  user-select: none;
  font-size: var(--text-ui);
  color: var(--color-text-link);
  border-radius: var(--radius-input);
}

.select-actions:hover {
  color: var(--color-text-link-hover);
}

.select-actions:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.disabled-select-actions {
  @apply text-text-light select-none;
}
</style>
