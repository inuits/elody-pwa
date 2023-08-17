<template>
  <div :class="'w-full flex flex-col'">
    <div
      v-for="(element, index) in elements"
      :key="index"
      :class="[
        'overflow-y-scroll',
        { 'mb-5': index + 1 != elements.length },
        {
          'flex-1': !element.isCollapsed,
        },
      ]"
    >
      <entity-element-list
        v-if="element.__typename === 'EntityListElement'"
        :label="(element.label as string)"
        RelationKey="relatie"
        :isCollapsed="element.isCollapsed"
        :types="element.entityTypes as String[]"
        :metaKey="element.metaKey"
        :entity-list="(element.entityList as Entity[]) ?? []"
      />
      <entity-element-media
        v-if="element.__typename === 'MediaFileElement'"
        :element="element"
      />
      <entity-element-window
        v-if="element.__typename === 'WindowElement'"
        :element="element"
      />
      <entity-element-prom-graph
        v-if="element.__typename === 'PromGraphElement'"
        :element="element"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import EntityElementList from "./EntityElementList.vue";
import EntityElementMedia from "./EntityElementMedia.vue";
import EntityElementWindow from "./EntityElementWindow.vue";
import EntityElementPromGraph from "./EntityElementPromGraph.vue";

import type {
  EntityViewElements,
  WindowElement,
  MediaFileElement,
  EntityListElement,
  GraphElement,
  Entity,
} from "@/generated-types/queries";

export type Elements =
  | WindowElement
  | MediaFileElement
  | EntityListElement
  | GraphElement;

const props = defineProps<{
  elements: EntityViewElements;
}>();

const elements = computed<Elements[]>(() => {
  const returnArray: Elements[] = [];

  Object.values(props.elements).forEach((value) => {
    if (value != null && typeof value !== "string") {
      returnArray.push(value);
    }
  });
  return returnArray;
});
</script>
