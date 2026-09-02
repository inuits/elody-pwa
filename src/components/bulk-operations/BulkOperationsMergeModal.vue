<template>
  <div class="p-8 flex flex-col w-full h-full">
    <h1 class="title flex justify-center">
      {{ t("bulk-operations.merge-modal.title") }}
    </h1>

    <div v-if="isLoading" class="w-full flex justify-center py-8">
      <spinner-loader theme="accent" :dimensions="16" />
    </div>

    <template v-else>
      <p class="pt-4">{{ t("bulk-operations.merge-modal.description") }}</p>

      <fieldset class="pt-4">
        <legend class="font-bold">
          {{ t("bulk-operations.merge-modal.survivor-label") }}
        </legend>
        <label
          v-for="(item, index) in selectedItems"
          :key="item.id"
          class="mr-6 cursor-pointer"
        >
          <input
            type="radio"
            name="merge-survivor"
            :checked="survivorIndex === index"
            :data-testid="`survivor-${index}`"
            @change="survivorIndex = index"
          />
          {{ sideInfoFor(item).label }}
        </label>
      </fieldset>

      <div class="flex-1 overflow-y-auto pt-4">
        <MergeDiffTable
          :rows="rows"
          :left-side-info="sideInfoFor(survivor)"
          :right-side-info="sideInfoFor(victim)"
          :choices="choices"
          @update:choices="choices = $event"
        />
      </div>

      <p class="pt-4">{{ t("bulk-operations.merge-modal.relations-note") }}</p>
      <p v-if="inboundReferenceCount > 0" class="pt-4">
        {{
          t("bulk-operations.merge-modal.inbound-references", {
            count: inboundReferenceCount,
          })
        }}
      </p>
      <p class="pt-2 text-red-default font-bold">
        {{ t("bulk-operations.merge-modal.warning") }}
      </p>
    </template>

    <div class="flex justify-between mt-4">
      <BaseButtonNew
        :disabled="isLoading || isMerging"
        :label="t('bulk-operations.merge-modal.confirm')"
        button-style="accentNormal"
        button-size="small"
        @click="submitMerge"
      />
      <BaseButtonNew
        :disabled="isMerging"
        :label="t('bulk-operations.merge-modal.cancel')"
        button-style="default"
        button-size="small"
        @click="closeModal(TypeModals.BulkOperationsMerge)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { apolloClient } from "@/main";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import MergeDiffTable, {
  SideInfo,
} from "@/components/merge/MergeDiffTable.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import {
  useBulkOperations,
  type Context,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import {
  buildMergeRows,
  buildMergedValues,
  type MergeChoices,
} from "@/composables/useMergeDiff";
import { collectMergeFields } from "@/composables/useMergeFields";
import { getEntityTitle } from "@/helpers";
import {
  Collection,
  GetEntityByIdDocument,
  GetMergePreviewDocument,
  MergeEntitiesDocument,
  TypeModals,
} from "@/generated-types/queries";

const { t } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { getEnqueuedItems, dequeueAllItemsForBulkProcessing } =
  useBulkOperations();
const { getCallbackFunctions } = useModalActions();

const survivorIndex = ref<number>(0);
const choices = ref<MergeChoices>({});
const loadedEntities = ref<Record<string, any>>({});
const inboundReferenceCount = ref<number>(0);
const isLoading = ref<boolean>(false);
const isMerging = ref<boolean>(false);

const context = computed(
  (): Context => getModalInfo(TypeModals.BulkOperationsMerge).context,
);
const isOpen = computed(
  () => getModalInfo(TypeModals.BulkOperationsMerge).open,
);

const selectedItems = computed((): InBulkProcessableItem[] =>
  context.value ? getEnqueuedItems(context.value) : [],
);

const survivor = computed(() => selectedItems.value[survivorIndex.value]);
const victim = computed(
  () => selectedItems.value[survivorIndex.value === 0 ? 1 : 0],
);

const entityFor = (item: InBulkProcessableItem | undefined) =>
  item ? loadedEntities.value[item.id] : undefined;

// Selection paths do not set a display value, so the id is only a fallback
// until the entity itself is loaded.
const sideInfoFor = (item: InBulkProcessableItem | undefined): SideInfo => {
  if (!item) return { label: "", id: "", type: "" };
  const entity = entityFor(item);
  const entityTitle: string =
    (entity && getEntityTitle(entity)) || item.value || item.id;
  return { label: entityTitle, id: item.id, type: item.type ?? "" };
};

const mergeFields = computed(() =>
  collectMergeFields(entityFor(survivor.value)?.entityView),
);

const rows = computed(() => {
  const survivorEntity = entityFor(survivor.value);
  const victimEntity = entityFor(victim.value);
  if (!survivorEntity || !victimEntity) return [];

  return buildMergeRows(
    mergeFields.value,
    survivorEntity.intialValues ?? {},
    victimEntity.intialValues ?? {},
  );
});

const fetchEntity = async (item: InBulkProcessableItem) => {
  const { data } = await apolloClient.query({
    query: GetEntityByIdDocument,
    variables: { id: item.id, type: item.type },
    fetchPolicy: "no-cache",
  });
  return data?.Entity;
};

const fetchMergePreview = async (id: string) => {
  const { data } = await apolloClient.query({
    query: GetMergePreviewDocument,
    variables: { id, collection: Collection.Entities },
    fetchPolicy: "no-cache",
  });
  return data?.mergePreview;
};

const loadComparison = async () => {
  if (selectedItems.value.length < 2) return;
  isLoading.value = true;
  choices.value = {};
  try {
    const entities = await Promise.all(selectedItems.value.map(fetchEntity));
    loadedEntities.value = Object.fromEntries(
      selectedItems.value.map((item, index) => [item.id, entities[index]]),
    );
  } catch (error) {
    // Without both records there is nothing to compare, and an empty table
    // would read as "these two are identical".
    displayErrorNotification(
      t("notifications.errors.merge-entities.title"),
      String(error),
    );
    closeModal(TypeModals.BulkOperationsMerge);
  } finally {
    isLoading.value = false;
  }
};

// Informational, so it must never hold up the comparison.
const loadMergePreview = async () => {
  if (!victim.value) return;
  const preview = await fetchMergePreview(victim.value.id).catch(() => null);
  inboundReferenceCount.value = preview?.inboundReferenceCount ?? 0;
};

watch(
  isOpen,
  (open) => {
    if (!open) return;
    survivorIndex.value = 0;
    loadComparison();
  },
  { immediate: true },
);

watch(victim, loadMergePreview, { immediate: true });

// Choices are "left" or "right", and swapping the survivor swaps the columns:
// keeping them would silently flip every value the user already picked.
watch(survivorIndex, () => {
  choices.value = {};
});

const submitMerge = async () => {
  if (!survivor.value || !victim.value) return;
  isMerging.value = true;
  try {
    const metadataValues = buildMergedValues(rows.value, choices.value);
    await apolloClient.mutate({
      mutation: MergeEntitiesDocument,
      variables: {
        survivorId: survivor.value.id,
        victimId: victim.value.id,
        collection: Collection.Entities,
        formInput: {
          metadata: mergeFields.value
            .filter((field) => field.key in metadataValues)
            .map((field) => ({
              key: field.key,
              value: metadataValues[field.key],
            })),
          // Relations are unioned by the merge itself, so there is nothing to
          // send: the survivor keeps its own and gains the victim's.
          relations: [],
        },
      },
    });

    displaySuccessNotification(
      t("notifications.success.merge-entities.title"),
      t("notifications.success.merge-entities.description"),
    );
    closeModal(TypeModals.BulkOperationsMerge);
    dequeueAllItemsForBulkProcessing(context.value);
    for (const callback of getCallbackFunctions() ?? []) callback();
  } catch (error) {
    displayErrorNotification(
      t("notifications.errors.merge-entities.title"),
      String(error),
    );
  } finally {
    isMerging.value = false;
  }
};
</script>
