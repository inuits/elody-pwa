<template>
  <div data-cy="entity-element-window" class="h-full flex flex-1 mb-2">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <div
      class="h-full w-full border-solid border-neutral-30 border-2 bg-background-light rounded-t-md @container/window"
    >
      <div
        class="border-solid border-neutral-30 border-b-2 rounded-t-md flex flex-row"
      >
        <h1
          data-cy="entity-element-window-title"
          class="subtitle text-text-body p-2"
        >
          {{ previewLabel ? t(previewLabel) : t(element.label) }}
        </h1>

        <div
          v-if="element.windowElementStatus"
          class="flex gap-4 w-1/4 items-center"
        >
          <h2 v-if="element.windowElementStatus.label">{{ t(element.windowElementStatus.label) }}</h2>
          <MetadataWrapper
            class="w-full"
            :metadata="getStatusMetadata()"
            :form-id="formId"
            :isEdit="computedIsEdit"
          />
        </div>
      </div>
      <div
        :class="[
          {
            'grid grid-cols-2 gap-2 justify-items-center max-w-full':
              props.element.layout === WindowElementLayout.HorizontalGrid,
          },
        ]"
      >
        <div
          v-for="(panel, index) in filteredPanels"
          :key="index"
          :class="[
            'w-full',
            {
              'border-solid border-neutral-30 border-b-2':
                props.element.layout !== WindowElementLayout.HorizontalGrid,
            },
          ]"
        >
          <entity-history-window-panel
            :panel="panel"
            :identifiers="identifiers"
            :is-edit="computedIsEdit"
            :form-id="formId"
            :wysiwyg-diffs="wysiwygDiffs"
            :relation-diffs="relationDiffs"
          />
        </div>
      </div>
    </div>
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Right
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useEditMode } from "@/composables/useEdit";
import {
  DisplayCondition,
  Orientations,
  WindowElementLayout,
  type WindowElement,
  type WindowElementPanel,
} from "@/generated-types/queries";
import EntityHistoryWindowPanel from "@/components/history/EntityHistoryWindowPanel.vue";
import BaseExpandButton from "@/components/base/BaseExpandButton.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import type {
  RelationDiff,
  WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

const props = defineProps<{
  element: WindowElement;
  identifiers: string[];
  isEditOverwrite?: boolean;
  formId: string;
  previewLabel?: string;
  entityMetadata?: Record<string, any>;
  entityRelations?: Record<string, any>;
  wysiwygDiffs: WysiwygDiff[];
  relationDiffs: RelationDiff[];
}>();

const emit = defineEmits<{
  (event: "resizeColumn", toggled: boolean): void;
}>();

const { t } = useI18n();
const useEditHelper = useEditMode(props.formId);

const computedIsEdit = computed(
  () => props.isEditOverwrite || useEditHelper.isEdit,
);

const resizeColumn = (toggled: boolean) => {
  emit("resizeColumn", toggled);
};

const allPanels = computed<WindowElementPanel[]>(() => {
  return Object.values(props.element).filter(
    (value): value is WindowElementPanel =>
      typeof value === "object" && value?.__typename === "WindowElementPanel",
  );
});

const getPanelsAllowedToDisplay = (): WindowElementPanel[] => {
  return allPanels.value.filter((panel) => {
    if (panel.__typename !== 'WindowElementPanel') return true;
    const condition = (panel as WindowElementPanel).displayCondition as DisplayCondition | undefined;
    if (!condition?.key) return true;
    if (condition.value) return String(props.entityMetadata?.[condition.key]) === String(condition.value)
    return props.entityRelations?.[condition.key] !== undefined;
  })
};

const filteredPanels = computed<WindowElementPanel[]>(() =>
  getPanelsAllowedToDisplay(),
);

const { getStatusMetadata, registerEditableKey } = useWindowOrPanelStatus(
  computed(() => props.element.windowElementStatus),
  props.formId,
  computedIsEdit,
);

onMounted(() => {
  registerEditableKey();
});
</script>
