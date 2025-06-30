<template>
  <div
    data-cy="entity-element-wrapper"
    :class="['bg-accent-normal rounded-t-lg', { 'rounded-lg': isCollapsed }]"
  >
    <div
      v-if="
        baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
        baseLibraryMode === BaseLibraryModes.BasicBaseLibraryWithBorder ||
        baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary
      "
      :class="[
        'flex items-center justify-between relative',
        { 'cursor-pointer': !isPreviewElement },
      ]"
      @click.self="
        toggleElementCollapse(entityId, label, undefined, isPreviewElement)
      "
    >
      <div class="flex p-2">
        <base-tooltip
          v-if="baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary"
          position="top-right"
          :tooltip-offset="8"
          @click="emit('closePreviewComponent')"
        >
          <template #activator="{ on }">
            <div class="flex items-center" v-on="on">
              <unicon
                class="cursor-pointer mr-4 flex justify-center items-center"
                :name="Unicons.Cross.name"
                height="24"
              />
            </div>
          </template>
          <template #default>
            <span class="text-sm text-text-placeholder">
              <div>
                {{ t("preview-component.close") }}
              </div>
            </span>
          </template>
        </base-tooltip>
        <span
          data-cy="entity-element-wrapper-title"
          class="subtitle mr-2"
          :class="[
            {
              'text-center absolute left-1/2 transform -translate-x-1/2':
                baseLibraryMode === BaseLibraryModes.PreviewBaseLibrary,
            },
          ]"
          >{{ previewLabel ? previewLabel : t(label) }}</span
        >
        <slot name="actions"></slot>
      </div>
      <span
        v-if="!isPreviewElement"
        class="p-2 text-text-subtitle"
        @click="toggleElementCollapse(entityId, label)"
      >
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </span>
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
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
import { useI18n } from "vue-i18n";
import { BaseLibraryModes } from "@/generated-types/queries";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { inject } from "vue";

withDefaults(
  defineProps<{
    label: string;
    entityId: string;
    isCollapsed: Boolean;
    baseLibraryMode?: BaseLibraryModes;
    useVshowInsteadOfVif?: boolean;
    previewLabel?: string;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    useVshowInsteadOfVif: false,
    previewLabel: undefined,
  },
);
const emit = defineEmits(["closePreviewComponent"]);
const isPreviewElement: boolean = inject("IsPreviewElement", false);

const { t } = useI18n();
const { toggleElementCollapse } = useEntityElementCollapseHelper();
</script>
