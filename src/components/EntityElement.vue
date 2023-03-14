<template>
  <div :class="'max-h-full w-full flex flex-col'">
    <div
      v-for="(element, index) in elements"
      :key="index"
      :class="[
        'flex-1 overflow-y-scroll',
        { 'mb-5': index + 1 != elements.length },
      ]"
    >
      <entity-element-list
        v-if="element.__typename === 'EntityListElement'"
        RelationKey="relatie"
      />
      <entity-element-media
        v-if="element.__typename === 'MediaFileElement'"
        :label="element.label"
      />
      <entity-element-window
        v-if="element.__typename === 'WindowElement'"
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

import type {
  EntityViewElements,
  WindowElement,
  MediaFileElement,
  EntityListElement,
} from "@/generated-types/queries";

type Elements = WindowElement | MediaFileElement | EntityListElement;

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
