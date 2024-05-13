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
        :label="element.label as string"
        :type="element.type"
        :isCollapsed="element.isCollapsed"
        :types="element.entityTypes as string[]"
        :custom-query="element.customQuery"
        :custom-query-relation-type="element.customQueryRelationType"
        :custom-query-filters="element.customQueryFilters"
        :search-input-type="element.searchInputType"
        :entity-list="(element.entityList as Entity[]) ?? []"
        :identifiers="identifiers"
        :relationType="element.relationType"
        :entity-uuid="uuid"
        :entity-list-elements="getObjectsBasedOnTypename(element, 'EntityListElement')"
        :base-library-mode="element.baseLibraryMode"
      />
      <entity-element-media
        v-if="element.__typename === 'MediaFileElement'"
        :element="element"
        :identifiers="identifiers"
        :relationType="element.relationType"
        :entity-uuid="uuid"
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
import { computed, watch, } from "vue";
import { useEditMode } from "@/composables/useEdit";
import { useRoute } from "vue-router";

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
import EntityElementMarkdownViewer from "@/components/entityElements/EntityElementMarkdownViewer.vue";
import { getObjectsBasedOnTypename } from "@/helpers";
import { useStateManagement } from "@/composables/useStateManagement";

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
  uuid: string;
}>();

const formId = computed(() => props.uuid);
const { isEdit } = useEditMode();
const { getStateForRoute, updateStateForRoute } = useStateManagement();
const route = useRoute();

const elements = computed<Elements[]>(() => {
  const returnArray: Elements[] = [];
  const graphArray: Elements[] = [];
  Object.values(props.elements).forEach((value) => {
    if (value != null && typeof value !== "string") {
      const collapsedState = getCollapsedStateForElement(value);
      if (collapsedState !== undefined)
        value.isCollapsed = collapsedState;
      if (value.__typename === "GraphElement") {
        value.isCollapsed = true;
        graphArray.push(value);
      } else returnArray.push(value);
    }
  });
  graphArray.forEach((graph) => returnArray.push(graph));
  return returnArray;
});

const getCollapsedStateForElement = (element: object): boolean => {
  if (!element.entityTypes) return;
  const state = getStateForRoute(route);
  return state?.UIPanelStateCollapsed.filter((panelState) => panelState.key === element.entityTypes[0])[0]?.value;
}

watch(
  () => isEdit.value,
  () => {
    if (isEdit.value) {
      const state: [{ key: string, value: boolean }] = []
      elements.value.forEach((element) => {
        if (element.entityTypes === undefined) return;
        state.push({ key: element.entityTypes[0], value: element.isCollapsed });
      })
      if (state.length > 0)
        updateStateForRoute(route, {
          UIPanelStateCollapsed: state
        });
    }
  }
);
</script>
