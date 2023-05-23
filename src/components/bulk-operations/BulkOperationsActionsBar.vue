<template>
  <div
    class="flex justify-between items-center rounded alignment-nested-divs"
    :class="
      useExtendedBulkOperations && itemsSelected
        ? `p-3 bg-neutral-white`
        : `py-3 bg-transparent`
    "
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
      <BaseDropdownNew
        v-model="selectedBulkOperation"
        :options="bulkOperations"
        dropdown-style="accentAccent"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type DropdownOption,
  type GetBulkOperationsQuery,
  ModalState,
} from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { bulkSelectAllSizeLimit } from "@/main";
import {
  GetBulkOperationsDocument,
  BulkOperationTypes,
  TypeModals,
} from "@/generated-types/queries";
import { computed, onMounted, ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useQuery } from "@vue/apollo-composable";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
    useExtendedBulkOperations: boolean;
  }>(),
  {
    totalItemsCount: 0,
  }
);

const emit = defineEmits<{
  (event: "selectPage"): void;
  (event: "selectAll"): void;
}>();

const refetchEnabled = ref<boolean>(false);
const { refetch, onResult } = useQuery<GetBulkOperationsQuery>(
  GetBulkOperationsDocument,
  undefined,
  () => ({ enabled: refetchEnabled.value })
);
const bulkOperations = ref<DropdownOption[]>([]);
const selectedBulkOperation = ref<DropdownOption>();
const { getEnqueuedItemCount, dequeueAllItemsForBulkProcessing } =
  useBulkOperations();
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
