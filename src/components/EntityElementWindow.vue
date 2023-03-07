<template>
  <div class="h-full bg-neutral-0 rounded-md">
    <div class="border-solid border-neutral-30 border-2 pb-2">
      <h1 class="subtitle p-2">{{ element.label }}</h1>
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
