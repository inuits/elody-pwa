<template>
  <div class="h-full w-full flex flex-col gap-4 p-4">
    <p
      v-if="versionsError"
      data-test="history-message"
      class="p-4 rounded-md border-2 border-solid border-neutral-30 bg-background-light text-text-body"
    >
      {{ t("history.versions-load-error") }}
    </p>
    <div class="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
      <div>
        <div class="sticky top-0 z-10 bg-background-normal px-5 pb-2">
          <advanced-dropdown
            v-model:model-value="leftSelectedId"
            :options="leftDropdownOptions"
            :clearable="false"
            style-type="defaultWithBorder"
          />
          <p
            v-if="leftVersionMeta?.editedBy"
            data-test="history-version-author"
            class="pt-1 text-label text-text-muted"
          >
            {{
              t("history.edited-by", {
                author: leftVersionMeta.editedBy,
                date: leftVersionMeta.date,
              })
            }}
          </p>
        </div>
        <div v-if="leftLoading" class="flex justify-center py-8">
          <spinner-loader theme="accent" />
        </div>
        <p
          v-else-if="leftVersionError"
          data-test="history-message"
          class="mx-5 p-4 rounded-md border-2 border-solid border-neutral-30 bg-background-light text-text-body"
        >
          {{ t("history.version-load-error") }}
        </p>
        <entity-history-column
          v-else-if="leftVersionEntity"
          :key="leftVersionId"
          :entity="leftVersionEntity"
          :wysiwyg-diffs="leftWysiwygDiffs"
          :relation-diffs="leftRelationDiffs"
          :column-order="columnOrder"
          :element-order-by-column="elementOrderByColumn"
        />
      </div>

      <div>
        <div class="sticky top-0 z-10 bg-background-normal px-5 pb-2">
          <advanced-dropdown
            v-model:model-value="rightSelectedId"
            :options="rightDropdownOptions"
            :clearable="false"
            :disable="!hasVersions"
            style-type="defaultWithBorder"
          />
          <p
            v-if="rightVersionMeta?.editedBy"
            data-test="history-version-author"
            class="pt-1 text-label text-text-muted"
          >
            {{
              t("history.edited-by", {
                author: rightVersionMeta.editedBy,
                date: rightVersionMeta.date,
              })
            }}
          </p>
        </div>
        <div v-if="rightLoading" class="flex justify-center py-8">
          <spinner-loader theme="accent" />
        </div>
        <p
          v-else-if="rightVersionError"
          data-test="history-message"
          class="mx-5 p-4 rounded-md border-2 border-solid border-neutral-30 bg-background-light text-text-body"
        >
          {{ t("history.version-load-error") }}
        </p>
        <p
          v-else-if="hasNoHistory"
          data-test="history-message"
          class="mx-5 p-4 rounded-md border-2 border-solid border-neutral-30 bg-background-light text-text-body"
        >
          {{ t("history.no-history") }}
        </p>
        <p
          v-else-if="hasNoPreviousVersions"
          data-test="history-message"
          class="mx-5 p-4 rounded-md border-2 border-solid border-neutral-30 bg-background-light text-text-body"
        >
          {{ t("history.no-previous-versions") }}
        </p>
        <entity-history-column
          v-else-if="rightVersionEntity"
          :key="rightVersionId"
          :entity="rightVersionEntity"
          :wysiwyg-diffs="rightWysiwygDiffs"
          :relation-diffs="rightRelationDiffs"
          :column-order="columnOrder"
          :element-order-by-column="elementOrderByColumn"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import EntityHistoryColumn from "@/components/history/EntityHistoryColumn.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import {
  useHistoryComparisonData,
  LIVE_VERSION_ID,
} from "@/composables/useHistoryComparisonData";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import type { DropdownOption } from "@/generated-types/queries";

const config: any = inject("config");
const route = useRoute();
const entityId = route.params.id as string;
const entityType = route.params.type as string;
const { t } = useI18n();
const { determineBreadcrumbsForEntity } = useBreadcrumbs(config);

const {
  currentEntity,
  versionOptions,
  leftVersionId,
  rightVersionId,
  leftLoading,
  rightLoading,
  leftVersionEntity,
  rightVersionEntity,
  columnOrder,
  elementOrderByColumn,
  leftWysiwygDiffs,
  rightWysiwygDiffs,
  leftRelationDiffs,
  rightRelationDiffs,
  leftVersionMeta,
  rightVersionMeta,
  hasNoHistory,
  hasNoPreviousVersions,
  currentVersionNumber,
  versionsError,
  leftVersionError,
  rightVersionError,
} = useHistoryComparisonData(entityId, entityType);

watch(
  currentEntity,
  (entity) => {
    if (entity) determineBreadcrumbsForEntity(entity);
  },
  { immediate: true },
);

const hasVersions = computed(() => versionOptions.value.length > 0);

const toDropdownOption = (option: {
  id: string;
  label: string;
  editedBy?: string | null;
}): DropdownOption => ({
  label: option.editedBy ? `${option.label} · ${option.editedBy}` : option.label,
  value: option.id,
  __typename: "DropdownOption",
});

const leftDropdownOptions = computed<DropdownOption[]>(() => [
  {
    label:
      currentVersionNumber.value !== null
        ? t("history.current-version-number", {
            number: currentVersionNumber.value,
          })
        : t("history.current-version"),
    value: LIVE_VERSION_ID,
    __typename: "DropdownOption",
  },
  ...versionOptions.value.map(toDropdownOption),
]);

const rightDropdownOptions = computed<DropdownOption[]>(() =>
  versionOptions.value.map(toDropdownOption),
);

const leftSelectedId = computed<string | undefined>({
  get: () => leftVersionId.value ?? undefined,
  set: (value) => {
    leftVersionId.value = value ?? null;
  },
});

const rightSelectedId = computed<string | undefined>({
  get: () => rightVersionId.value ?? undefined,
  set: (value) => {
    rightVersionId.value = value ?? null;
  },
});
</script>
