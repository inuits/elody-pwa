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
        :isCollapsed="element.isCollapsed"
        :types="element.entityTypes as string[]"
        :metaKey="element.metaKey"
        :entity-list="(element.entityList as Entity[]) ?? []"
        :identifiers="identifiers"
        :relationType="element.relationType"
      />
      <entity-element-media
        v-if="element.__typename === 'MediaFileElement'"
        :element="element"
        :identifiers="identifiers"
      />
      <entity-element-window
        v-if="element.__typename === 'WindowElement'"
        :element="element"
        :form-id="formId"
        :identifiers="identifiers"
      />
      <entity-element-prom-graph
        v-if="element.__typename === 'PromGraphElement'"
        :element="element"
      />
      <entity-element-manifest-viewer
          v-if="element.__typename === 'ManifestViewerElement'"
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
import EntityElementManifestViewer from "./EntityElementManifestViewer.vue";

import type {
  EntityViewElements,
  WindowElement,
  MediaFileElement,
  EntityListElement,
  PromGraphElement,
  ManifestViewerElement,
  Entity,
} from "@/generated-types/queries";
import { getEntityIdFromRoute } from "@/helpers";

export type Elements =
  | WindowElement
  | MediaFileElement
  | EntityListElement
  | PromGraphElement
  | ManifestViewerElement;

const props = defineProps<{
  elements: EntityViewElements;
  identifiers: string[];
}>();

const formId = computed(() => getEntityIdFromRoute() as string);
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
