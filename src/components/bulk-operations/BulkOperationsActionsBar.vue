<template>
  <!-- Sits in the list's results band (templates/elody-list-screen), which
       draws the surface. -->
  <div
    v-if="bulkOperationsPromiseIsResolved"
    v-show="hasContent"
    role="toolbar"
    :aria-label="t('bulk-operations.selection-toolbar')"
    class="flex flex-wrap items-center gap-(--selection-bar-gap) text-ui"
  >
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
import ActionMenuGroup from "@/components/ActionMenuGroup.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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

const props = withDefaults(
  defineProps<{
    context: Context;
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
    // Ids on the visible page, to tell selected items on other pages apart.
    pageItemIds?: string[];
  }>(),
  {
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

const { t } = useI18n();

const parentEntity: Entity = inject("ParentEntityProvider", undefined);

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

// Lists without bulk actions would otherwise show an empty bordered bar.
const hasContent = computed<boolean>(
  () =>
    itemsSelected.value ||
    (props.useExtendedBulkOperations &&
      ((hasBulkOperationsWithItemsSelection.value && props.enableSelection) ||
        (props.showButton &&
          (props.confirmSelectionButton ||
            (bulkOperations.value?.length ?? 0) > 0)))),
);

const offPageCount = computed<number>(() =>
  props.pageItemIds
    ? getEnqueuedItems(props.context).filter(
        (item) => !props.pageItemIds!.includes(item.id),
      ).length
    : 0,
);
</script>
