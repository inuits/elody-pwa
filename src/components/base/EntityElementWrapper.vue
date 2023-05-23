<template>
  <div class="bg-accent-normal rounded-t-lg">
    <div class="flex items-center justify-between">
      <div class="flex p-2">
        <span class="subtitle mr-2">{{ label }}</span>
        <slot name="actions"></slot>
      </div>
      <span
        @click="toggleElementCollapse(label)"
        class="p-2 cursor-pointer text-text-subtitle"
        ><unicon
          :name="isCollapsed ? Unicons.AngleDown.name : Unicons.AngleUp.name"
      /></span>
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
