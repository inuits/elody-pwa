<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
  >
    <template v-slot:content>
      <div v-if="element.markdownContent" class="h-full bg-neutral-light p-4">
        <vue-markdown class="md" :source="element.markdownContent" />
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

<style>
.md h1 {
  font-size: 2em !important;
  font-weight: bold !important;
}
.md h2 {
  font-size: 1.5em !important;
  font-weight: bold !important;
}
.md h3 {
  font-size: 1.3em !important;
  font-weight: bold !important;
}
.md h4 {
  font-size: 1em !important;
  font-weight: bold !important;
}
.md h5 {
  font-size: 0.8em !important;
  font-weight: bold !important;
}
.md h6 {
  font-size: 0.7em !important;
  font-weight: bold !important;
}
</style>
