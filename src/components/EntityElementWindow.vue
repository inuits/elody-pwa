<template>
  <div class="h-full flex flex-1">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <div
      class="h-full overflow-y-scroll w-full border-solid border-neutral-30 border-2 bg-neutral-0 rounded-t-md"
    >
      <div class="border-solid border-neutral-30 border-b-2 pb-2 rounded-t-md">
        <h1 class="subtitle p-2">{{ element.label }}</h1>
      </div>

      <div v-for="(panel, index) in panels" :key="index">
        <entity-element-window-panel :panel="panel" />
      </div>
    </div>
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Right
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ColumnSizes,
  type WindowElement,
  type WindowElementPanel,
  Orientations,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "./EntityElementWindowPanel.vue";
import { computed } from "vue";
import BaseExpandButton from "./base/BaseExpandButton.vue";
import { useColumnResizeHelper } from "@/composables/useResizeHelper";

const props = defineProps<{
  element: WindowElement;
}>();

const { setColumnSizes, resetToDefaultSizes } = useColumnResizeHelper();

const resizeColumn = (toggled: Boolean) => {
  if (toggled) {
    setColumnSizes([ColumnSizes.Fifty, ColumnSizes.Fifty]);
  } else {
    resetToDefaultSizes();
  }
};

const panels = computed<WindowElementPanel[]>(() => {
  const returnArray: WindowElementPanel[] = [];

  Object.values(props.element).forEach((value) => {
    if (
      typeof value === "object" &&
      value?.__typename === "WindowElementPanel"
    ) {
      returnArray.push(value);
    }
  });
  console.log(returnArray);
  return returnArray;
});
</script>
