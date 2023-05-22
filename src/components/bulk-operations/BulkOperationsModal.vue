<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-11/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-wrap p-8 h-full">
      <div class="flex basis-full h-[94%]">
        <div class="h-full basis-[60%]">
          <div class="h-[40px] mb-6">
            <LibraryBar />
          </div>
          <div class="h-[90%] overflow-y-hidden hover:overflow-y-auto">
            <ListItem
              v-for="item in getEnqueuedItems(context)"
              :key="item.id"
              :item-id="item.id"
              :teaser-metadata="item.teaserMetadata"
              :bulk-operations-context="context"
              :thumb-icon="getThumbnail(item)"
            />
          </div>
        </div>
        <div class="grow"></div>
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
import type { Context } from "@/composables/useBulkOperations";
import BaseModal from "@/components/base/BaseModal.vue";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import { TypeModals } from "@/generated-types/queries";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useBulkOperations } from "@/composables/useBulkOperations";

defineProps<{
  context: Context;
}>();

const { getEnqueuedItems, getEnqueuedItemCount } = useBulkOperations();
const { getThumbnail } = useThumbnailHelper();
const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.BulkOperations);
</script>
