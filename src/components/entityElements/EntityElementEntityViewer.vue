<template>
  <entity-single :key="element.entityId" :entity-id="element.entityId" />
</template>

<script setup lang="ts">
import type { EntityViewerElement } from "@/generated-types/queries";
import EntitySingle from "@/views/EntitySingle.vue";

const props = withDefaults(
  defineProps<{
    element: EntityViewerElement;
  }>(),
  {}
);
</script>
