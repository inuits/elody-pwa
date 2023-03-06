<template>
  <div class="h-full p-2 bg-neutral-0 rounded-md">
    <div class="">
      <h1 class="subtitle">{{ element.label }}</h1>
    </div>

    <div v-for="(panel, index) in panels" :key="index">
      <entity-element-window-panel :panel="panel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  WindowElement,
  WindowElementPanel,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "./EntityElementWindowPanel.vue";
import { computed } from "vue";

const props = defineProps<{
  element: WindowElement;
}>();

const panels = computed<WindowElementPanel[]>(() => {
  const returnArray: WindowElementPanel[] = [];

  Object.values(props.element).forEach((value) => {
    if (typeof value !== "string") {
      returnArray.push(value);
    }
  });

  return returnArray;
});
</script>
