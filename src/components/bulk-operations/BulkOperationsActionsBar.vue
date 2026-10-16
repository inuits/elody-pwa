<template>
  <!-- selection-action-bar.md: one bordered surface; the border firms up once
       something is selected. -->
  <div
    v-if="bulkOperationsPromiseIsResolved"
    role="toolbar"
    :aria-label="t('bulk-operations.selection-toolbar')"
    class="flex flex-wrap items-center gap-(--selection-bar-gap) p-(--selection-bar-padding) bg-surface border rounded-button text-ui"
    :class="itemsSelected ? 'border-border-default' : 'border-border-subtle'"
  >
    <!-- The list total; moves to the list header count chip in DS 4. -->
    <span
      data-cy="selection-bar-total"
      class="inline-flex items-center p-(--chip-padding) rounded-chip text-chip font-bold bg-chip-neutral-bg text-chip-neutral-text"
    >
      <button
        v-if="canRevealExactCount(totalItemsCount, exactCount)"
        type="button"
        class="underline decoration-dotted cursor-pointer disabled:cursor-wait"
        :disabled="exactCountLoading"
        :title="$t('bulk-operations.reveal-exact-count')"
        @click="emit('revealExactCount')"
      >
        {{ formatResultCount(totalItemsCount, locale) }}</button
      ><span v-else>{{
        formatDisplayCount(totalItemsCount, exactCount, locale)
      }}</span
      >&nbsp;{{ $t("bulk-operations.items") }}
    </span>
    <SpinnerLoader v-if="exactCountLoading" theme="accent" :dimensions="12" />
    <BaseTooltip
      v-else-if="canRevealExactCount(totalItemsCount, exactCount)"
      position="top-end"
      :tooltip-offset="8"
    >
      <template #activator="{ on, describedBy }">
        <span
          v-on="on"
          :aria-describedby="describedBy"
          class="flex items-center text-text-light"
        >
          <Unicon :name="Unicons.QuestionCircle.name" height="14" />
        </span>
      </template>
      <span>
        {{ $t("bulk-operations.capped-items-tooltip") }}
      </span>
    </BaseTooltip>
    <!-- Mounted while empty, so screen readers announce the first selection. -->
    <span role="status" class="font-bold">{{
      itemsSelected
        ? t("bulk-operations.selection-count", {
            count: getEnqueuedItemCount(context),
          })
        : ""
    }}</span>
    <span
      v-if="offPageCount > 0"
      data-cy="selection-off-page-note"
      class="text-label text-text-light"
      >{{
        t("bulk-operations.selected-on-other-pages", { count: offPageCount })
      }}</span
    >
    <button
      v-if="itemsSelected"
      type="button"
      data-cy="selection-bar-link"
      class="text-label text-text-light underline cursor-pointer"
      @click="dequeueAllItemsForBulkProcessing(context)"
    >
      {{ t("bulk-operations.clear-selection") }}
    </button>
    <button
      v-if="
        useExtendedBulkOperations &&
        hasBulkOperationsWithItemsSelection &&
        enableSelection
      "
      type="button"
      data-cy="selection-bar-link"
      class="text-label text-text-light underline cursor-pointer"
      @click="() => emit('selectPage')"
    >
      {{ $t("bulk-operations.select-page") }}
    </button>
    <div class="flex items-center gap-(--selection-bar-gap) ml-auto">
      <div v-if="!excludePagination && showPagination" class="flex">
        <BasePaginationSkeleton v-if="isLoading" />
        <BasePaginationNew v-else />
      </div>
      <div
        v-if="showButton && useExtendedBulkOperations"
        class="flex justify-end w-fit"
      >
        <div v-if="confirmSelectionButton" class="w-full">
          <BaseButtonNew
            :label="$t('bulk-operations.confirm-selection')"
            :icon="DamsIcons.Check"
            button-style="commit"
            :disabled="!itemsSelected"
            button-size="sm"
            @click="emit('confirmSelection', getEnqueuedItems(context))"
          />
        </div>
        <div v-else>
          <ActionMenuGroup
            v-if="bulkOperations !== undefined && auth.isAuthenticated.value"
            v-model="selectedBulkOperation"
            @update:modelValue="handleSelectedBulkOperation"
            :options="bulkOperations"
            :items-selected="itemsSelected"
            :selected-items="getEnqueuedItems(context)"
            :entity-type="entityType"
            :parent-entity-id="parentEntityId"
            :sub-dropdown-options="subDropdownOptions"
            :clear-sub-dropdown-options="clearSubDropdownOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  canRevealExactCount,
  formatDisplayCount,
  formatResultCount,
} from "@/composables/useResultCount";
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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
    // Ids on the visible page, to tell selected items on other pages apart.
    pageItemIds?: string[];
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

const { t, locale } = useI18n();

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

const offPageCount = computed<number>(() =>
  props.pageItemIds
    ? getEnqueuedItems(props.context).filter(
        (item) => !props.pageItemIds!.includes(item.id),
      ).length
    : 0,
);
</script>
