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
  display: block;
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md h2 {
  display: block;
  font-size: 1.5em;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md h3 {
  display: block;
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md h4 {
  display: block;
  margin-top: 1.33em;
  margin-bottom: 1.33em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md h5 {
  display: block;
  font-size: 0.83em;
  margin-top: 1.67em;
  margin-bottom: 1.67em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md h6 {
  display: block;
  font-size: 0.67em;
  margin-top: 2.33em;
  margin-bottom: 2.33em;
  margin-left: 0;
  margin-right: 0;
  font-weight: bold;
}
.md a {
  text-decoration: underline;
}
</style>
