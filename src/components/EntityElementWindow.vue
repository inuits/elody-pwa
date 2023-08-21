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
        <h1 class="subtitle text-text-body p-2">{{ t(element.label) }}</h1>
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
import { useI18n } from "vue-i18n";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";

const props = defineProps<{
  element: WindowElement;
}>();

const { t } = useI18n();
const { setColumnSizes, resetToDefaultSizes } = useColumnResizeHelper();
const { getEditableMetadataKeys } = useFormHelper();
const route = useRoute();

getEditableMetadataKeys(props.element, route.params.id as string);

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
  return returnArray;
});
</script>
