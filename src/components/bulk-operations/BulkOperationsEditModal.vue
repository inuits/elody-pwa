<template>
  <div
    class="@container flex flex-col p-8 h-[calc(90vh-34px)] overflow-y-auto @4xl:overflow-y-hidden"
  >
    <div class="flex flex-col @4xl:flex-row flex-1 min-h-0 gap-8">
      <div class="flex flex-col min-h-0 @4xl:basis-[56%]">
        <div class="mb-6">
          <LibraryBar
            v-model:skip="skip"
            v-model:limit="limit"
            :total-items="getEnqueuedItemCount(context)"
            @update:skip="loadItems()"
            @update:limit="loadItems()"
          />
        </div>
        <div
          class="flex-1 min-h-0 max-h-[40vh] overflow-y-auto @4xl:max-h-none @4xl:overflow-y-hidden @4xl:hover:overflow-y-auto"
        >
          <ListItem
            v-for="item in items"
            :key="item.id"
            :item-id="item.id"
            :item-type="item.type"
            :teaser-metadata="item.teaserMetadata"
            :bulk-operations-context="context"
            :thumb-icon="getThumbnail(item)"
          />
        </div>
      </div>
      <div class="flex flex-col min-w-0 min-h-0 grow @4xl:overflow-y-auto">
        <h1 class="title pb-2">{{ t("bulk-operations.bulk-edit") }}</h1>
        <p class="text-sm text-text-body pb-2">
          {{ t("bulk-operations.bulk-edit-info") }}
        </p>
        <p
          v-if="mergedForm?.unmatchedTypes.length"
          class="text-sm text-accent-normal pb-2"
        >
          {{
            t("bulk-operations.bulk-edit-unmatched-types", [
              mergedForm.unmatchedTypes.join(", "),
            ])
          }}
        </p>
        <p
          v-for="conflict in mergedForm?.conflicts ?? []"
          :key="conflict.key"
          class="text-sm text-accent-normal pb-2"
        >
          {{
            t("bulk-operations.bulk-edit-field-conflict", [
              conflict.key,
              conflict.droppedTypes.join(", "),
            ])
          }}
        </p>
        <DynamicForm
          v-if="mergedForm"
          :key="formKey"
          :dynamic-form-query="''"
          :form-key="formKey"
          :modal-form-fields="mergedForm.formFields"
          :show-form-title="false"
          :router="useRouter()"
          :tab-name="''"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  Context,
  InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { TypeModals } from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import LibraryBar from "@/components/library/LibraryBar.vue";
import ListItem from "@/components/ListItem.vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import {
  useBulkEditForm,
  type MergedBulkEditForm,
} from "@/composables/useBulkEditForm";
import { computed, inject, ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { getEnqueuedItems, getEnqueuedItemCount } = useBulkOperations();
const { buildMergedBulkEditForm } = useBulkEditForm();
const config = inject("config") as any;
const { t } = useI18n();
const { getThumbnail } = useThumbnailHelper();
const { getModalInfo } = useBaseModal();

const formKey = "bulk-edit";
const modal = getModalInfo(TypeModals.BulkOperationsEdit);
const context = computed(
  (): Context => getModalInfo(TypeModals.BulkOperationsEdit).context,
);
const skip = ref<number>(1);
const limit = ref<number>(config.bulkSelectAllSizeLimit);
const items = ref<InBulkProcessableItem[]>([]);
const mergedForm = ref<MergedBulkEditForm | undefined>(undefined);

const loadItems = () =>
  (items.value = getEnqueuedItems(context.value, skip.value, limit.value));

const buildForm = async () => {
  const formQueries = modal.formQueries ?? [];
  if (formQueries.length === 0) {
    console.error(
      "Bulk edit: the bulk operation has no formQueries configured, nothing to render",
    );
    return;
  }
  const typesInSelection = [
    ...new Set(
      getEnqueuedItems(context.value)
        .map((item: InBulkProcessableItem) => item.type)
        .filter(Boolean) as string[],
    ),
  ];
  mergedForm.value = await buildMergedBulkEditForm(
    formQueries,
    typesInSelection,
  );
};

watch(
  () => modal.open,
  (isModalOpen) => {
    if (!isModalOpen) {
      mergedForm.value = undefined;
      return;
    }
    loadItems();
    buildForm();
  },
  { immediate: true },
);

watch(
  () => getEnqueuedItemCount(context.value),
  (count) => {
    if (!modal.open) return;
    loadItems();
    if (items.value.length === 0 && count > 0) {
      skip.value = 1;
      loadItems();
    }
  },
);
</script>
