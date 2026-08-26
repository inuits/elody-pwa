<template>
  <div
    data-cy="entity-element-wrapper"
    class="element-wrapper"
    :class="{ 'element-wrapper--accent-top': headerStyle === 'none' }"
  >
    <div
      v-if="
        (baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
          baseLibraryMode === BaseLibraryModes.BasicBaseLibraryWithBorder ||
          baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary) &&
        headerStyle !== 'none'
      "
      class="element-wrapper__header"
      :class="{ 'cursor-pointer': !isPreviewElement }"
      @click.self="emit('toggleElementCollapse', entityId, label)"
    >
      <base-tooltip
        v-if="baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary"
        position="top-right"
        :tooltip-offset="8"
        @click="emit('closePreviewComponent')"
      >
        <template #activator="{ on }">
          <button
            type="button"
            class="element-wrapper__close"
            data-cy="close-preview-component"
            :aria-label="t('preview-component.close')"
            v-on="on"
          >
            <unicon :name="Unicons.Cross.name" height="24" />
          </button>
        </template>
        <template #default>
          <span>
            <div>
              {{ t("preview-component.close") }}
            </div>
          </span>
        </template>
      </base-tooltip>
      <span
        data-cy="entity-element-wrapper-title"
        class="element-wrapper__title"
        :class="[
          {
            'text-center absolute left-1/2 transform -translate-x-1/2':
              baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
          },
        ]"
        >{{ previewLabel ? previewLabel : t(label) }}</span
      >
      <slot name="actions"></slot>
      <button
        v-if="!isPreviewElement"
        type="button"
        class="element-wrapper__toggle"
        :aria-expanded="!isCollapsed"
        :aria-label="t(isCollapsed ? 'tree.expand' : 'tree.collapse')"
        @click="emit('toggleElementCollapse', entityId, label)"
      >
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </button>
    </div>
    <div
      class="h-full @container/wrapper-content"
      v-if="!useVshowInsteadOfVif && !isCollapsed"
    >
      <slot name="content"></slot>
    </div>
    <div
      class="h-full @container/wrapper-content"
      v-if="useVshowInsteadOfVif"
      v-show="!isCollapsed"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { BaseLibraryModes } from "@/generated-types/queries";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { inject } from "vue";

withDefaults(
  defineProps<{
    label: string;
    entityId: string;
    isCollapsed: boolean;
    baseLibraryMode?: BaseLibraryModes;
    useVshowInsteadOfVif?: boolean;
    previewLabel?: string;
    headerStyle?: "normal" | "none";
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    useVshowInsteadOfVif: false,
    previewLabel: undefined,
    headerStyle: "normal",
  },
);

const emit = defineEmits<{
  (event: "closePreviewComponent"): void;
  (
    event: "toggleElementCollapse",
    entityId: string,
    elementLabel: string,
  ): void;
}>();

const isPreviewElement: boolean = inject("IsPreviewElement", false);

const { t } = useI18n();
</script>

<style scoped>
/*
 * Embedded panels wear the same chrome as BasePanelShell (an 8px card with a
 * 1px panel border, accent-light header); this wrapper only adds the
 * collapse/close affordances the shell has no business knowing about.
 */
.element-wrapper {
  /*
   * An outline, not a border: embedded panels host container-query layouts
   * (LibraryBar flips to a row at @md), and a border eats 2px of container
   * width — enough to flip the toolbar to its stacked layout in the detail
   * side column. The outline draws the same 1px panel hairline outside the
   * box, so the content keeps its full width.
   */
  outline: 1px solid var(--color-border-panel);
  border-radius: var(--radius-card);
  background-color: var(--color-surface);
  box-shadow: none;
}

/* Headerless variant keeps a slim accent cue so the block still reads as one. */
.element-wrapper--accent-top {
  border-top: 4px solid var(--color-accent);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
}

.element-wrapper__header {
  display: flex;
  align-items: center;
  position: relative;
  gap: var(--spacing-ds-5);
  padding: var(--spacing-ds-8) var(--spacing-ds-11);
  background-color: var(--color-surface-panel-header);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.element-wrapper__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-text-panel-header);
  /* Header clicks toggle via @click.self; the title must not swallow them. */
  pointer-events: none;
}

.element-wrapper__close,
.element-wrapper__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-chip);
  color: var(--color-text-panel-header);
  cursor: pointer;
}

.element-wrapper__toggle {
  margin-left: auto;
}

.element-wrapper__close:focus-visible,
.element-wrapper__toggle:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
</style>
