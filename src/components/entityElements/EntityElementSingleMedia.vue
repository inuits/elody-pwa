<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="elementLabel"
    :entity-id="entityId"
    class="flex flex-col h-full"
    @toggle-element-collapse="
      (entityId, elementLabel) =>
        emit('toggleElementCollapse', entityId, elementLabel)
    "
  >
    <template v-slot:actions> </template>
    <template v-slot:content>
      <div class="h-[75vh] mx-1 mb-1">
        <media-viewer-new />
      </div>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import type { SingleMediaFileElement } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { computed, provide } from "vue";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const mediafileViewerContextName = "SingleMediaFileElement";
provide("mediafileViewerContext", mediafileViewerContextName);

const emit = defineEmits<{
  (
    event: "toggleElementCollapse",
    entityId: string,
    elementLabel: string,
  ): void;
}>();

const props = defineProps<{
  element: SingleMediaFileElement;
}>();

const { mediafileSelectionState } = useEntityMediafileSelector();

const elementLabel = computed<string>(() => props.element.label);
const entityId = computed<string>(
  () =>
    mediafileSelectionState.value[mediafileViewerContextName].selectedMediafile!
      .id,
);
</script>
