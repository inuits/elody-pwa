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
        <div v-if="metadataArray.length">
          <div
            v-for="(metadata, index) in metadataArray"
            :key="index"
            class="py-2"
          >
            <entity-element-metadata :metadata="metadata" />
          </div>
        </div>
        <div v-if="relationArray.length">
          <div class="pl-2 rounded-sm bg-accent-light">
            <p class="text-sm text-text-body">Behoort tot</p>
            <div class="rounded-sm border-solid border-neutral-30 border-2">
              <div
                v-for="(relation, index) in relationArray"
                :key="index"
                class="bg-neutral-white py-2"
              >
                <entity-element-relation :relation="relation" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import type {
  PanelMetaData,
  PanelRelation,
  WindowElementPanel,
} from "@/generated-types/queries";
import { PanelType } from "@/generated-types/queries";
import { computed, ref } from "vue";
import EntityElementMetadata from "./EntityElementMetadata.vue";
import EntityElementRelation from "./EntityElementRelation.vue";
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
  if (props.panel.panelType !== PanelType.Relation) {
    Object.values(props.panel).forEach((value, index) => {
      if (typeof value !== "string") {
        returnArray.push(value as PanelMetaData);
      }
    });
  }

  return returnArray;
});

const relationArray = computed<PanelRelation[]>(() => {
  const returnArray: PanelRelation[] = [];
  if (props.panel.panelType === PanelType.Relation) {
    Object.values(props.panel).forEach((value, index) => {
      if (typeof value !== "string") {
        const relationList = value as [PanelRelation];
        returnArray.push(...relationList);
      }
    });
  }

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
