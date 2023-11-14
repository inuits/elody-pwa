<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions> </template>
    <template v-slot:content>
      <div class="h-[75vh]">
        <media-viewer />
      </div>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import type { SingleMediaFileElement } from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import MediaViewer from "@/components/base/Mediaviewer.vue";

defineProps<{
  element: SingleMediaFileElement;
}>();
</script>
