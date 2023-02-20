<template>
  <h2>{{ panel.label }}</h2>
  <div v-for="(metadata, index) in metadataArray" :key="index">
    <entity-element-metadata :metadata="metadata" />
  </div>
</template>

<script lang="ts" setup>
import type {
  PanelMetaData,
  WindowElementPanel,
} from "@/generated-types/queries";
import { computed } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";

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
