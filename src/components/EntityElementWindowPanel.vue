<template>
  <div class="border-solid border-neutral-30 border-b-2 p-2">
    <div class="flex items-center justify-between">
      <h2>{{ panel.label }}</h2>
      <div @click="toggleIsCollapsed()" class="cursor-pointer">
        <unicon :name="!isCollapsed ? Unicons.Minus.name : Unicons.Plus.name" />
      </div>
    </div>
    <transition>
      <div v-if="!isCollapsed">
        <div
          v-for="(metadata, index) in metadataArray"
          :key="index"
          class="py-2"
        >
          <entity-element-metadata :metadata="metadata" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import type {
  PanelMetaData,
  WindowElementPanel,
} from "@/generated-types/queries";
import { computed, ref } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import { Unicons } from "@/types";

const props = defineProps<{
  panel: WindowElementPanel;
}>();

const isCollapsed = ref<boolean>(false);

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

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

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: transform 0.5s ease;
  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);
  transform-origin: top;
}
</style>
