<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-11/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full gap-8 h-[94%]">
        <div class="h-full basis-[60%]">
          <div class="h-[40px] mb-6">
            <LibraryBar
              v-model:skip="skip"
              v-model:limit="limit"
              :total-items="getEnqueuedItemCount(context)"
              @update:skip="loadItems()"
              @update:limit="loadItems()"
            />
          </div>
          <div class="h-[90%] overflow-y-hidden hover:overflow-y-auto">
            <ListItem
              v-for="item in items"
              :key="item.id"
              :item-id="item.id"
              :teaser-metadata="item.teaserMetadata"
              :bulk-operations-context="context"
              :thumb-icon="getThumbnail(item)"
            />
          </div>
        </div>
        <div class="grow">
          <div class="flex items-center h-[40px] mb-6">
            <BulkOperationsActionsBar
              context="BulkOperationsCsvExport"
              :total-items-count="10"
              :use-extended-bulk-operations="false"
            />
          </div>
          <div class="h-[90%]"></div>
        </div>
      </div>
      <div class="basis-full h-[55px]">
        <BulkOperationsSubmitBar
          :context="context"
          :selected-items-count="getEnqueuedItemCount(context)"
          @cancel="modal.closeModal()"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import {
  GetBulkOperationCsvExportKeysDocument,
  ModalState,
  TypeModals,
  type DropdownOption,
  type GetBulkOperationCsvExportKeysQuery,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import BulkOperationsActionsBar from "@/components/bulk-operations/BulkOperationsActionsBar.vue";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { ref, watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useQuery } from "@vue/apollo-composable";

const props = defineProps<{
  context: Context;
}>();

const { getEnqueuedItems, getEnqueuedItemCount } = useBulkOperations();
const { getThumbnail } = useThumbnailHelper();
const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.BulkOperations);
const skip = ref<number>(1);
const limit = ref<number>(1);

const items = ref<InBulkProcessableItem[]>([]);
const loadItems = () =>
  (items.value = getEnqueuedItems(props.context, skip.value, limit.value));

const refetchEnabled = ref<boolean>(false);
const { refetch, onResult } = useQuery<GetBulkOperationCsvExportKeysQuery>(
  GetBulkOperationCsvExportKeysDocument,
  undefined,
  () => ({ enabled: refetchEnabled.value })
);
const bulkOperationCsvExportKeys = ref<DropdownOption[]>([]);

onResult((result) => {
  if (result.data)
    bulkOperationCsvExportKeys.value =
      result.data.BulkOperationCsvExportKeys.options;
});

watch(
  () => getModal(TypeModals.BulkOperations).modalState.value.state,
  () => {
    if (
      getModal(TypeModals.BulkOperations).modalState.value.state ===
      ModalState.Show
    ) {
      refetchEnabled.value = true;
      refetch();
      loadItems();
    }
  }
);
</script>
