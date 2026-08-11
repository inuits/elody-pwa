<template>
  <div class="h-full w-full flex flex-col gap-4 p-4">
    <div class="flex-1 grid grid-cols-2 gap-4 overflow-y-auto">
      <div>
        <div class="sticky top-0 z-10 bg-background-normal px-5 pb-2">
          <advanced-dropdown
            v-model:model-value="leftSelectedId"
            :options="leftDropdownOptions"
            :clearable="false"
            style-type="defaultWithBorder"
          />
        </div>
        <div v-if="leftLoading" class="flex justify-center py-8">
          <spinner-loader theme="accent" />
        </div>
        <entity-history-column
          v-else-if="leftVersionEntity"
          :key="leftVersionId"
          :entity="leftVersionEntity"
          :wysiwyg-diffs="leftWysiwygDiffs"
          :relation-diffs="leftRelationDiffs"
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
        </div>
        <div v-if="rightLoading" class="flex justify-center py-8">
          <spinner-loader theme="accent" />
        </div>
        <entity-history-column
          v-else-if="rightVersionEntity"
          :key="rightVersionId"
          :entity="rightVersionEntity"
          :wysiwyg-diffs="rightWysiwygDiffs"
          :relation-diffs="rightRelationDiffs"
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
  leftWysiwygDiffs,
  rightWysiwygDiffs,
  leftRelationDiffs,
  rightRelationDiffs,
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
}): DropdownOption => ({
  label: option.label,
  value: option.id,
  __typename: "DropdownOption",
});

const leftDropdownOptions = computed<DropdownOption[]>(() => [
  {
    label: t("history.current-version"),
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
