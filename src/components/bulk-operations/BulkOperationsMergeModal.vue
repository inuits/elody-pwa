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
          class="flex items-center gap-2 py-1 cursor-pointer"
        >
          <input
            type="radio"
            name="merge-survivor"
            :class="isRecommended(item) ? 'accent-green-default' : undefined"
            :checked="survivorIndex === index"
            :data-testid="`survivor-${index}`"
            @change="survivorIndex = index"
          />
          <span>{{ sideInfoFor(item).label }}</span>
          <span
            v-if="hintFor(item)"
            :data-testid="`survivor-hint-${index}`"
            class="rounded-md px-2 py-0.5 text-sm"
            :class="
              isRecommended(item)
                ? 'text-green-default bg-green-light'
                : 'text-text-body bg-neutral-30'
            "
          >
            {{ t(hintFor(item)!.label, hintFor(item)!.values) }}
          </span>
        </label>
      </fieldset>

      <p
        v-if="noRecommendationHint"
        data-testid="no-recommendation"
        class="pt-2 text-orange-default"
      >
        {{ t(noRecommendationHint.label, noRecommendationHint.values) }}
      </p>

      <div class="flex-1 overflow-y-auto pt-4">
        <MergeDiffTable
          :rows="rows"
          :left-side-info="sideInfoFor(survivor)"
          :right-side-info="sideInfoFor(victim)"
          :choices="choices"
          @update:choices="choices = $event"
        />
      </div>

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

    <div class="flex justify-between gap-4 mt-4">
      <div class="flex flex-col gap-1">
        <BaseButtonNew
          :disabled="isLoading || isMerging || !!blockedReason"
          :label="t('bulk-operations.merge-modal.confirm')"
          button-style="accentNormal"
          button-size="small"
          @click="submitMerge"
        />
        <p
          v-if="blockedReason"
          data-testid="blocked-reason"
          class="text-sm text-red-default"
        >
          {{ t(blockedReason) }}
        </p>
      </div>
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
import { useRouter } from "vue-router";
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
import {
  expectedIdOf,
  hintForEvaluation,
  isSurvivorBlocked,
  pickRecommendedId,
} from "@/composables/useMergeSurvivorSuggestion";
import { getEntityTitle, goToEntityPage } from "@/helpers";
import {
  Collection,
  GetEntityByIdDocument,
  GetMergeEvaluationsDocument,
  GetMergePreviewDocument,
  MergeEntitiesDocument,
  TypeModals,
  type MergeEvaluation,
  type MergeSurvivorSuggestionConfig,
} from "@/generated-types/queries";

const { t } = useI18n();
const router = useRouter();
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
const evaluations = ref<MergeEvaluation[]>([]);
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

const suggestionConfig = computed(
  (): MergeSurvivorSuggestionConfig | undefined =>
    getModalInfo(TypeModals.BulkOperationsMerge).survivorSuggestion ??
    undefined,
);

const recommendedId = computed(() => pickRecommendedId(evaluations.value));

const evaluationFor = (item: InBulkProcessableItem | undefined) =>
  evaluations.value.find((evaluation) => evaluation.id === item?.id);

const hintFor = (item: InBulkProcessableItem | undefined) =>
  hintForEvaluation(evaluationFor(item), suggestionConfig.value);

const isRecommended = (item: InBulkProcessableItem | undefined) =>
  !!recommendedId.value && recommendedId.value === item?.id;

const noRecommendationHint = computed(() => {
  const label = suggestionConfig.value?.noRecommendationLabel;
  if (!label || evaluations.value.length === 0 || recommendedId.value)
    return undefined;
  return {
    label,
    values: { expectedId: expectedIdOf(evaluations.value) ?? "" },
  };
});

const blockedReason = computed(() =>
  isSurvivorBlocked(
    suggestionConfig.value,
    recommendedId.value,
    survivor.value?.id,
  )
    ? "bulk-operations.merge-modal.must-keep-recommended"
    : undefined,
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

const fetchMergeEvaluations = async (strategy: string) => {
  const { data } = await apolloClient.query({
    query: GetMergeEvaluationsDocument,
    variables: {
      ids: selectedItems.value.map((item) => item.id),
      collection: Collection.Entities,
      strategy,
    },
    fetchPolicy: "no-cache",
  });
  return (data?.mergeEvaluations ?? []) as MergeEvaluation[];
};

const preselectRecommendedSurvivor = () => {
  if (!suggestionConfig.value?.autoSelect || !recommendedId.value) return;
  const index = selectedItems.value.findIndex(
    (item) => item.id === recommendedId.value,
  );
  if (index >= 0) survivorIndex.value = index;
};

const loadComparison = async () => {
  if (selectedItems.value.length < 2) return;
  isLoading.value = true;
  choices.value = {};
  evaluations.value = [];
  try {
    const strategy = suggestionConfig.value?.strategy;
    const [entities, loadedEvaluations] = await Promise.all([
      Promise.all(selectedItems.value.map(fetchEntity)),
      strategy
        ? fetchMergeEvaluations(strategy).catch(() => [])
        : Promise.resolve([]),
    ]);
    loadedEntities.value = Object.fromEntries(
      selectedItems.value.map((item, index) => [item.id, entities[index]]),
    );
    evaluations.value = loadedEvaluations;
    preselectRecommendedSurvivor();
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
    // The same route a row click produces, so the id/slug handling stays in
    // one place.
    goToEntityPage(entityFor(survivor.value), "SingleEntity", router);
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
