<template>
  <h1>{{ element.label }}</h1>
  <div v-for="(panel, index) in panels" :key="index">
    <entity-element-window-panel :panel="panel" />
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
