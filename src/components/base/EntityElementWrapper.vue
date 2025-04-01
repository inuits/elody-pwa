<template>
  <div
    data-cy="entity-element-wrapper"
    :class="['bg-accent-normal rounded-t-lg', { 'rounded-lg': isCollapsed }]"
  >
    <div
      v-if="
        baseLibraryMode === BaseLibraryModes.NormalBaseLibrary ||
        baseLibraryMode === BaseLibraryModes.BasicBaseLibraryWithBorder
      "
      class="flex items-center justify-between cursor-pointer"
      @click.self="toggleElementCollapse(entityId, label)"
    >
      <div class="flex p-2">
        <span data-cy="entity-element-wrapper-title" class="subtitle mr-2">{{
          t(label)
        }}</span>
        <slot name="actions"></slot>
      </div>
      <span
        class="p-2 text-text-subtitle"
        @click="toggleElementCollapse(entityId, label)"
      >
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </span>
    </div>
    <div class="h-full" v-if="!useVshowInsteadOfVif && !isCollapsed">
      <slot name="content"></slot>
    </div>
    <div class="h-full" v-if="useVshowInsteadOfVif" v-show="!isCollapsed">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
import { useI18n } from "vue-i18n";
import { BaseLibraryModes } from "@/generated-types/queries";

withDefaults(
  defineProps<{
    label: string;
    entityId: string;
    isCollapsed: Boolean;
    baseLibraryMode?: BaseLibraryModes;
    useVshowInsteadOfVif?: boolean;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    useVshowInsteadOfVif: false,
  }
);

const { t } = useI18n();
const { toggleElementCollapse } = useEntityElementCollapseHelper();
</script>
