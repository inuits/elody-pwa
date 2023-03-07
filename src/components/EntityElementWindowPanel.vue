<template>
  <div class="border-solid border-neutral-30 border-2 p-2">
    <div class="flex items-center justify-between">
      <h2>{{ panel.label }}</h2>
      <div class="cursor-pointer"><unicon :name="Unicons.AngleUp.name" /></div>
    </div>
    <div v-for="(metadata, index) in metadataArray" :key="index" class="py-2">
      <entity-element-metadata :metadata="metadata" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PanelMetaData,
  WindowElementPanel,
} from "@/generated-types/queries";
import { computed } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import { Unicons } from "@/types";

const props = defineProps<{
  panel: WindowElementPanel;
}>();

const metadataArray = computed<PanelMetaData[]>(() => {
  const returnArray: PanelMetaData[] = [];

  Object.values(props.panel).forEach((value) => {
    if (typeof value !== "string") {
      returnArray.push(value);
    }
  });

  return returnArray;
});
</script>
