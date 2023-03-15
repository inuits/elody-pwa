<template>
  <div class="bg-accent-light rounded-t-lg">
    <div class="flex items-center justify-between">
      <span class="subtitle p-2">{{ label }}</span>
      <span @click="toggleElementCollapse(label)" class="p-2 cursor-pointer"
        ><unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
      /></span>
      <slot name="actions"></slot>
    </div>

    <slot name="content"></slot>
  </div>
</template>

<script lang="ts" setup>
import { Unicons } from "@/types";
import { useEntityElementCollapseHelper } from "@/composables/useResizeHelper";
const props = defineProps<{
  label: string;
  isCollapsed: Boolean;
}>();

const { toggleElementCollapse } = useEntityElementCollapseHelper();
</script>
