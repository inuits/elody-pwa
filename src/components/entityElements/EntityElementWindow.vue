<template>
  <div data-cy="entity-element-window" class="h-full flex flex-1">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <!-- panel-and-block-shells.md: PanelShell — white card, 1px panel
         border, accent-light header band, no shadow. -->
    <!-- In a preview the preview panel is the shell (preview-panel.md). -->
    <section
      :role="compact ? undefined : 'region'"
      :aria-labelledby="compact ? undefined : titleId"
      class="h-full w-full @container/window"
      :class="{
        'bg-surface border border-border-panel rounded-card': !compact,
      }"
    >
      <!-- The header wraps: in a narrow window (a WEM column) the status
           gets a line of its own instead of being squeezed. -->
      <div
        v-if="!compact"
        data-cy="window-header"
        class="flex flex-row flex-wrap items-center gap-2 p-(--panel-header-pad) bg-surface-panel-header border-b border-border-panel rounded-t-card"
      >
        <h3
          :id="titleId"
          data-cy="entity-element-window-title"
          class="m-0 text-(length:--text-panel-title) font-black text-text-panel-header"
        >
          {{ previewLabel ? t(previewLabel) : t(element.label) }}
        </h3>

        <!-- The status is as wide as its content: the whole pill at rest;
             while edited in place the dropdown (at its options' width), then
             Annuleer, so the button never covers the dropdown. On a
             line of its own the dropdown does not stretch either. -->
        <div
          v-if="element.windowElementStatus"
          data-cy="window-header-status"
          class="flex gap-4 min-w-0 items-center [&_[data-cy=inline-editor-input]]:grow-0"
        >
          <MetadataWrapper
            class="w-full"
            :metadata="getStatusMetadata()"
            :form-id="formId"
            :isEdit="computedIsEdit"
            :show-errors="useEditHelper.showErrors"
          />
        </div>

        <MetadataEditButton
          class="my-2"
          v-if="
            auth.isAuthenticated.value === true &&
            element.editMetadataButton?.hasButton &&
            showEditMetadataButton
          "
          button-size="sm"
          :readmode-label="element.editMetadataButton.readmodeLabel"
          :editmode-label="element.editMetadataButton.editmodeLabel"
        />
        <div
          class="flex align-center"
          :class="{ 'ml-auto': !showEditMetadataButton }"
          v-if="
            auth.isAuthenticated.value === true && element.contextMenuActions
          "
        >
          <BaseContextMenuActions
            :context-menu-actions="element.contextMenuActions"
            :parent-entity-id="formId"
            :context-label="previewLabel ? t(previewLabel) : t(element.label)"
          />
        </div>
      </div>
      <div
        data-cy="window-body"
        :class="[
          compact ? undefined : 'p-(--panel-body-pad)',
          {
            'grid grid-cols-2 gap-2 justify-items-center max-w-full':
              props.element.layout === WindowElementLayout.HorizontalGrid,
          },
        ]"
      >
        <div
          v-for="(panel, index) in filteredPanels"
          :key="index"
          data-cy="window-block"
          :class="[
            'w-full',
            {
              'border-b border-border-faint last:border-b-0':
                props.element.layout !== WindowElementLayout.HorizontalGrid,
            },
          ]"
        >
          <entity-element-window-panel
            :panel="panel"
            :identifiers="identifiers"
            :is-edit="computedIsEdit"
            :form-id="formId"
          />
        </div>
      </div>
    </section>
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
import { computed, inject, onMounted, useId, provide } from "vue";
import { useI18n } from "vue-i18n";
import { auth } from "@/main";
import { useEditMode } from "@/composables/useEdit";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  DisplayCondition,
  Orientations,
  WindowElementLayout,
  type WindowElement,
  type WindowElementPanel,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "../windowPanel/EntityElementWindowPanel.vue";
import BaseExpandButton from "../base/BaseExpandButton.vue";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import BaseContextMenuActions from "@/components/BaseContextMenuActions.vue";

// Lists and viewers inside know they sit in a panel (no chrome of their own).
provide("InsidePanel", true);

const compact: boolean = inject("CompactPreview", false);
const titleId = useId();
const props = defineProps<{
  element: WindowElement;
  identifiers: string[];
  isEditOverwrite?: boolean;
  formId: string;
  previewLabel?: string;
  entityMetadata?: Record<string, any>;
  entityRelations?: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "resizeColumn", toggled: boolean): void;
}>();

const { t } = useI18n();
const { getForm } = useFormHelper();
const useEditHelper = useEditMode(props.formId);

const computedIsEdit = computed(
  () => props.isEditOverwrite || useEditHelper.isEdit,
);

const showEditMetadataButton = computed(() => {
  const key = props.element.editMetadataButton?.hideIfMetadataNotPresent;
  if (!key) return true;
  const form = getForm(props.formId);
  if (!form) return true;
  const value = form.values.intialValues?.[key];
  return value !== undefined && value !== null && value !== "";
});

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
    if (panel.__typename !== "WindowElementPanel") return true;
    const condition = (panel as WindowElementPanel).displayCondition as
      | DisplayCondition
      | undefined;
    if (!condition?.key) return true;
    if (condition.value)
      return (
        String(props.entityMetadata?.[condition.key]) ===
        String(condition.value)
      );
    return props.entityRelations?.[condition.key] !== undefined;
  });
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
