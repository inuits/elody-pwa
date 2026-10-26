<template>
  <div
    data-cy="entity-element-wrapper"
    class="bg-surface border border-border-panel rounded-card"
  >
    <!-- panel-and-block-shells.md: PanelShell — white card, accent-light
         header band; the gold section-header fill is not for panels. -->
    <div
      v-if="
        (baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
          baseLibraryMode === BaseLibraryModes.BasicBaseLibraryWithBorder ||
          baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary) &&
        headerStyle !== 'none'
      "
      data-cy="entity-element-wrapper-header"
      :class="[
        'flex items-center justify-between relative p-(--panel-header-pad) bg-surface-panel-header',
        isCollapsed ? 'rounded-card' : 'rounded-t-card border-b border-border-panel',
        { 'cursor-pointer': !isPreviewElement },
      ]"
      @click.self="emit('toggleElementCollapse', entityId, label)"
    >
      <div class="flex items-center gap-2">
        <h3
          data-cy="entity-element-wrapper-title"
          class="m-0 text-(length:--text-panel-title) font-black text-text-panel-header"
          :class="[
            {
              'text-center absolute left-1/2 transform -translate-x-1/2':
                baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
            },
          ]"
          >{{ previewLabel ? previewLabel : t(label) }}</h3
        >
        <slot name="actions"></slot>
      </div>
      <span
        v-if="!isPreviewElement"
        class="flex text-text-panel-header"
        @click="emit('toggleElementCollapse', entityId, label)"
      >
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </span>
    </div>
    <transition name="collapse">
      <div v-if="!useVshowInsteadOfVif && !isCollapsed">
        <div
          data-cy="entity-element-wrapper-content"
          class="h-full min-h-0 p-(--panel-body-pad) @container/wrapper-content"
        >
          <slot name="content"></slot>
        </div>
      </div>
    </transition>
    <transition name="collapse">
      <div v-if="useVshowInsteadOfVif" v-show="!isCollapsed">
        <div
          data-cy="entity-element-wrapper-content"
          class="h-full min-h-0 p-(--panel-body-pad) @container/wrapper-content"
        >
          <slot name="content"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import { BaseLibraryModes } from "@/generated-types/queries";
import { inject, provide } from "vue";

// Lists and viewers inside know they sit in a panel (no chrome of their own).
provide("InsidePanel", true);

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
/* Animate the real layout height so collapsing is as smooth as expanding.
   overflow is only hidden while animating, otherwise dropdowns inside the
   content get clipped. */
.collapse-enter-active,
.collapse-leave-active {
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: grid-template-rows 200ms ease-out;
}

.collapse-enter-from,
.collapse-leave-to {
  grid-template-rows: 0fr;
}
</style>
