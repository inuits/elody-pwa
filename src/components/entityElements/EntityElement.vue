<template>
  <div :class="'w-full flex flex-col'">
    <div
      v-for="(element, index) in elements"
      :key="index"
      :class="[
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
        :custom-query="element.customQuery"
        :entity-list="(element.entityList as Entity[]) ?? []"
        :identifiers="identifiers"
        :relationType="element.relationType"
      />
      <entity-element-media
        v-if="element.__typename === 'MediaFileElement'"
        :element="element"
        :identifiers="identifiers"
        :relationType="element.relationType"
      />
      <entity-element-single-media
        v-if="element.__typename === 'SingleMediaFileElement'"
        :element="element"
      />
      <entity-element-window
        v-if="element.__typename === 'WindowElement'"
        :element="element"
        :form-id="formId"
        :identifiers="identifiers"
      />
      <entity-element-graph
        v-if="element.__typename === 'GraphElement' && !isEdit"
        :element="element"
      />
      <entity-element-manifest-viewer
        v-if="element.__typename === 'ManifestViewerElement'"
        :element="element"
      />
      <entity-element-markdown-viewer
        v-if="element.__typename === 'MarkdownViewerElement'"
        :element="element"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import EntityElementGraph from "@/components/entityElements/EntityElementGraph.vue";
import EntityElementList from "@/components/entityElements/EntityElementList.vue";
import EntityElementManifestViewer from "@/components/entityElements/EntityElementManifestViewer.vue";
import EntityElementMedia from "@/components/entityElements/EntityElementMedia.vue";
import EntityElementSingleMedia from "@/components/entityElements/EntityElementSingleMedia.vue";
import EntityElementWindow from "@/components/entityElements/EntityElementWindow.vue";
import { computed } from "vue";
import { useEditMode } from "@/composables/useEdit";

import type {
  Entity,
  EntityListElement,
  EntityViewElements,
  GraphElement,
  ManifestViewerElement,
  MarkdownViewerElement,
  MediaFileElement,
  SingleMediaFileElement,
  WindowElement,
} from "@/generated-types/queries";
import { getEntityIdFromRoute } from "@/helpers";
import EntityElementMarkdownViewer from "@/components/entityElements/EntityElementMarkdownViewer.vue";

export type Elements =
  | EntityListElement
  | GraphElement
  | ManifestViewerElement
  | MarkdownViewerElement
  | MediaFileElement
  | SingleMediaFileElement
  | WindowElement;

const props = defineProps<{
  elements: EntityViewElements;
  identifiers: string[];
}>();

const { isEdit } = useEditMode();
const formId = computed(() => getEntityIdFromRoute() as string);
const elements = computed<Elements[]>(() => {
  const returnArray: Elements[] = [];
  const graphArray: Elements[] = [];
  Object.values(props.elements).forEach((value) => {
    if (value != null && typeof value !== "string") {
      if (value.__typename === "GraphElement") {
        value.isCollapsed = true;
        graphArray.push(value);
      } else returnArray.push(value);
    }
  });
  graphArray.forEach((graph) => returnArray.push(graph));
  return returnArray;
});
</script>
