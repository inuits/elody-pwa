<template>
  <div
    :class="['bg-accent-normal']"
    v-if="baseLibraryMode === BaseLibraryModes.BasicBaseLibrary && showLabel"
  >
    <p class="text-text-subtitle text-xs">{{t(label)}}</p>
  </div>

  <div
    :class="['bg-accent-normal rounded-t-lg', { 'rounded-lg': isCollapsed }]"
  >
    <div
      v-if="baseLibraryMode === BaseLibraryModes.NormalBaseLibrary"
      class="flex items-center justify-between cursor-pointer"
      @click.self="toggleElementCollapse(label)"
    >
      <div class="flex p-2">
        <span class="subtitle mr-2">{{ t(label) }}</span>
        <slot name="actions"></slot>
      </div>
      <span
        class="p-2 text-text-subtitle"
        @click="toggleElementCollapse(label)"
      >
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </span>
    </div>
    <div class="h-full" v-if="!isCollapsed">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
import { useI18n } from "vue-i18n";
import { BaseLibraryModes } from "@/generated-types/queries";

const props = withDefaults(
  defineProps<{
    label: string;
    isCollapsed: Boolean;
    baseLibraryMode?: BaseLibraryModes;
    showLabel?: boolean;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    showLabel: true,
  }
);

const { t } = useI18n();
const { toggleElementCollapse } = useEntityElementCollapseHelper();
</script>
