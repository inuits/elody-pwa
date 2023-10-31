<template>
  <div
    :class="['bg-accent-normal rounded-t-lg', { 'rounded-lg': isCollapsed }]"
  >
    <div
      @click="toggleElementCollapse(label)"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex p-2">
        <span class="subtitle mr-2">{{ t(label) }}</span>
        <slot name="actions"></slot>
      </div>
      <span class="p-2 text-text-subtitle">
        <unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
        />
      </span>
    </div>
    <div v-if="!isCollapsed"><slot name="content"></slot></div>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
import { useI18n } from "vue-i18n";

defineProps<{
  label: string;
  isCollapsed: Boolean;
}>();

const { t } = useI18n();
const { toggleElementCollapse } = useEntityElementCollapseHelper();
</script>
