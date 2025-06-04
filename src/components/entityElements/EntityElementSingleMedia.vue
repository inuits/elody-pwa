<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions> </template>
    <template v-slot:content>
      <div class="h-[75vh] mx-1 mb-1 ">
        <media-viewer-new />
      </div>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import type { SingleMediaFileElement } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { provide } from "vue";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";

provide("mediafileViewerContext", "SingleMediaFileElement");

defineProps<{
  element: SingleMediaFileElement;
}>();
</script>
