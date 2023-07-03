<template>
  <div
    class="flex justify-between items-center rounded alignment-nested-divs"
    :class="[
      useExtendedBulkOperations && itemsSelected
        ? `px-3 bg-neutral-white`
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
  type DropdownOption,
  type GetBulkOperationsQuery,
  ModalState,
  DamsIcons,
} from "@/generated-types/queries";
import {
  GetBulkOperationsDocument,
  BulkOperationTypes,
  TypeModals,
} from "@/generated-types/queries";
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { bulkSelectAllSizeLimit } from "@/main";
import { computed, onMounted, ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useQuery } from "@vue/apollo-composable";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
    useExtendedBulkOperations: boolean;
    confirmSelectionButton?: boolean;
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
}>();

const refetchEnabled = ref<boolean>(false);
const { refetch, onResult } = useQuery<GetBulkOperationsQuery>(
  GetBulkOperationsDocument,
  undefined,
  () => ({ enabled: refetchEnabled.value })
);
const bulkOperations = ref<DropdownOption[]>([]);
const selectedBulkOperation = ref<DropdownOption>();
const {
  getEnqueuedItemCount,
  getEnqueuedItems,
  dequeueAllItemsForBulkProcessing,
} = useBulkOperations();
const { getModal } = useAvailableModals();

onResult((result) => {
  if (result.data) bulkOperations.value = result.data.BulkOperations.options;
});

const itemsSelected = computed<boolean>(
  () => getEnqueuedItemCount(props.context) > 0
);

onMounted(() => {
  refetchEnabled.value = true;
  refetch();
});

watch(selectedBulkOperation, () => {
  if (selectedBulkOperation.value?.value === BulkOperationTypes.ExportCsv)
    getModal(TypeModals.BulkOperations).openModal();
});

watch(
  () => getModal(TypeModals.BulkOperations).modalState.value.state,
  () => {
    if (
      getModal(TypeModals.BulkOperations).modalState.value.state ===
      ModalState.Hide
    )
      selectedBulkOperation.value = undefined;
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
