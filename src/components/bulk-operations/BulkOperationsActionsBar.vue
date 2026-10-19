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
    <!-- Always mounted, so screen readers announce selection changes. -->
    <span
      role="status"
      :class="itemsSelected ? 'font-bold' : 'text-text-muted'"
      >{{
      itemsSelected
        ? t("bulk-operations.selection-count", {
            count: getEnqueuedItemCount(context),
          })
        : hasBulkOperationsWithItemsSelection && enableSelection
          ? t("bulk-operations.nothing-selected")
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
    <!-- The list header's checkbox selects/clears the page; this clears what
         sits on other pages too. -->
    <button
      v-if="offPageCount > 0"
      type="button"
      data-cy="selection-bar-link"
      class="text-label text-text-light underline cursor-pointer"
      @click="dequeueAllItemsForBulkProcessing(context)"
    >
      {{ t("bulk-operations.clear-selection") }}
    </button>
    <div class="flex items-center gap-(--selection-bar-gap)">
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
            :options="barOperations"
            :flat="true"
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
    <!-- ui_kits/clients: the page's create action is a pill next to the page
         title (TheHeader), not part of the selection bar. -->
    <Teleport
      v-if="createInPageHeader && auth.isAuthenticated.value"
      defer
      to="#page-header-create"
    >
      <BaseButtonNew
        v-for="option in createOperations"
        :key="option.value"
        data-cy="page-header-create"
        class="!w-auto !rounded-pill"
        button-style="primary"
        button-size="sm"
        :icon="option.icon ?? DamsIcons.PlusCircle"
        :label="t(option.label)"
        @click="
          selectedBulkOperation = option;
          handleSelectedBulkOperation(option);
        "
      />
    </Teleport>
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
import {
  BulkOperationTypes,
  DamsIcons,
  type DropdownOption,
  type Entitytyping,
} from "@/generated-types/queries";
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
    // The page's own library: its create action goes to the page header.
    createInPageHeader?: boolean;
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
  itemsSelected,
  hasBulkOperationsWithItemsSelection,
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

const isCreate = (option: DropdownOption) =>
  option.value === BulkOperationTypes.CreateEntity;
const createOperations = computed<DropdownOption[]>(() =>
  props.createInPageHeader ? (bulkOperations.value ?? []).filter(isCreate) : [],
);
const barOperations = computed<DropdownOption[] | undefined>(() =>
  props.createInPageHeader
    ? bulkOperations.value?.filter((option) => !isCreate(option))
    : bulkOperations.value,
);

// Lists without bulk actions would otherwise show an empty bordered bar.
const hasContent = computed<boolean>(
  () =>
    itemsSelected.value ||
    (props.useExtendedBulkOperations &&
      props.showButton &&
      (props.confirmSelectionButton || (barOperations.value?.length ?? 0) > 0)),
);

const offPageCount = computed<number>(() =>
  props.pageItemIds
    ? getEnqueuedItems(props.context).filter(
        (item) => !props.pageItemIds!.includes(item.id),
      ).length
    : 0,
);
</script>
