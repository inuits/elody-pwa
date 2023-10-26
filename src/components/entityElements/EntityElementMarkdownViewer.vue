<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="h-[80vh]"
  >
    <template v-slot:content>
      <div
        id="app"
        v-if="element.markdownContent"
        class="h-full bg-neutral-light p-4"
      >
        <vue-markdown :source="element.markdownContent" />
      </div>
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import type { MarkdownViewerElement } from "@/generated-types/queries";
import VueMarkdown from "vue-markdown-render";

const props = defineProps<{ element: MarkdownViewerElement }>();
</script>
