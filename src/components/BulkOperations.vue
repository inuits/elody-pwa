<template>
  <div
    class="flex justify-between items-center rounded-md p-4 bg-neutral-white alignment-nested-divs"
  >
    <div class="flex justify-start">
      <div class="px-2 rounded-md bg-accent-light text-accent-normal">
        <span>
          <span class="font-bold"> {{ enqueuedItemCount }} </span>/{{
            totalItemsCount
          }}
          {{ $t("bulk-operations.selected-items") }}
        </span>
      </div>
      <div>
        <span
          class="select-actions"
          @click="dequeueAllItemsForBulkProcessing(context)"
        >
          {{ $t("bulk-operations.undo-selection") }}
        </span>
      </div>
      <div>
        <span class="select-actions" @click="() => emit('selectPage')">
          {{ $t("bulk-operations.select-page") }}
        </span>
      </div>
      <div>
        <span
          :class="
            totalItemsCount <= bulkSelectAllSizeLimit
              ? 'select-actions'
              : 'disabled-select-actions'
          "
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

    <div class="flex justify-end w-60">
      <BaseDropdownNew
        v-model="selectedBulkOperation"
        :options="bulkOperations"
        dropdown-style="normalAccent"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  DropdownOption,
  GetBulkOperationsQuery,
} from "@/generated-types/queries";
import type { Context } from "@/composables/useBulkOperations";
import { bulkSelectAllSizeLimit } from "@/main";
import { GetBulkOperationsDocument } from "@/generated-types/queries";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { computed, onMounted, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";

const props = withDefaults(
  defineProps<{
    context: Context;
    totalItemsCount: number;
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

const enqueuedItemCount = computed<number>(() =>
  getEnqueuedItemCount(props.context)
);

onResult((result) => {
  if (result.data) bulkOperations.value = result.data.BulkOperations.options;
});
onMounted(() => {
  refetchEnabled.value = true;
  refetch();
});
</script>

<style lang="postcss" scoped>
.alignment-nested-divs div div {
  @apply py-1 mr-3;
}

.select-actions {
  @apply text-accent-normal underline cursor-pointer select-none;
}

.disabled-select-actions {
  @apply text-text-light select-none;
}
</style>
