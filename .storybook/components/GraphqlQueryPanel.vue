<template>
  <div class="flex gap-6 items-start">
    <div class="flex-1 min-w-0">
      <slot />
    </div>
    <div class="flex-1 min-w-0 rounded-md border border-neutral-50 bg-neutral-20 overflow-hidden">
      <div
        class="px-3 py-1.5 text-xs font-semibold text-text-light border-b border-neutral-50"
      >
        {{ title }}
      </div>
      <pre
        class="p-3 text-xs leading-5 overflow-x-auto max-h-[32rem]"
      ><code>{{ printedQuery }}</code></pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { print, type DocumentNode } from "graphql";

const props = withDefaults(
  defineProps<{
    document: DocumentNode;
    title?: string;
  }>(),
  { title: "GraphQL" },
);

const printedQuery = computed(() => print(props.document));
</script>
